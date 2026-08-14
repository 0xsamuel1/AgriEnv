import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/backend/lib/openai";
import { openAIErrorResponse } from "@/backend/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { question, userAnswer, topic } = await req.json();

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a friendly, encouraging Agricultural and Environmental Engineering tutor at a Nigerian university. A student has answered a question and you need to evaluate their answer. Be supportive but accurate. If they're wrong, explain where they went wrong and guide them to the right answer. Use simple language and Nigerian context where relevant. Return JSON with:
- isCorrect: boolean
- score: 0-100
- feedback: your evaluation (2-3 sentences)
- correctAnswer: the full correct answer
- hint: a helpful hint if they were wrong`,
        },
        {
          role: "user",
          content: `Topic: ${topic}\nQuestion: ${question}\nStudent's Answer: ${userAnswer}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error: unknown) {
    return openAIErrorResponse(error, "Tutor response failed.");
  }
}
