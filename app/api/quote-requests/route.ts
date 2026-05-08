import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  FROM_ADDRESS,
  vendorNotificationSubject,
  vendorNotificationHtml,
  buyerConfirmationSubject,
  buyerConfirmationHtml,
} from '@/lib/emails';

// In-memory rate limit store: ipHash → [timestamp, ...]
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const times = (rateLimitMap.get(ipHash) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (times.length >= RATE_LIMIT_MAX) return false;
  times.push(now);
  rateLimitMap.set(ipHash, times);
  return true;
}

function hashIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? 'unknown';
  const ip = forwarded.split(',')[0].trim();
  return createHash('sha256').update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    vendorIds,
    buyerEmail,
    buyerCompany,
    quantityDesc,
    deadlineDate,
    requirements,
    consentCollection,
    consentThirdParty,
    _honey,
  } = body as Record<string, unknown>;

  // 1. Honeypot — fake 201, skip real processing
  if (_honey) {
    return NextResponse.json({ quoteRequestId: 'fake' }, { status: 201 });
  }

  // 2. Consent validation (PIPA §15, §17)
  if (consentCollection !== true || consentThirdParty !== true) {
    return NextResponse.json(
      { error: '개인정보 수집 및 제3자 제공 동의가 필요합니다.' },
      { status: 400 }
    );
  }

  // 3. Basic field validation
  if (!buyerEmail || typeof buyerEmail !== 'string' || buyerEmail.length > 255) {
    return NextResponse.json({ error: 'buyerEmail is required (max 255)' }, { status: 400 });
  }
  if (!Array.isArray(vendorIds) || vendorIds.length < 1 || vendorIds.length > 3) {
    return NextResponse.json({ error: 'vendorIds must be 1–3 items' }, { status: 400 });
  }
  if (requirements !== undefined && typeof requirements === 'string') {
    if (requirements.length < 10 || requirements.length > 2000) {
      return NextResponse.json(
        { error: 'requirements must be 10–2000 characters' },
        { status: 400 }
      );
    }
  }
  if (
    deadlineDate !== undefined &&
    deadlineDate !== null &&
    typeof deadlineDate === 'string' &&
    !/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate)
  ) {
    return NextResponse.json({ error: 'deadlineDate must be ISO date (YYYY-MM-DD)' }, { status: 400 });
  }

  // 4. Rate limiting
  const ipHash = hashIp(req);
  if (!checkRateLimit(ipHash)) {
    return NextResponse.json(
      { error: '요청 한도 초과. 10분 후 다시 시도해 주세요.' },
      { status: 429 }
    );
  }

  const supabase = createSupabaseServer();

  // 5. Vendor existence + is_hidden check
  const { data: vendors, error: vendorErr } = await supabase
    .from('companies')
    .select('id, business_name, packlinx_slug, email')
    .in('id', vendorIds as string[])
    .eq('is_hidden', false);

  if (vendorErr) {
    console.error('[quote-requests] vendor fetch error', vendorErr);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  if (!vendors || vendors.length !== (vendorIds as string[]).length) {
    return NextResponse.json(
      { error: '유효하지 않은 vendorId가 포함되어 있습니다.' },
      { status: 400 }
    );
  }

  // 6. DB INSERT quote_request (status=pending)
  const now = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from('quote_requests')
    .insert({
      vendor_ids: vendorIds as string[],
      buyer_email: buyerEmail as string,
      buyer_company: (buyerCompany as string | undefined) ?? null,
      quantity_desc: (quantityDesc as string | undefined) ?? null,
      deadline_date: (deadlineDate as string | undefined) ?? null,
      requirements: (requirements as string | undefined) ?? null,
      status: 'pending',
      ip_hash: ipHash,
      consent_collection: true,
      consent_collection_at: now,
      consent_third_party: true,
      consent_third_party_at: now,
    })
    .select('id')
    .single();

  if (insertErr || !inserted) {
    console.error('[quote-requests] insert error', insertErr);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  const quoteRequestId: string = inserted.id;

  // 8. Send vendor emails
  const resend = new Resend(process.env.RESEND_API_KEY);
  const vendorNames: string[] = [];
  for (const vendor of vendors) {
    vendorNames.push(vendor.business_name);
    if (!vendor.email) {
      console.log(`[quote-requests] skip vendor email: no email for vendor ${vendor.id}`);
      continue;
    }
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: vendor.email,
        subject: vendorNotificationSubject({
          vendorName: vendor.business_name,
          vendorSlug: vendor.packlinx_slug ?? vendor.id,
          buyerEmail: buyerEmail as string,
          buyerCompany: buyerCompany as string | undefined,
          quantityDesc: quantityDesc as string | undefined,
          deadlineDate: deadlineDate as string | undefined,
          requirements: requirements as string | undefined,
        }),
        text: vendorNotificationHtml({
          vendorName: vendor.business_name,
          vendorSlug: vendor.packlinx_slug ?? vendor.id,
          buyerEmail: buyerEmail as string,
          buyerCompany: buyerCompany as string | undefined,
          quantityDesc: quantityDesc as string | undefined,
          deadlineDate: deadlineDate as string | undefined,
          requirements: requirements as string | undefined,
        }),
      });
    } catch (err) {
      console.error(`[quote-requests] vendor email send failed for ${vendor.id}`, err);
    }
  }

  // 9. Send buyer confirmation email
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: buyerEmail as string,
      subject: buyerConfirmationSubject({
        buyerEmail: buyerEmail as string,
        buyerCompany: buyerCompany as string | undefined,
        vendorNames,
        quantityDesc: quantityDesc as string | undefined,
        deadlineDate: deadlineDate as string | undefined,
      }),
      text: buyerConfirmationHtml({
        buyerEmail: buyerEmail as string,
        buyerCompany: buyerCompany as string | undefined,
        vendorNames,
        quantityDesc: quantityDesc as string | undefined,
        deadlineDate: deadlineDate as string | undefined,
      }),
    });
  } catch (err) {
    console.error('[quote-requests] buyer confirmation email send failed', err);
  }

  // 10. DB UPDATE status=sent
  const { error: updateErr } = await supabase
    .from('quote_requests')
    .update({ status: 'sent' })
    .eq('id', quoteRequestId);
  if (updateErr) {
    console.error('[quote-requests] status update error', updateErr);
  }

  return NextResponse.json({ quoteRequestId }, { status: 201 });
}
