const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);
const DIPHTHONGS = new Set(["ae", "oe", "au", "eu", "ei", "ui"]);
const ALLOWED_ONSETS = new Set(["pr", "br", "tr", "dr", "kr", "gr", "fr", "pl", "bl", "kl", "gl", "fl"]);
const PHONEME_VOWELS = new Set(["a", "e", "i", "o", "u"]);
function cleanWord(word) {
    return word
        .normalize("NFC")
        .toLowerCase()
        .replace(/æ/g, "ae")
        .replace(/œ/g, "oe")
        .replace(/[^a-z]/g, "");
}
export function syllabifyLatin(word) {
    const normalized = cleanWord(word);
    if (!normalized)
        return [];
    const nuclei = [];
    for (let index = 0; index < normalized.length; index += 1) {
        if (!VOWELS.has(normalized[index]))
            continue;
        const pair = normalized.slice(index, index + 2);
        if (DIPHTHONGS.has(pair)) {
            nuclei.push({ start: index, end: index + 2 });
            index += 1;
        }
        else {
            nuclei.push({ start: index, end: index + 1 });
        }
    }
    if (nuclei.length <= 1)
        return [normalized];
    const boundaries = [];
    for (let index = 0; index < nuclei.length - 1; index += 1) {
        const left = nuclei[index];
        const right = nuclei[index + 1];
        const cluster = normalized.slice(left.end, right.start);
        if (cluster.length <= 1) {
            boundaries.push(left.end);
        }
        else {
            const finalPair = cluster.slice(-2);
            boundaries.push(ALLOWED_ONSETS.has(finalPair) ? right.start - 2 : right.start - 1);
        }
    }
    const result = [];
    let start = 0;
    for (const boundary of boundaries) {
        result.push(normalized.slice(start, boundary));
        start = boundary;
    }
    result.push(normalized.slice(start));
    return result.filter(Boolean);
}
function phonemizeSyllable(syllable, nextSyllable) {
    const source = syllable.toLowerCase();
    const tokens = [];
    let index = 0;
    while (index < source.length) {
        const rest = source.slice(index);
        const next = source[index + 1] ?? "";
        if (rest.startsWith("ae") || rest.startsWith("oe")) {
            tokens.push("e");
            index += 2;
            continue;
        }
        if (rest.startsWith("gn")) {
            tokens.push("J");
            index += 2;
            continue;
        }
        if (/^sc[ei]/.test(rest)) {
            tokens.push("sh");
            index += 2;
            continue;
        }
        if (rest.startsWith("ch")) {
            tokens.push("k");
            index += 2;
            continue;
        }
        if (rest.startsWith("ph")) {
            tokens.push("f");
            index += 2;
            continue;
        }
        if (rest.startsWith("th")) {
            tokens.push("t");
            index += 2;
            continue;
        }
        if (rest.startsWith("qu")) {
            tokens.push("k", "U");
            index += 2;
            continue;
        }
        if (source.slice(index, index + 2) === "ti" && nextSyllable && /^[aeiou]/.test(nextSyllable)) {
            tokens.push("s", "t", "i");
            index += 2;
            continue;
        }
        const char = source[index];
        if (char === "c")
            tokens.push(/[eiy]/.test(next) ? "ch" : "k");
        else if (char === "g")
            tokens.push(/[eiy]/.test(next) ? "J" : "g");
        else if (char === "x")
            tokens.push("k", "s");
        else if (char === "z")
            tokens.push("d", "s");
        else if (char === "j")
            tokens.push("y");
        else if (char === "v")
            tokens.push("B");
        else if (char === "h") { /* Ecclesiastical h is normally silent. */ }
        else if (char === "q")
            tokens.push("k");
        else if (char === "y")
            tokens.push("i");
        else
            tokens.push(char);
        index += 1;
    }
    return tokens.filter(Boolean);
}
export function ecclesiasticalLatinWord(word) {
    const syllables = syllabifyLatin(word);
    return syllables.map((text, index) => ({
        text,
        phonemes: phonemizeSyllable(text, syllables[index + 1])
    }));
}
export function splitSyllablePhonemes(tokens) {
    const firstVowel = tokens.findIndex((token) => PHONEME_VOWELS.has(token));
    if (firstVowel < 0)
        return { onset: tokens, nucleus: [], coda: [] };
    let lastVowel = firstVowel;
    while (lastVowel + 1 < tokens.length && PHONEME_VOWELS.has(tokens[lastVowel + 1]))
        lastVowel += 1;
    return {
        onset: tokens.slice(0, firstVowel),
        nucleus: tokens.slice(firstVowel, lastVowel + 1),
        coda: tokens.slice(lastVowel + 1)
    };
}
export function formatDirectPhonemes(tokens) {
    return `.${tokens.join(" ")}`;
}
export function normalizePhonemeString(value) {
    return value.trim().replace(/^\./, "").split(/\s+/).filter(Boolean).join(" ");
}
//# sourceMappingURL=latin.js.map