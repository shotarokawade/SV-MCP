import { z } from "zod";

export const NoteLocatorSchema = z.object({
  trackIndex: z.number().int().min(0).optional().describe("0-based track index"),
  groupIndex: z.number().int().min(0).optional().describe("0-based group reference index"),
  noteIndex: z.number().int().min(0).optional().describe("0-based note index"),
  onset: z.number().int().min(0).optional().describe("Onset position in blicks (exact match)"),
  pitch: z.number().int().min(0).max(127).optional().describe("MIDI pitch (0-127) for disambiguation"),
  lyrics: z.string().optional().describe("Lyrics text for verification")
});

export const PhonemeAttributeSchema = z.object({
  symbol: z.string().optional().describe("Phoneme symbol"),
  language: z.string().optional().describe("Phoneme language (e.g. english, japanese, mandarin, cantonese)"),
  leftOffset: z.number().optional().describe("Offset added to phoneme left boundary"),
  position: z.number().optional().describe("Phoneme position"),
  activity: z.number().optional().describe("Consonant activity level"),
  strength: z.number().optional().describe("Pronunciation strength")
});

export const NoteAttributesSchema = z.object({
  rTone: z.number().optional().describe("Rap tone"),
  rIntonation: z.number().optional().describe("Rap intonation"),
  dF0VbrMod: z.number().optional().describe("Vibrato modulation"),
  expValueX: z.number().optional().describe("Expression pad X"),
  expValueY: z.number().optional().describe("Expression pad Y"),
  phonemes: z.array(PhonemeAttributeSchema).optional().describe("Per-phoneme timing and activity attributes"),
  muted: z.boolean().optional().describe("Whether note is muted"),
  evenSyllableDuration: z.boolean().optional().describe("Split syllables evenly"),
  languageOverride: z.string().optional().describe("Language override (e.g. 'english', 'japanese', 'mandarin', 'cantonese')"),
  phonesetOverride: z.string().optional().describe("Phoneset override")
}).passthrough();

export const NoteDefinitionSchema = z.object({
  onset: z.number().int().min(0).describe("Onset position in blicks (1 quarter note = 705,600,000 blicks)"),
  duration: z.number().int().positive().describe("Duration in blicks"),
  pitch: z.number().int().min(0).max(127).describe("MIDI pitch number (60 = Middle C / C4)"),
  lyrics: z.string().default("la").describe("Lyric string for the note"),
  phonemes: z.string().optional().describe("Space-separated phonemes for SynthV (e.g. '.sh er' or 'hh ah ll ow')"),
  languageOverride: z.string().optional(),
  musicalType: z.enum(["sing", "rap"]).optional(),
  detune: z.number().optional().describe("Detune in cents"),
  attributes: NoteAttributesSchema.optional()
});

export const NoteUpdateSchema = z.object({
  noteIndex: z.number().int().min(0).optional().describe("0-based note index to update"),
  locator: NoteLocatorSchema.optional().describe("Locator if noteIndex is not known"),
  onset: z.number().int().min(0).optional(),
  duration: z.number().int().positive().optional(),
  pitch: z.number().int().min(0).max(127).optional(),
  lyrics: z.string().optional(),
  phonemes: z.string().optional().describe("Space-separated phonemes to set directly"),
  languageOverride: z.string().optional(),
  musicalType: z.enum(["sing", "rap"]).optional(),
  detune: z.number().optional(),
  attributes: NoteAttributesSchema.optional()
});

export const PhonemeAssignmentSchema = z.object({
  noteIndex: z.number().int().min(0).optional().describe("0-based note index"),
  locator: NoteLocatorSchema.optional().describe("Locator for target note"),
  phonemes: z.string().describe("Formal space-separated phoneme string (e.g. '.sh er' or 'g u: t')")
});

