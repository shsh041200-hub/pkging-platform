import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Packlinx 블로그'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function OgImage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', decodedSlug)
    .eq('status', 'published')
    .eq('content_type', 'blog')
    .single()

  const title = post?.title ?? 'Packlinx 블로그'
  const excerpt = post?.excerpt ?? 'B2B 패키징 인사이트'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0A0F1E',
          display: 'flex',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 600,
            height: 630,
            background: 'linear-gradient(135deg, #001a4d 0%, #0A0F1E 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: 100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,94,255,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Blue accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: 630,
            background: '#005EFF',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 0,
            width: 820,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 4,
              color: '#005EFF',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            PACKLINX BLOG
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 30 ? 42 : 52,
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: -1,
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          {excerpt && (
            <div
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                maxWidth: 680,
              }}
            >
              {excerpt.length > 80 ? excerpt.slice(0, 80) + '…' : excerpt}
            </div>
          )}
        </div>

        {/* Brand — right column */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 260,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            gap: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: 6,
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            PACK
          </div>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 40,
              fontWeight: 200,
              letterSpacing: 6,
              color: '#005EFF',
              lineHeight: 1,
            }}
          >
            LINX
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              marginTop: 12,
              letterSpacing: 1,
            }}
          >
            전국 패키징 B2B
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
