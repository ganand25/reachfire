import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const RequestSchema = z.object({
  currentAge: z.number().min(18).max(100),
  savingsRate: z.number().min(0).max(100),
  yearsToFire: z.number().min(0).max(100),
  fireNumber: z.number().min(0),
  currentPortfolio: z.number().min(0),
  annualExpenses: z.number().min(0),
  annualIncome: z.number().min(0),
  monthlySavings: z.number().min(0),
  expectedReturn: z.number().min(0).max(0.3),
  withdrawalRate: z.number().min(0).max(0.15),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI insights not configured' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a friendly, knowledgeable FIRE (Financial Independence, Retire Early) coach. Analyze this person's FIRE situation and provide 4 specific, actionable insights in plain English. Each insight should be concrete, data-driven, and motivating.

USER'S FIRE SITUATION:
- Current age: ${data.currentAge}
- Annual income: $${data.annualIncome.toLocaleString()}
- Annual expenses: $${data.annualExpenses.toLocaleString()}
- Current portfolio: $${data.currentPortfolio.toLocaleString()}
- Monthly savings: $${data.monthlySavings.toLocaleString()}
- Savings rate: ${data.savingsRate.toFixed(1)}%
- FIRE number (target): $${data.fireNumber.toLocaleString()}
- Years to FIRE: ${data.yearsToFire.toFixed(1)} years
- Expected return: ${(data.expectedReturn * 100).toFixed(1)}%
- Withdrawal rate: ${(data.withdrawalRate * 100).toFixed(1)}%

Return EXACTLY 4 insights as a JSON array. Each insight must be a plain English sentence, specific to their numbers. Examples of good insights:
- "Your 35% savings rate puts you in the top 8% of Americans — at this rate, you'll have $2.3M by age 47"
- "Cutting $300/month in expenses would reduce your FIRE number by $90K and move your date 2.1 years closer"
- "At your return rate, your money doubles every 10 years — that first $50K will be worth $400K by retirement"
- "Consider Roth conversions now while in a lower bracket — converting $30K/year could save $180K in lifetime taxes"

Return ONLY a JSON array of strings, no other text. Example: ["insight 1", "insight 2", "insight 3", "insight 4"]`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON array from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const insights = JSON.parse(jsonMatch[0]) as string[];

    if (!Array.isArray(insights) || insights.length === 0) {
      throw new Error('Invalid insights format');
    }

    return NextResponse.json({
      insights: insights.slice(0, 5).map((text, i) => ({
        id: `insight-${i}`,
        text: String(text),
      })),
    });
  } catch (err) {
    console.error('AI insights error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to generate insights. Please try again.' },
      { status: 500 }
    );
  }
}
