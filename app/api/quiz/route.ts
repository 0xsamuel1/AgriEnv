import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/backend/lib/openai";
import { openAIErrorResponse } from "@/backend/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { count = 10, difficulty = "mixed" } = await req.json();
    const questionCount = Math.min(10, Math.max(1, Number(count) || 10));

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate multiple-choice quiz questions for Agricultural and Environmental Engineering students (500-level, Nigerian university). Each question should test real engineering knowledge. Return JSON with a "questions" array. Each question:
- id: unique number
- question: the question text (keep concise for quiz format)
- options: exactly 4 options ["A. ...", "B. ...", "C. ...", "D. ..."]
- correctIndex: index of correct option (0-3)
- explanation: brief explanation of the answer
- topic: the topic area
- points: 10 for easy, 20 for medium, 30 for hard`,
        },
        {
          role: "user",
          content: `Generate ${questionCount} ${difficulty} difficulty quiz questions covering: Hydrology, Irrigation, Soil Mechanics, Drainage, Environmental Engineering, Farm Mechanization, Soil & Water Conservation.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const questions = Array.isArray(result.questions)
      ? result.questions.filter((question: unknown) => {
          if (!question || typeof question !== "object") return false;
          const item = question as Record<string, unknown>;
          return typeof item.question === "string"
            && Array.isArray(item.options)
            && item.options.length === 4
            && Number.isInteger(item.correctIndex)
            && Number(item.correctIndex) >= 0
            && Number(item.correctIndex) <= 3;
        })
      : [];

    if (questions.length === 0) {
      return NextResponse.json({ error: "The AI service returned an invalid quiz set.", code: "invalid_ai_response" }, { status: 502 });
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    return openAIErrorResponse(error, "Quiz generation failed.");
  }
}
