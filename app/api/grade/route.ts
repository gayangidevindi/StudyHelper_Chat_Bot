import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const gradeSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
});

export async function POST(req: Request) {
  if (!checkRateLimit(req, 'grade', 5)) {
    return Response.json({ error: 'Too many grading requests. Please try again in a minute.' }, { status: 429 });
  }

  const { question, correctAnswer, userAnswer } = await req.json();

  if (!question || !userAnswer) {
    return Response.json(
      { error: 'question and userAnswer are required' },
      { status: 400 }
    );
  }

  const { object } = await generateObject({
    model: groq('openai/gpt-oss-20b'),
    schema: gradeSchema,
    prompt: `You are grading a student's answer to a study question.

Question: ${question}
${correctAnswer ? `Reference answer: ${correctAnswer}` : ''}
Student's answer: ${userAnswer}

Evaluate the student's answer for correctness and completeness, even if worded differently from the reference answer. Give:
- correct: true if the core idea is right, false otherwise
- score: 0-100 reflecting how complete and accurate the answer is
- feedback: 1-3 sentences of specific, encouraging feedback explaining what was right, what was missing, or what to correct. Speak directly to the student ("You correctly identified..." / "You're missing...").`,
  });

  return Response.json(object);
}