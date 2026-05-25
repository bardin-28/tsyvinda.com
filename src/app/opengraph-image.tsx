import { ImageResponse } from "next/og";
import { JOB_TITLE, NAME, SITE_URL } from "@/shared/lib/site";

// Branded OpenGraph / Twitter card, applied to every page that doesn't define
// its own. 1200×630 is the standard social card size.
export const alt = `${NAME} — ${JOB_TITLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const V_PATH =
  "M487.6,18.8l-159.9-0.5l-24.5,45.6l-48.5,86.5L184,19H26l229.4,428.7l127.7-236l14.3-26.5c0,0,0,0,0,0L487.6,18.8z M362.5,172.6l-3.8,7.1v0L255.6,370.3L87.2,55.7h74.9l60.3,112.1l31.6,58.8l32.7-58.2l63.2-112.6l74.3,0.2l-55.3,104.9c0,0,0,0,0.1,0.1l-2.4,4.5L362.5,172.6z";
const T_PATH =
  "M627.2,18.3h-6.7h-93.8l-74,138.9l66.5-0.4c0,0.1,0,0.1,0,0.1h111.1l-156,289.8H635l154.8-290.9h156l73.8-137.5H627.2z M923.7,118.8H767.7l-10.4,19.6L612.8,409.7h-76.6l126.6-235.2l29.4-54.6h-47.8c0,0,0,0,0-0.1l-129.6-1.1l34.1-63.5H645l0,0h312.8L923.7,118.8z";

const domain = SITE_URL.replace(/^https?:\/\//, "");

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080810",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(253,126,20,0.22) 0%, transparent 45%), radial-gradient(circle at 12% 90%, rgba(99,102,241,0.18) 0%, transparent 45%)",
          padding: "72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="200" height="89" viewBox="0 0 1045.7 466" fill="#fd7e14">
          <path d={V_PATH} />
          <path d={T_PATH} />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {NAME}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: "#fd7e14",
                marginRight: 16,
              }}
            />
            <div style={{ fontSize: 40, color: "rgba(255,255,255,0.78)" }}>
              {JOB_TITLE}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.5)" }}>
          {domain}
        </div>
      </div>
    ),
    size,
  );
}
