import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Venture Atlas — Startup & Business News in 60 Words';
    const section = searchParams.get('section') || 'Venture Capital';
    const date = searchParams.get('date') || 'Executive Dispatch';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#090a0f',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            color: '#f8fafc',
          }}
        >
          {/* Top Bar: Brand + Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '22px',
                  color: '#ffffff',
                }}
              >
                VA
              </div>
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                Venture Atlas
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {section}
            </div>
          </div>

          {/* Main Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: title.length > 70 ? '46px' : '56px',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                color: '#ffffff',
                margin: 0,
                textTransform: 'none',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Footer: Freshness & Format Promise */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '15px', color: '#94a3b8' }}>
              <span>⚡ 60-WORD EXECUTIVE BRIEF</span>
              <span>•</span>
              <span>VERIFIED VENTURE SOURCES</span>
            </div>
            <div style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>
              ventureatlas.in
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
