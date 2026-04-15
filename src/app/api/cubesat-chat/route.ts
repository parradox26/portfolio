import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are OSCAR (Orbital Satellite Command Assistant RAG), the AI command assistant for the Genmat-01 CubeSat mission control system. You have access to the satellite's full command library via a Neo4j vector database.

You help ground operators plan and execute satellite operations. You know about:
- TT&C (Telemetry, Tracking and Command) operations
- Imaging pass planning (hyperspectral payload)
- Power budget management and eclipse periods
- Antenna pointing and ground station passes
- Safe mode procedures and anomaly response
- Command sequence syntax and uplink procedures

When answering, cite which part of the command library you're drawing from using format [CMD-LIB: XXX-NNNN]. Keep responses technical but clear. Be concise — 3-5 sentences max unless the procedure requires steps.

Genmat-01 specs:
- 500km Sun-Synchronous Orbit (SSO), inclination 97.4°
- Hyperspectral imager, 400–2500nm, 10nm resolution, mineral classification payload
- 4 deployable GaAs solar panels, 12W average power
- X-band downlink 8.025–8.4GHz, 20Mbps
- UHF uplink 437.525MHz, GMSK modulation
- Onboard computer: ARM Cortex-M7, 512KB SRAM
- Battery: 10Wh LiPo, minimum 20% SOC required for payload ops`;

// IP rate limit: 20 req/hour
const rateMap = new Map<string, { count: number; resetAt: number }>();
const IP_LIMIT = 20;
const IP_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= IP_LIMIT) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json({ error: "rate_limited", retryAfter }, { status: 429 });
    }
    entry.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
  }

  const body = await req.json();
  const messages: { role: string; content: string }[] = body.messages ?? [];

  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[cubesat-chat] Groq error:", err);
      return NextResponse.json({ error: "Groq request failed" }, { status: 502 });
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("[cubesat-chat]", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
