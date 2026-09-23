import { ImageResponse } from "next/og"

export const alt = "Fidely — Universal Digital Loyalty & Rewards Platform"
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
          background: "radial-gradient(circle at 50% 20%, #182820 0%, #090d0b 70%, #050706 100%)",
          color: "#fafaf9",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            width: 700,
            height: 300,
            background: "rgba(16, 185, 129, 0.22)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            zIndex: 1,
          }}
        >
          {/* Brand Shield Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 128,
              height: 128,
              borderRadius: 36,
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.08) 100%)",
              border: "2px solid rgba(52, 211, 153, 0.5)",
              boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#10b981",
                display: "flex",
              }}
            >
              F
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
            <div
              style={{
                fontSize: 68,
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                color: "#ffffff",
                display: "flex",
              }}
            >
              Fidely
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#a7f3d0",
                lineHeight: 1.35,
                fontWeight: 600,
                display: "flex",
              }}
            >
              Universal Digital Loyalty Passes & Fast Cashier POS
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: "#e2e8f0",
              display: "flex",
            }}
          >
            Zero App Downloads
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              fontSize: 18,
              fontWeight: 600,
              color: "#34d399",
              display: "flex",
            }}
          >
            Instant QR Counter Stands
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: "#e2e8f0",
              display: "flex",
            }}
          >
            &lt;1s Cashier Scanner
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
