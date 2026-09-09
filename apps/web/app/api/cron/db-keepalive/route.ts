import { NextResponse } from "next/server";

function getExpectedSecret() {
  return process.env.CRON_SECRET?.trim();
}

function getBearerToken(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

function getApiBaseUrl() {
  return (
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  );
}

export async function GET(request: Request) {
  const expectedSecret = getExpectedSecret();
  const providedSecret = getBearerToken(request);

  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing API_URL / NEXT_PUBLIC_API_URL" },
      { status: 500 }
    );
  }

  const url = new URL("/api/v1/health", apiBaseUrl);

  try {
    const startedAt = Date.now();
    const res = await fetch(url, { cache: "no-store" });
    const elapsedMs = Date.now() - startedAt;

    const text = await res.text();

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        elapsedMs,
        target: url.toString(),
        body: text,
      },
      { status: res.ok ? 200 : 502 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}