export const VoiceSettingsSchema = z.object({
  paramLoudness: z.number().min(-48).max(12).optional().describe("Loudness in dB (-48 to 12)"),
  paramTension: z.number().min(-1.0).max(1.0).optional().describe("Tension (-1.0 to 1.0)"),
  paramBreathiness: z.number().min(-1.0).max(1.0).optional().describe("Breathiness (-1.0 to 1.0)"),
  paramGender: z.number().min(-1.0).max(1.0).optional().describe("Gender (-1.0 masculine to 1.0 feminine)"),
  paramToneShift: z.number().optional().describe("Tone shift"),
  vocalModeParams: z.record(
    z.string(),
    z.object({
      pitch: z.number().min(0).max(150).optional(),
      timbre: z.number().min(0).max(150).optional(),
      pronunciation: z.number().min(0).max(150).optional()
    })
  ).optional().describe("Vocal mode parameters per mode name (e.g. 'Soft', 'Power')")
}).passthrough();

// Tool Input Schemas
export const GetServerStatusSchema = z.object({});

export const GetProjectInfoSchema = z.object({});

export const ListTracksSchema = z.object({});

export const ListGroupsSchema = z.object({});

export const GetNotesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index (default: 0)"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index (default: 0)")
});

export const FindNotesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  minOnset: z.number().int().min(0).optional().describe("Minimum onset in blicks"),
  maxOnset: z.number().int().min(0).optional().describe("Maximum onset in blicks"),
  minPitch: z.number().int().min(0).max(127).optional().describe("Minimum MIDI pitch"),
  maxPitch: z.number().int().min(0).max(127).optional().describe("Maximum MIDI pitch"),
  lyricsPattern: z.string().optional().describe("Substring pattern to match in lyrics"),
  phonemesPattern: z.string().optional().describe("Substring pattern to match in phonemes")
});

export const AddNotesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  notes: z.array(NoteDefinitionSchema).describe("List of notes to add"),
  dry_run: z.boolean().default(false).describe("If true, simulate creation without modifying project")
});

export const UpdateNotesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  notes: z.array(NoteUpdateSchema).describe("List of note updates to apply"),
  dry_run: z.boolean().default(false).describe("If true, simulate updates without modifying project")
});

export const DeleteNotesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  noteIndices: z.array(z.number().int().min(0)).optional().describe("List of 0-based note indices to delete"),
  noteIndex: z.number().int().min(0).optional().describe("Single 0-based note index to delete"),
  locator: NoteLocatorSchema.optional().describe("Locator for note to delete"),
  dry_run: z.boolean().default(false).describe("If true, simulate deletion without modifying project")
});

export const GetPhonemesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  noteIndex: z.number().int().min(0).optional().describe("Optional specific note index; returns all if omitted")
});

export const SetPhonemesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  assignments: z.array(PhonemeAssignmentSchema).describe("List of phoneme assignments for notes"),
  dry_run: z.boolean().default(false).describe("If true, simulate assignment without modifying project")
});

export const GetComputedPhonemesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index")
});

export const GetSingingProjectSnapshotSchema = z.object({
  includeComputed: z.boolean().default(true).describe("Include SynthV engine-computed phonemes for every note")
});

export const BeginFreshMusicXmlChoirJobSchema = z.object({
  musicxmlPath: z.string().min(1).describe("Absolute path to the uncompressed MusicXML authority"),
  expectedOutputPath: z.string().min(1).describe("Absolute path for a new, not-yet-existing .svp output")
});

const TrackMapSchema = z.record(
  z.string(),
  z.number().int().min(0).describe("0-based SynthV track index")
).default({});

export const AuditMusicXmlLyricsSchema = z.object({
  musicxmlPath: z.string().min(1).describe("Absolute path to an uncompressed .musicxml or .xml authority file"),
  freshJobId: z.string().min(1).optional().describe("Job ID from begin_fresh_musicxml_choir_job; makes from-scratch provenance a mandatory audit gate"),
  trackMap: TrackMapSchema.describe("MusicXML part ID/name to 0-based SynthV track index"),
  profile: z.literal("ecclesiastical-latin").default("ecclesiastical-latin"),
  requireDirectPhonemes: z.boolean().default(true),
  requireDirectLyricLabels: z.boolean().default(true).describe("Require visible SynthV lyrics to contain the planned direct phonemes, eliminating + and - placeholders"),
  verifyComputedPhonemes: z.boolean().default(true),
  onsetToleranceBlicks: z.number().int().min(0).default(1),
  durationToleranceBlicks: z.number().int().min(0).default(1)
});

