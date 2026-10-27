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

export const OpenProjectFileSchema = z.object({
  path: z.string().min(1),
  dry_run: z.boolean().default(true),
  allowReplaceCurrentProject: z.boolean().default(false),
  application: z.string().min(1).optional()
});

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

// SynthV 2 Smart Pitch coordinates are group-local; computed sampling is project-absolute.
const PitchTarget = { trackIndex: z.number().int().min(0).default(0), groupIndex: z.number().int().min(0).default(0) };
const PitchPoint = z.tuple([z.number().int().finite(), z.number().finite()]);
export const GetComputedPitchSchema = z.object({ ...PitchTarget, start: z.number().int().min(0), interval: z.number().int().positive(), frames: z.number().int().min(1).max(10000) });
export const GetPitchControlsSchema = z.object(PitchTarget);
export const EditPitchControlSchema = z.object({
  ...PitchTarget, expectedSnapshot: z.string().min(1),
  operation: z.enum(["add", "update", "delete"]), index: z.number().int().min(0).optional(),
  type: z.enum(["point", "curve"]).optional(), position: z.number().int().min(0).optional(),
  pitch: z.number().finite().min(0).max(127).optional(), points: z.array(PitchPoint).min(2).max(1000).optional(),
  allowSharedGroup: z.boolean().default(false), dry_run: z.boolean().default(true)
}).superRefine((x, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  if (x.operation !== "add" && x.index === undefined) fail("index is required for update/delete");
  if (x.operation === "add" && (!x.type || x.position === undefined || x.pitch === undefined)) fail("add requires type, position and pitch");
  if (x.operation === "add" && x.type === "curve" && !x.points) fail("curve requires points");
  if (x.operation === "add" && x.type === "point" && x.points) fail("point cannot have curve points");
  if (x.operation === "update" && x.position === undefined && x.pitch === undefined && !x.points) fail("update requires a change");
  if (x.points && x.points.some((p, i) => i > 0 && p[0] <= x.points![i - 1][0])) fail("curve times must be strictly increasing");
});

