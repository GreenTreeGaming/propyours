export type HfChatRole = "system" | "user" | "assistant";

export interface HfChatMessage {
    role: HfChatRole;
    content: string;
}

interface CreateChatCompletionOptions {
    messages: HfChatMessage[];
    temperature?: number;
    maxTokens?: number;
    responseFormat?: Record<string, unknown>;
    model?: string;
}

interface HuggingFaceChatResponse {
    choices?: Array<{
        message?: {
            content?: unknown;
        };
    }>;
}

export class HuggingFaceRequestError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly responseDetails?: string,
    ) {
        super(message);
        this.name = "HuggingFaceRequestError";
    }
}

const HUGGING_FACE_CHAT_URL =
    "https://router.huggingface.co/v1/chat/completions";

const DEFAULT_MODEL =
    "Qwen/Qwen3-30B-A3B-Instruct-2507";

const REQUEST_TIMEOUT_MS = 35_000;

export async function createHuggingFaceChatCompletion({
                                                          messages,
                                                          temperature = 0.2,
                                                          maxTokens = 500,
                                                          responseFormat,
                                                          model,
                                                      }: CreateChatCompletionOptions): Promise<string> {
    const token = process.env.HF_TOKEN?.trim();

    if (!token) {
        throw new Error("HF_TOKEN is not configured");
    }

    const selectedModel =
        model?.trim() ||
        process.env.HF_MODEL?.trim() ||
        DEFAULT_MODEL;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(HUGGING_FACE_CHAT_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
            body: JSON.stringify({
                model: selectedModel,
                messages,
                temperature,
                max_tokens: maxTokens,
                ...(responseFormat
                    ? {
                        response_format: responseFormat,
                    }
                    : {}),
            }),
        });

        if (!response.ok) {
            const responseDetails = (
                await response.text()
            ).slice(0, 1_000);

            throw new HuggingFaceRequestError(
                `Hugging Face returned HTTP ${response.status}`,
                response.status,
                responseDetails,
            );
        }

        const data =
            (await response.json()) as HuggingFaceChatResponse;

        const content = extractTextContent(
            data.choices?.[0]?.message?.content,
        );

        if (!content) {
            throw new Error(
                "Hugging Face returned an empty response",
            );
        }

        return content;
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "AbortError"
        ) {
            throw new Error(
                "The Hugging Face request timed out",
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

function extractTextContent(content: unknown): string {
    if (typeof content === "string") {
        return content.trim();
    }

    if (!Array.isArray(content)) {
        return "";
    }

    return content
        .map((item) => {
            if (!isRecord(item)) {
                return "";
            }

            return typeof item.text === "string"
                ? item.text
                : "";
        })
        .filter(Boolean)
        .join("\n")
        .trim();
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}