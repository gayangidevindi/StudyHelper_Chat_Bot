import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const difficultySchema = z.enum(['easy', 'medium', 'hard']);

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
  if (!checkRateLimit(req, 'quiz', 5)) {
    return Response.json({ error: 'Too many quiz requests. Please try again in a minute.' }, { status: 429 });
  }

  const { notes, difficulty: rawDifficulty } = await req.json();
  const difficulty = difficultySchema.catch('medium').parse(rawDifficulty);

  if (!notes || notes.trim().length === 0) {
    return Response.json({ error: 'Notes are required' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: groq('openai/gpt-oss-20b'),
    schema: quizSchema,
    prompt: `Based on the following notes, generate 5 multiple-choice quiz questions. Difficulty: ${difficulty}. For easy questions, focus on direct recall. For medium questions, test understanding as usual. For hard questions, require application and analysis. Each question must have exactly 4 options, one correct answer (correctIndex 0-3), and a short explanation of why the answer is correct.\n\nNotes:\n${notes}`,
  });

  return Response.json(object);
}