export const RepairMusicXmlLyricsSchema = AuditMusicXmlLyricsSchema.extend({
  auditId: z.string().min(1).optional().describe("Required for a real mutation; returned by audit_musicxml_lyrics"),
  dry_run: z.boolean().default(true),
  rewriteLyrics: z.boolean().default(true).describe("Replace placeholder/source labels with MusicXML-derived direct-phoneme labels in the same atomic batch"),
  renderWaitMs: z.number().int().min(0).max(60_000).default(15_000)
});

export const GetNoteAttributesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  noteIndex: z.number().int().min(0).describe("0-based note index")
});

export const SetNoteAttributesSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  noteIndex: z.number().int().min(0).describe("0-based note index"),
  attributes: NoteAttributesSchema.optional().describe("Full attributes object including per-phoneme attributes"),
  detune: z.number().optional().describe("Detune in cents"),
  languageOverride: z.string().optional(),
  musicalType: z.enum(["sing", "rap"]).optional(),
  rapAccent: z.string().optional(),
  dry_run: z.boolean().default(false).describe("If true, simulate modification without modifying project")
});

export const GetVoiceSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index")
});

export const SetVoiceSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  voice: VoiceSettingsSchema.describe("Voice parameter settings"),
  dry_run: z.boolean().default(false).describe("If true, simulate modification without modifying project")
});

export const GetParametersSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  paramName: z.string().describe("Parameter curve name (e.g. 'pitchDelta', 'vibratoEnv', 'loudness', 'tension', 'breathiness', 'voicing', 'gender', 'vocalMode_<Name>')"),
  minOnset: z.number().int().min(0).optional().describe("Start onset in blicks"),
  maxOnset: z.number().int().min(0).optional().describe("End onset in blicks")
});

export const SetParametersSchema = z.object({
  trackIndex: z.number().int().min(0).default(0).describe("0-based track index"),
  groupIndex: z.number().int().min(0).default(0).describe("0-based group reference index"),
  paramName: z.string().describe("Parameter curve name (e.g. 'pitchDelta', 'loudness', 'tension', 'breathiness', 'voicing', 'gender')"),
  mode: z.enum(["add", "replace_all", "remove_range"]).default("add").describe("Mode of parameter editing"),
  minOnset: z.number().int().min(0).optional().describe("Start onset for range removal or simplification"),
  maxOnset: z.number().int().min(0).optional().describe("End onset for range removal or simplification"),
  points: z.array(z.tuple([z.number().int().min(0), z.number()])).optional().describe("Array of [blick, value] pairs to add"),
  simplifyThreshold: z.number().optional().describe("Threshold for curve simplification"),
  dry_run: z.boolean().default(false).describe("If true, simulate modification without modifying project")
});

export const PlaySchema = z.object({});
export const PauseSchema = z.object({});
export const StopSchema = z.object({});
export const SeekSchema = z.object({
  positionSeconds: z.number().min(0).describe("Playhead position in seconds")
});
export const GetPlayheadSchema = z.object({});
export const LoopSchema = z.object({
  tBegin: z.number().min(0).describe("Loop start time in seconds"),
  tEnd: z.number().positive().describe("Loop end time in seconds")
});

export const BatchOperationSchema = z.object({
  action: z.enum([
    "add_notes",
    "update_notes",
    "delete_notes",
    "set_phonemes",
    "set_note_attributes",
    "set_voice",
    "set_parameters"
  ]).describe("Action to execute in batch"),
  params: z.record(z.string(), z.any()).describe("Parameters for the action")
});

export const BatchEditSchema = z.object({
  operations: z.array(BatchOperationSchema).describe("Ordered list of editing operations to apply atomically"),
  dry_run: z.boolean().default(false).describe("If true, preview changes across all steps without modifying project")
});
