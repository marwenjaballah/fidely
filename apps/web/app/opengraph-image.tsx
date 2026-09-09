import { ImageResponse } from "next/og"

export const alt = "SaaS Boilerplate — Next.js + Hono starter"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",
          color: "#fafaf9",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 20,
              borderRadius: 24,
              background: "rgba(249, 115, 22, 0.14)",
              border: "2px solid rgba(249, 115, 22, 0.45)",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "3px solid #fb923c",
                }}
              />
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "3px solid #fb923c",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "3px solid #fb923c",
                }}
              />
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "3px solid #fb923c",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
            <div style={{ fontSize: 62, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              SaaS Boilerplate
            </div>
            <div style={{ fontSize: 30, color: "#94a3b8", lineHeight: 1.3 }}>
              Next.js + Hono monorepo — auth, typed API, Prisma, Turborepo
            </div>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 22, color: "#64748b" }}>Open source starter</div>
      </div>
    ),
    { ...size }
  )
}
