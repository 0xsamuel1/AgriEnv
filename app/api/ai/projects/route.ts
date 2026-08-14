import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/backend/lib/openai";
import { openAIErrorResponse } from "@/backend/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { interests, region, count = 5 } = await req.json();

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a research advisor for final year Agricultural and Environmental Engineering students at a Nigerian university. Generate innovative, feasible final year project ideas that address real agricultural/environmental challenges in Nigeria. Each idea should be completable within one academic session.

Return JSON with a "projects" array. Each project:
- title: project title
- problemStatement: 2-3 sentences describing the problem
- region: the Nigerian region this is most relevant to
- category: one of ["Irrigation", "Soil Conservation", "Environmental Engineering", "Farm Mechanization", "Water Resources", "Crop Processing", "Renewable Energy in Agriculture", "Precision Agriculture", "Waste Management"]
- methodology: 3-5 bullet points of methodology
- expectedOutcomes: 2-3 expected outcomes
- feasibilityScore: 1-10 (10 = very feasible for a student project)
- innovationScore: 1-10 (10 = very innovative)
- impact: who benefits and how
- suggestedTools: tools/software needed
- estimatedCost: rough estimate in Naira`,
        },
        {
          role: "user",
          content: `Generate ${count} final year project ideas.
Student interests: ${interests.join(", ")}
Preferred region: ${region || "Any region in Nigeria"}
Focus on problems that are real and impactful for Nigerian agriculture.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error: unknown) {
    return openAIErrorResponse(error, "Project generation failed.");
  }
}
