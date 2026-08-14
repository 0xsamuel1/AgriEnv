import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/backend/lib/openai";
import { openAIErrorResponse } from "@/backend/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, count = 5, context } = await req.json();
    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Topic and difficulty are required.", code: "invalid_request" }, { status: 400 });
    }
    const questionCount = Math.min(10, Math.max(1, Number(count) || 5));

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an Agricultural and Environmental Engineering exam question generator for a Nigerian university (500-level final year). Generate practice questions that are realistic and exam-worthy. For each question, provide:
- question: the full question text
- options: array of 4 options (for MCQ) or null (for theory)
- correctAnswer: the correct answer
- explanation: detailed step-by-step solution/explanation
- topic: the topic
- difficulty: the difficulty level
- formulas: any relevant formulas used

Return as a JSON object with a "questions" array. Use Nigerian context where relevant (e.g., Nigerian soil types, local crops, Nigerian climate data).`,
        },
        {
          role: "user",
          content: `Generate ${questionCount} ${difficulty} practice questions on "${topic}" for Agricultural & Environmental Engineering.${context ? `\n\nContext from past questions:\n${context}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      return NextResponse.json({ error: "The AI service returned an empty question set.", code: "empty_ai_response" }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    return openAIErrorResponse(error, "Question generation failed.");
  }
}
