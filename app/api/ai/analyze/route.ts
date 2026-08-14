import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/backend/lib/openai";
import { openAIErrorResponse } from "@/backend/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { questions, courseCode, year } = await req.json();

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Agricultural and Environmental Engineering professor in a Nigerian university. Analyze past examination questions and extract structured data. Return a JSON object with a "questions" array. Each object in that array must have these fields:
- question: the full question text
- topic: the main topic (e.g., "Soil Mechanics", "Irrigation Engineering", "Hydrology", "Environmental Impact Assessment", "Farm Mechanization", "Drainage Engineering", "Soil & Water Conservation", "Watershed Management")
- difficulty: "easy", "medium", or "hard"
- subtopic: a more specific subtopic
- keyFormulas: array of relevant formulas
- conceptsTested: array of key concepts being tested`,
        },
        {
          role: "user",
          content: `Analyze these past questions from ${courseCode} (${year}):\n\n${questions}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(analysis);
  } catch (error: unknown) {
    return openAIErrorResponse(error, "Question analysis failed.");
  }
}
