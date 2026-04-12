import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
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
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: "You are a credit risk analyst. Always respond with valid JSON only.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to score application" }, { status: 500 });
  }
}
