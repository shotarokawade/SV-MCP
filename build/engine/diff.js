export function computeNoteDiff(before, after) {
    const diffs = [];
    const fields = [
        "onset",
        "duration",
        "pitch",
        "lyrics",
        "phonemes",
        "languageOverride",
        "musicalType",
        "detune"
    ];
    for (const f of fields) {
        if (before[f] !== after[f] && (before[f] !== undefined || after[f] !== undefined)) {
            diffs.push({
                field: f,
                before: before[f],
                after: after[f]
            });
        }
    }
    // Deep diff for attributes
    if (JSON.stringify(before.attributes || {}) !== JSON.stringify(after.attributes || {})) {
        diffs.push({
            field: "attributes",
            before: before.attributes,
            after: after.attributes
        });
    }
    return diffs;
}
export function formatDiffSummary(diffs) {
    const lines = [];
    for (const d of diffs) {
        if (d.type === "added") {
            lines.push(`+ [Add] Note @ onset=${d.after?.onset} pitch=${d.after?.pitch} lyrics="${d.after?.lyrics}" phonemes="${d.after?.phonemes || ''}"`);
        }
        else if (d.type === "deleted") {
            lines.push(`- [Delete] Note #${d.noteIndex} @ onset=${d.before?.onset} pitch=${d.before?.pitch} lyrics="${d.before?.lyrics}"`);
        }
        else if (d.type === "updated") {
            const changes = (d.changedFields || []).map((c) => `${c.field}: ${JSON.stringify(c.before)} -> ${JSON.stringify(c.after)}`).join(", ");
            lines.push(`~ [Update] Note #${d.noteIndex}: ${changes}`);
        }
    }
    return lines.join("\n");
}
//# sourceMappingURL=diff.js.map