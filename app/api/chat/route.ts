import { streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  if (!checkRateLimit(req, 'chat', 10)) {
    return Response.json({ error: 'Too many chat requests. Please try again in a minute.' }, { status: 429 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: groq('openai/gpt-oss-20b'),
    system:
      'You are a helpful study assistant. Explain concepts clearly and simply, using examples where helpful. Keep answers focused and not overly long.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}