import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const { notes } = await req.json();

  if (!notes || notes.trim().length === 0) {
    return Response.json({ error: 'Notes are required' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: groq('openai/gpt-oss-20b'),
    schema: quizSchema,
    prompt: `Based on the following notes, generate 5 multiple-choice quiz questions to test understanding. Each question must have exactly 4 options, one correct answer (correctIndex 0-3), and a short explanation of why the answer is correct.\n\nNotes:\n${notes}`,
  });

  return Response.json(object);
}