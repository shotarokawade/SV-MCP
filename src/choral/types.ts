export const BLICKS_PER_QUARTER = 705_600_000;

export interface SnapshotNote {
  noteIndex: number;
  localOnset: number;
  absoluteOnset: number;
  duration: number;
  pitch: number;
  effectivePitch: number;
  lyrics: string;
  userPhonemes: string;
  computedPhonemeString: string;
  computedAttributes?: Record<string, unknown>;
  languageOverride?: string;
  musicalType?: string;
}

export interface SnapshotGroup {
  groupIndex: number;
  groupName: string;
  groupUUID: string;
  timeOffset: number;
  pitchOffset: number;
  computedReady: boolean;
  notes: SnapshotNote[];
}

export interface SnapshotTrack {
  trackIndex: number;
  trackName: string;
  groups: SnapshotGroup[];
}

export interface SingingProjectSnapshot {
  projectFileName: string;
  capturedAtEpochMs?: number;
  tracks: SnapshotTrack[];
}

export type MusicXmlSyllabic = "single" | "begin" | "middle" | "end";

export interface MusicXmlLyric {
  text: string;
  syllabic: MusicXmlSyllabic;
  verse: string;
  extendType?: "start" | "continue" | "stop";
}

export interface MusicXmlNote {
  partId: string;
  partName: string;
  measure: number;
  voice: string;
  staff: string;
  onsetQuarter: number;
  durationQuarter: number;
  pitch: number;
  lyric?: MusicXmlLyric;
}

export interface MusicXmlPart {
  id: string;
  name: string;
  notes: MusicXmlNote[];
}

export interface MusicXmlScore {
  title?: string;
  parts: MusicXmlPart[];
}

export type AuditDefectCode =
  | "TRACK_NOT_MAPPED"
  | "TRACK_NOT_FOUND"
  | "MULTIPLE_VOCAL_STREAMS"
  | "NOTE_NOT_FOUND"
  | "PITCH_MISMATCH"
  | "DURATION_MISMATCH"
  | "INSUFFICIENT_NOTES_FOR_SYLLABLES"
  | "LYRIC_LABEL_MISMATCH"
  | "ORPHAN_PLUS"
  | "ORPHAN_HYPHEN"
  | "PHONEME_MISSING"
  | "PHONEME_MISMATCH"
  | "COMPUTED_PHONEME_MISMATCH"
  | "UNINTENDED_SIL"
  | "RENDER_NOT_READY";

export interface AuditLocation {
  partId: string;
  partName: string;
  measure?: number;
  onsetQuarter?: number;
  trackIndex?: number;
  groupIndex?: number;
  noteIndex?: number;
}

export interface AuditDefect {
  code: AuditDefectCode;
  severity: "error" | "warning";
  message: string;
  location: AuditLocation;
  expected?: Record<string, unknown>;
  actual?: Record<string, unknown>;
  repairable: boolean;
}

export interface PlannedNoteCorrection {
  partId: string;
  partName: string;
  measure: number;
  onsetQuarter: number;
  trackIndex: number;
  groupIndex: number;
  noteIndex: number;
  expectedLyrics: string;
  expectedPhonemes: string;
}

export interface AuditOptions {
  trackMap: Record<string, number>;
  profile: "ecclesiastical-latin";
  requireDirectPhonemes: boolean;
  requireDirectLyricLabels: boolean;
  verifyComputedPhonemes: boolean;
  onsetToleranceBlicks: number;
  durationToleranceBlicks: number;
}

export interface LyricAuditResult {
  passed: boolean;
  auditId: string;
  sourceSha256: string;
  projectFingerprint: string;
  profile: string;
  summary: {
    partsChecked: number;
    expectedSungNotes: number;
    matchedNotes: number;
    defectCount: number;
    repairableCount: number;
    structuralDefectCount: number;
    phonemeMismatchCount: number;
    unintendedSilCount: number;
    placeholderCount: number;
  };
  defects: AuditDefect[];
  corrections: PlannedNoteCorrection[];
}
