import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://127.0.0.1:8000";

// PayTR panel test probe (GET) - Always returns OK
export async function GET() {
  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// PayTR webhook notification (POST)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchant_oid = formData.get("merchant_oid")?.toString() || "";
    const hash = formData.get("hash")?.toString() || "";

    // PayTR panel test probe / empty ping
    if (!merchant_oid || !hash) {
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Forward to FastAPI backend
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/payments/callback`, {
      method: "POST",
      body: formData,
    });

    const text = await backendRes.text();
    return new NextResponse(text || "OK", {
      status: backendRes.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("PayTR frontend proxy callback error:", error);
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
