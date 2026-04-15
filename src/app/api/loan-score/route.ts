import { NextRequest, NextResponse } from "next/server";

// Groq is OpenAI-compatible — same /chat/completions shape, much faster inference
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

// In-memory IP rate limit: 10 requests per hour per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();
const IP_LIMIT = 10;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  // IP-based rate limiting
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
  const { name, age, income, creditScore, loanAmount, loanPurpose, employmentYears, existingDebt } = body;

  const prompt = `You are a senior credit risk analyst. Evaluate this loan application and respond with valid JSON only (no markdown, no explanation outside the JSON).

Application:
- Applicant: ${name}, Age: ${age}
- Annual Income: $${income.toLocaleString()}
- Credit Score: ${creditScore}
- Loan Requested: $${loanAmount.toLocaleString()} for ${loanPurpose}
- Employment: ${employmentYears} years at current employer
- Existing Monthly Debt: $${existingDebt}

Respond with this exact JSON structure:
{
  "decision": "APPROVED" | "CONDITIONAL" | "DECLINED",
  "probability": <0-100 integer, likelihood of approval>,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH",
  "riskScore": <0-100 integer, higher = riskier>,
  "maxLoanAmount": <integer, maximum we would approve>,
  "interestRate": <float, suggested APR %>,
  "monthlyPayment": <integer, estimated monthly payment for requested amount at 36 months>,
  "dti": <float, debt-to-income ratio %>,
  "strengths": [<up to 3 short strings>],
  "concerns": [<up to 3 short strings>],
  "recommendations": [<up to 3 actionable improvement tips>],
  "summary": "<2-sentence plain-English summary>"
}`;

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
          { role: "system", content: "You are a credit risk analyst. Always respond with valid JSON only." },
          { role: "user",   content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[loan-score] Groq error:", err);
      return NextResponse.json({ error: "Groq request failed" }, { status: 502 });
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Groq response");
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[loan-score]", err);
    return NextResponse.json({ error: "Failed to score application" }, { status: 500 });
  }
}
