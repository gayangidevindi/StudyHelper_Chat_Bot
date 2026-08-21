import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const questionSchema = z.object({
  question: z.string(),
  referenceAnswer: z.string(),
});

export async function POST(req: Request) {
  if (!checkRateLimit(req, 'question', 5)) {
    return Response.json({ error: 'Too many question requests. Please try again in a minute.' }, { status: 429 });
  }

  const { notes } = await req.json();

  if (!notes || notes.trim().length === 0) {
    return Response.json({ error: 'Notes are required' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: groq('openai/gpt-oss-20b'),
    schema: questionSchema,
    prompt: `Based on the following notes, write one open-ended short-answer study question that tests understanding of a key concept (not a multiple-choice question). Also provide a concise reference answer.\n\nNotes:\n${notes}`,
  });

  return Response.json(object);
}