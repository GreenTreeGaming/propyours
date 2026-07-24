import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from "obscenity";

const englishMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

/**
 * Add reviewed Tamil-script and transliterated Tamil terms here.
 *
 * Keep this list focused on clearly unacceptable content:
 * - severe profanity
 * - sexual language
 * - hateful slurs
 * - threats
 *
 * Do not add vague words that could appear in legitimate property text.
 */
const LOCAL_BLOCKED_TERMS = [
    // Tamil-script terms
    // Transliterated Tamil terms
] as const;

const ZERO_WIDTH_CHARACTERS =
    /[\u200B-\u200D\u2060\uFEFF]/gu;

const NON_WORD_CHARACTERS =
    /[^\p{L}\p{N}\p{M}]+/gu;

function normalizeModerationText(
    value: string,
): string {
    return value
        .normalize("NFKC")
        .replace(
            ZERO_WIDTH_CHARACTERS,
            "",
        )
        .toLocaleLowerCase("en-IN")
        .replace(
            NON_WORD_CHARACTERS,
            " ",
        )
        .replace(/\s+/g, " ")
        .trim();
}

const NORMALIZED_LOCAL_TERMS =
    LOCAL_BLOCKED_TERMS.map(
        normalizeModerationText,
    ).filter(Boolean);

export function hasInappropriateContent(
    value: unknown,
): boolean {
    if (
        typeof value !== "string" ||
        value.trim().length === 0
    ) {
        return false;
    }

    if (englishMatcher.hasMatch(value)) {
        return true;
    }

    const normalized =
        normalizeModerationText(value);

    const paddedValue =
        ` ${normalized} `;

    return NORMALIZED_LOCAL_TERMS.some(
        (term) =>
            paddedValue.includes(
                ` ${term} `,
            ),
    );
}

export function findInappropriateField(
    fields: Record<string, unknown>,
): string | null {
    for (
        const [field, value] of
        Object.entries(fields)
        ) {
        if (
            hasInappropriateContent(
                value,
            )
        ) {
            return field;
        }
    }

    return null;
}