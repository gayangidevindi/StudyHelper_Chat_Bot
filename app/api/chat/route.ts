import { streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('openai/gpt-oss-20b'),
    system:
      'You are a helpful study assistant. Explain concepts clearly and simply, using examples where helpful. Keep answers focused and not overly long.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}