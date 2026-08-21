This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) for more details.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Study Helper Bot

Study Helper Bot is an AI-powered study workspace for turning questions and notes into active learning. It provides a streaming concept tutor, generated multiple-choice quizzes, and generated short-answer questions with AI grading.

## Features

- **Ask & Explain**: ask a study question and receive a focused, streamed explanation from the tutor.
- **Quiz Me**: paste notes and generate five multiple-choice questions with four options, answer explanations, and a score.
- **Short Answer**: paste notes, generate an open-ended question, submit an answer, and receive a 0-100 score with feedback.
- **Session progress**: track quizzes taken, questions answered, and accuracy while the page is open.
- **Markdown answers**: tutor messages support Markdown and GitHub-flavored Markdown rendering through `react-markdown` and `remark-gfm`.

Progress is held in client-side React state. It is reset when the page is refreshed and is not persisted to a database.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Vercel AI SDK 7 with `@ai-sdk/react`
- Groq models through `@ai-sdk/groq`
- Zod schemas for structured quiz, question, and grading responses
- Zilla Slab, Inter, and JetBrains Mono via `next/font/google`

## Requirements

- Node.js 20 or newer
- npm
- A Groq API key

## Setup

1. Install dependencies:

	 ```bash
	 npm install
	 ```

2. Create `.env.local` in the project root:

	 ```env
	 GROQ_API_KEY=your_groq_api_key
	 ```

	 Get a key from the [Groq Console](https://console.groq.com/keys). Keep this file local and do not commit it.

3. Start the development server:

	 ```bash
	 npm run dev
	 ```

4. Open [http://localhost:3000/study](http://localhost:3000/study).

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server with hot reload. |
| `npm run lint` | Run ESLint across the project. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build locally. Run `npm run build` first. |

## How It Works

The study screen in `app/study/page.tsx` switches between the three learning modes. Notes are passed to the quiz and short-answer components, while the explain mode maintains a chat conversation through the AI SDK.

All model calls use the Groq model `openai/gpt-oss-20b`:

- Chat uses `streamText` and returns an AI SDK UI message stream.
- Quiz generation uses `generateObject` and validates five-question output with a Zod schema.
- Short-answer generation uses `generateObject` to return one question and a reference answer.
- Grading uses `generateObject` to return `correct`, `score`, and explanatory `feedback`.

## API Routes

All routes accept `POST` requests with JSON bodies.

| Route | Body | Response |
| --- | --- | --- |
| `/api/chat` | `{ messages }` | AI SDK UI message stream for the tutor conversation. |
| `/api/quiz` | `{ notes }` | `{ questions }` containing five questions, four options per question, a `correctIndex`, and an explanation. |
| `/api/question` | `{ notes }` | `{ question, referenceAnswer }` for a short-answer exercise. |
| `/api/grade` | `{ question, correctAnswer?, userAnswer }` | `{ correct, score, feedback }`. |

The notes-based routes return HTTP `400` when notes are empty. The grading route returns HTTP `400` when `question` or `userAnswer` is missing.

## Project Structure

```text
app/
	api/
		chat/route.ts       Streaming tutor endpoint
		grade/route.ts      Grade a short answer
		question/route.ts   Generate an open-ended question
		quiz/route.ts       Generate a multiple-choice quiz
	study/page.tsx        Main study workspace
	globals.css           Global Tailwind and page styles
	layout.tsx            Fonts and metadata
components/
	ExplainChat.tsx       Streaming chat UI
	NotesInput.tsx        Shared notes editor
	ProgressTracker.tsx   In-session quiz statistics
	QuizView.tsx          Quiz generation and answer state
	ShortAnswer.tsx       Question generation and grading UI
lib/
	prompts.ts            Reserved prompt module
public/                 Static assets
```

## Deployment

The app can be deployed to Vercel or any platform that supports a Next.js production server:

```bash
npm run build
npm run start
```

Set `GROQ_API_KEY` as a server-side environment variable in the hosting platform. Do not expose it as a `NEXT_PUBLIC_` variable. Because the API routes call Groq at request time, the deployment also needs outbound network access and a valid Groq account with model access.

## Development Notes

- Keep API keys in `.env.local`; environment files containing secrets should never be committed.
- The AI responses are generated from the supplied notes and are not a substitute for a verified textbook, instructor, or other authoritative source.
- There is currently no authentication, database, saved study history, rate limiting, or automated test suite.

## Learn More

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js App Router guide](https://nextjs.org/docs/app)
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs)
- [Groq documentation](https://console.groq.com/docs)
- [Zod documentation](https://zod.dev/)
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