// Independent SynthV 2.2.1 native operations, all indices are 0-based.
const TargetTrack = { trackIndex: z.number().int().min(0).default(0) };
export const EditorContextSchema = z.object({});
export const ConvertTimeSchema = z.object({ unit: z.enum(["blick", "seconds", "quarter"]), value: z.number().finite().min(0) });
export const SampleParameterSchema = z.object({ ...PitchTarget, paramName: z.string().min(1), positions: z.array(z.number().int().min(0)).min(1).max(1000) });
export const GetTrackStateSchema = z.object(TargetTrack);
export const EditTrackStateSchema = z.object({ ...TargetTrack, expectedSnapshot: z.string().min(1), name: z.string().min(1).max(200).optional(),
  color: z.string().regex(/^(?:#[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/).optional(), bounced: z.boolean().optional(), gain: z.number().finite().min(-24).max(24).optional(),
  pan: z.number().finite().min(-1).max(1).optional(), mute: z.boolean().optional(), solo: z.boolean().optional(), dry_run: z.boolean().default(true)
}).refine(x => [x.name,x.color,x.bounced,x.gain,x.pan,x.mute,x.solo].some(v => v !== undefined), "At least one change is required");
export const GetGroupReferenceSchema = z.object(PitchTarget);
export const EditGroupReferenceSchema = z.object({ ...PitchTarget, expectedSnapshot: z.string().min(1), timeOffset: z.number().int().min(0).optional(), pitchOffset: z.number().int().min(-127).max(127).optional(), mute: z.boolean().optional(), dry_run: z.boolean().default(true) }).refine(x => x.timeOffset !== undefined || x.pitchOffset !== undefined || x.mute !== undefined, "At least one change is required");
export const GetRetakesSchema = z.object({ ...PitchTarget, noteIndex: z.number().int().min(0) });
export const EditRetakesSchema = z.object({ ...PitchTarget, noteIndex: z.number().int().min(0), expectedSnapshot: z.string().min(1),
  operation: z.enum(["generate", "activate", "delete"]), takeId: z.number().int().min(0).optional(), newDuration: z.boolean().default(false),
  newPitch: z.boolean().default(false), newTimbre: z.boolean().default(false), allowSharedGroup: z.boolean().default(false), dry_run: z.boolean().default(true)
}).superRefine((x, ctx) => {
  const fail=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
  if (x.operation === "generate" && !x.newDuration && !x.newPitch && !x.newTimbre) fail("Select a retake variation");
  if (x.operation !== "generate" && x.takeId === undefined) fail("takeId is required");
  if (x.operation === "delete" && x.takeId === 0) fail("Default take cannot be deleted");
});

export const ProjectStructureSchema = z.object({});
export const EditStructureSchema = z.object({ expectedSnapshot: z.string().min(1), operation: z.enum(["add_track", "delete_track", "add_group", "delete_group", "add_reference", "delete_reference"]),
  trackIndex: z.number().int().min(0).optional(), groupIndex: z.number().int().min(0).optional(), groupUUID: z.string().min(1).optional(),
  name: z.string().min(1).max(200).optional(), timeOffset: z.number().int().min(0).default(0), dry_run: z.boolean().default(true)
}).superRefine((x,ctx)=>{
  const fail=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
  if (["delete_track","add_reference","delete_reference"].includes(x.operation) && x.trackIndex === undefined) fail("trackIndex required");
  if (x.operation === "delete_reference" && (x.groupIndex === undefined || x.groupIndex === 0)) fail("non-main groupIndex required");
  if (["add_reference","delete_group"].includes(x.operation) && !x.groupUUID) fail("groupUUID required");
  if (["add_track","add_group"].includes(x.operation) && !x.name) fail("name required");
});
export const EditTimeAxisSchema = z.object({expectedSnapshot:z.string().min(1), operation:z.enum(["set_tempo","delete_tempo","set_meter","delete_meter"]), position:z.number().int().min(0), bpm:z.number().finite().positive().max(1000).optional(), numerator:z.number().int().min(1).max(64).optional(), denominator:z.number().int().refine(n=>[1,2,4,8,16,32,64].includes(n)).optional(), dry_run:z.boolean().default(true)}).superRefine((x,ctx)=>{
  const fail=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
  if(x.operation === "set_tempo" && x.bpm === undefined) fail("bpm required");
  if(x.operation === "set_meter" && (x.numerator === undefined || x.denominator === undefined)) fail("numerator and denominator required");
  if(x.position === 0 && (x.operation === "delete_tempo" || x.operation === "delete_meter")) fail("Cannot delete initial mark");
});

export const EditorViewSchema = z.object({});
export const SetEditorViewSchema = z.object({ left: z.number().finite().min(0).optional(), right: z.number().finite().min(0).optional(), scale: z.number().finite().positive().optional(), centerPitch: z.number().finite().optional(), dry_run: z.boolean().default(true) }).superRefine((x,c)=>{
 if ([x.left,x.right,x.scale,x.centerPitch].every(v=>v===undefined)) c.addIssue({code:z.ZodIssueCode.custom,message:"At least one view change required"});
 if (x.left !== undefined && x.right !== undefined) c.addIssue({code:z.ZodIssueCode.custom,message:"Choose either left or right"});
});
export const SetNoteSelectionSchema = z.object({ expectedGroupUUID: z.string().min(1), mode: z.enum(["replace","add","remove","clear"]), noteIndices:z.array(z.number().int().min(0)).max(512).default([]), dry_run:z.boolean().default(true) });
export const ConvertPitchSchema = z.object({ unit:z.enum(["midi","hz"]), value:z.number().finite().min(0) }).refine(x => x.unit !== "hz" || x.value > 0, "Frequency must be positive");

export const GetPhraseContextSchema = z.object({ ...PitchTarget, start: z.number().int().min(0), end: z.number().int().positive(), limit: z.number().int().min(1).max(128).default(64), includePitch: z.boolean().default(false) }).refine(x => x.end > x.start, "end must follow start");

export const TransformNotesSchema = z.object({ ...PitchTarget, expectedSnapshot:z.string().min(1), noteIndices:z.array(z.number().int().min(0)).min(1).max(60).refine(v=>new Set(v).size===v.length, "Duplicate note indices"),
  pitchOffset:z.number().int().min(-127).max(127).default(0), onsetOffset:z.number().int().default(0), durationScale:z.number().finite().positive().max(10).default(1),
  allowSharedGroup:z.boolean().default(false), dry_run:z.boolean().default(true)
}).refine(x=>x.pitchOffset!==0 || x.onsetOffset!==0 || x.durationScale!==1, "At least one transform is required");

export const InspectMusicXmlSchema = z.object({ path:z.string().min(1), previewLimit:z.number().int().min(0).max(100).default(12) });

export const SelectionDetailsSchema = z.object({ paramName:z.string().min(1).optional() });
export const ConvertCoordinatesSchema = z.object({ direction:z.enum(["time_to_x","x_to_time","pitch_to_y","y_to_pitch","snap_time"]), value:z.number().finite() });
export const SetEditorObjectsSchema = z.object({expectedGroupUUID:z.string().min(1), kind:z.enum(["group","pitch_control"]), mode:z.enum(["replace","add","remove","clear"]), indices:z.array(z.number().int().min(0)).max(128).default([]), dry_run:z.boolean().default(true)});

export const AutomationStateSchema = z.object({ ...PitchTarget, paramName:z.string().min(1) });
export const EditAutomationSchema = z.object({ ...PitchTarget, paramName:z.string().min(1), expectedSnapshot:z.string().min(1), mode:z.enum(["add","remove_range","replace_range","simplify"]),
  start:z.number().int().min(0).optional(), end:z.number().int().min(0).optional(), points:z.array(z.tuple([z.number().int().min(0),z.number().finite()])).max(512).default([]), threshold:z.number().finite().min(0).optional(), allowSharedGroup:z.boolean().default(false), dry_run:z.boolean().default(true)
}).superRefine((x,c)=>{
 const fail=(message:string)=>c.addIssue({code:z.ZodIssueCode.custom,message});
 if(x.mode !== "add" && (x.start===undefined || x.end===undefined || x.end<x.start)) fail("A valid start/end range is required");
 if(x.mode === "add" && x.points.length===0) fail("points required");
 if(x.mode === "replace_range" && x.points.some(p => p[0] < x.start! || p[0] > x.end!)) fail("points must be inside range");
 if(new Set(x.points.map(p=>p[0])).size!==x.points.length) fail("Duplicate positions");
});

export const CopyVoiceSchema = z.object({sourceTrack:z.number().int().min(0),sourceGroup:z.number().int().min(0),targetTrack:z.number().int().min(0),targetGroup:z.number().int().min(0),expectedSource:z.string().min(1),expectedTarget:z.string().min(1),dry_run:z.boolean().default(true)});

export const ExpressionPresetSchema = z.object({ ...PitchTarget, preset:z.enum(["scoop","falloff","vibrato","crescendo","breathiness"]), start:z.number().int().min(0), end:z.number().int().positive(), amount:z.number().finite(), cycles:z.number().int().min(1).max(16).default(3), expectedSnapshot:z.string().min(1), allowSharedGroup:z.boolean().default(false), dry_run:z.boolean().default(true) }).refine(x=>x.end>x.start,"end must follow start");

export const HumanizeNotesSchema = z.object({ ...PitchTarget, expectedSnapshot:z.string().min(1), noteIndices:z.array(z.number().int().min(0)).min(1).max(60).refine(a=>new Set(a).size===a.length,"Duplicate indices"), seed:z.number().int().min(1).max(2147483646), onsetJitter:z.number().int().min(0).max(705600000), durationJitter:z.number().int().min(0).max(705600000), preserveChords:z.boolean().default(true), allowSharedGroup:z.boolean().default(false), dry_run:z.boolean().default(true) }).refine(x=>x.onsetJitter>0 || x.durationJitter>0,"Jitter must be nonzero");

export const FitLyricsSchema = z.object({ ...PitchTarget, expectedSnapshot:z.string().min(1), assignments:z.array(z.object({noteIndex:z.number().int().min(0),lyrics:z.string().min(1),phonemes:z.string().optional()})).min(1).max(60).refine(a=>new Set(a.map(x=>x.noteIndex)).size===a.length,"Duplicate note index"), allowSharedGroup:z.boolean().default(false), dry_run:z.boolean().default(true) });

export const HostClipboardSchema = z.object({operation:z.enum(["read","write"]),text:z.string().max(65536).optional(),dry_run:z.boolean().default(true)}).refine(x=>x.operation!=="write" || x.text!==undefined,"text required for write");

export const EditVoiceSettingsSchema = z.object({ ...PitchTarget, expectedSnapshot:z.string().min(1), voice:z.object({paramLoudness:z.number().finite().min(-48).max(12).optional(),paramTension:z.number().finite().min(-1).max(1).optional(),paramBreathiness:z.number().finite().min(-1).max(1).optional(),paramGender:z.number().finite().min(-1).max(1).optional(),paramToneShift:z.number().finite().min(-1).max(1).optional(),vocalModeParams:z.record(z.object({pitch:z.number().finite().min(0).max(150).optional(),timbre:z.number().finite().min(0).max(150).optional(),pronunciation:z.number().finite().min(0).max(150).optional()}).strict()).optional()}).strict().refine(x=>Object.keys(x).length>0,"voice changes required"),dry_run:z.boolean().default(true) });

export const ImportScoreLaneSchema = z.object({ ...PitchTarget, path:z.string().min(1), sourceSha256:z.string().regex(/^[a-fA-F0-9]{64}$/), partId:z.string().min(1).optional(),voice:z.string().min(1).optional(),staff:z.string().min(1).optional(),midiTrack:z.number().int().min(0).optional(),midiChannel:z.number().int().min(0).max(15).optional(),startIndex:z.number().int().min(0).default(0),limit:z.number().int().min(1).max(60).default(60),defaultLyric:z.string().min(1).default("la"),expectedSnapshot:z.string().min(1),allowSharedGroup:z.boolean().default(false),dry_run:z.boolean().default(true) });

export const ScriptDataSchema = z.object({ ...PitchTarget, noteIndex:z.number().int().min(0).optional(), object:z.enum(["project","track","group_reference","group","note"]), key:z.string().regex(/^sv-mcp\.user\.[a-zA-Z0-9_.-]{1,100}$/), operation:z.enum(["read","set","remove"]), value:z.union([z.string(),z.number().finite(),z.boolean()]).optional(), expectedSnapshot:z.string().min(1).optional(), dry_run:z.boolean().default(true) }).superRefine((x,c)=>{const fail=(message:string)=>c.addIssue({code:z.ZodIssueCode.custom,message});if(x.object==="note"&&x.noteIndex===undefined)fail("noteIndex required");if(x.operation!=="read"&&!x.expectedSnapshot)fail("snapshot required");if(x.operation==="set"&&(x.value===undefined||x.value===null))fail("scalar value required");});

export const DialogSchema = z.object({kind:z.enum(["message","input","ok_cancel","yes_no_cancel"]),title:z.string().min(1).max(200),message:z.string().max(4000),defaultText:z.string().max(1000).default(""),dry_run:z.boolean().default(true)});
export const DialogResultSchema = z.object({dialogId:z.number().int().positive()});

export const SetAutomationSelectionSchema = z.object({ expectedGroupUUID:z.string().min(1),paramName:z.string().min(1),mode:z.enum(["replace","add","remove","clear"]),positions:z.array(z.number().int().min(0)).max(512).default([]),dry_run:z.boolean().default(true) });
