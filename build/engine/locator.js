export function matchNoteLocator(note, noteIndex0, locator) {
    if (locator.noteIndex !== undefined && locator.noteIndex !== noteIndex0) {
        return false;
    }
    if (locator.onset !== undefined && note.onset !== locator.onset) {
        return false;
    }
    if (locator.pitch !== undefined && note.pitch !== locator.pitch) {
        return false;
    }
    if (locator.lyrics !== undefined && note.lyrics !== locator.lyrics) {
        return false;
    }
    return true;
}
export function findNoteIndexByLocator(notes, locator) {
    if (locator.noteIndex !== undefined && locator.noteIndex >= 0 && locator.noteIndex < notes.length) {
        return locator.noteIndex;
    }
    for (let i = 0; i < notes.length; i++) {
        if (matchNoteLocator(notes[i], i, locator)) {
            return i;
        }
    }
    return -1;
}
//# sourceMappingURL=locator.js.map