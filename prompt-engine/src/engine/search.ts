import { BaseTemplate, PromptContext, SearchOutput } from "./types";

export function generateSearch(query: BaseTemplate, options: PromptContext): SearchOutput {
    // placeholder
    return {
        results: [
            {
                text: "result",
                score: 0.8,
                metadata: {
                    createdAt: "2026",
                }
            },
            {
                text: "result2",
                score: 0.78,
                metadata: {
                    createdAt: "0000",
                }
            },
        ]
    };
}