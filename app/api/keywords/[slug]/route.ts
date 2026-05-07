import { NextResponse } from "next/server";
import { getKeywordPage } from "@/lib/keyword-data";

// GET /api/keywords/:slug
// Backend hand-off stub — returns keyword page data as JSON.
// Backend replaces lib/keyword-data.ts stubs with Supabase queries;
// this route does not need to change.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getKeywordPage(slug);

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
