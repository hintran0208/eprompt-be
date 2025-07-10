import { BaseTemplate, PromptContext } from "./types";

export async function generateSearch(
    query: BaseTemplate,
    options: PromptContext
): Promise<{
    results: object[];
    metadata?: Record<string, any>;
}> {
    // placeholder
    return {
        results: [
            {
                text: "result",
                score: 0.8,
            },
            {
                text: "result2",
                score: 0.78,
            },
        ],
    };
}