import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { MailboxIPC } from "./ipc/mailbox.js";
import * as schemas from "./types/mcp.js";
import { validateParameterValue, validateMidiPitch, validateBlick } from "./engine/validator.js";
import { auditMusicXmlLyrics, beginFreshMusicXmlChoirJob, repairMusicXmlLyrics } from "./choral/service.js";
import { openProjectFile } from "./project-file.js";
import { inspectMusicXml } from "./choral/inspect.js";
import { inspectMidi } from "./choral/midi.js";
import { prepareLane } from "./choral/import-lane.js";
import { expressionPoints } from "./engine/presets.js";
export function createSynthesizerVMcpServer(ipc = new MailboxIPC()) {
    const server = new Server({
        name: "mcp-svstudio",
        version: "1.2.0"
    }, {
        capabilities: {
            tools: {}
        }
    });
    const tools = [
        // 1. Server Status, Logs & Project Info
        {
            name: "get_server_status",
            description: "Check connection status with Synthesizer V Studio 2, script heartbeat, and current project info.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        },
        {
            name: "get_server_logs",
            description: "Read the latest execution and error logs from Synthesizer V Studio Lua script.",
            inputSchema: {
                type: "object",
                properties: {
                    lines: { type: "number", description: "Number of tail lines to retrieve (default: 50)", default: 50 }
                }
            }
        },
        {
            name: "get_project_info",
            description: "Get current project metadata: duration, number of tracks, note groups, tempo marks, and measure marks.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        },
        {
            name: "open_project_file",
            description: "Deterministically ask macOS to open an absolute SVP/MusicXML/MIDI file in Synthesizer V. Defaults to dry-run and requires explicit replacement authorization. The caller must verify the resulting live project through MCP.",
            inputSchema: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute project or import file path" },
                    dry_run: { type: "boolean", default: true },
                    allowReplaceCurrentProject: { type: "boolean", default: false },
                    application: { type: "string", description: "macOS application name override" }
                },
                required: ["path"]
            }
        },
        // 2. Tracks & Groups
        {
            name: "list_tracks",
            description: "List all tracks in the project with track name, group references count, display color, and mixer settings (gain, pan, mute, solo).",
            inputSchema: {
                type: "object",
                properties: {}
            }
        },
        {
            name: "list_groups",
            description: "List all note groups in the project library with group name, UUID, and note count.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        },
        // 3. Notes Querying
        {
            name: "get_notes",
            description: "Get all notes in a specific track and group reference (0-based indices). Returns pitch, onset, duration, lyrics, phonemes, and note attributes.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", description: "0-based track index (default: 0)", default: 0 },
                    groupIndex: { type: "number", description: "0-based group reference index (default: 0)", default: 0 }
                }
            }
        },
        {
            name: "find_notes",
            description: "Search notes by onset range, pitch range, lyrics substring/regex, or phonemes. Ideal for aligning with MuseScore score data.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", description: "0-based track index", default: 0 },
                    groupIndex: { type: "number", description: "0-based group reference index", default: 0 },
                    minOnset: { type: "number", description: "Minimum onset position in blicks" },
                    maxOnset: { type: "number", description: "Maximum onset position in blicks" },
                    minPitch: { type: "number", description: "Minimum MIDI pitch (0-127)" },
                    maxPitch: { type: "number", description: "Maximum MIDI pitch (0-127)" },
                    lyricsPattern: { type: "string", description: "Substring pattern to match in lyrics" },
                    phonemesPattern: { type: "string", description: "Substring pattern to match in phonemes" }
                }
            }
        },
        // 4. Notes Editing
        {
            name: "add_notes",
            description: "Add one or more notes to a track/group. Each note requires onset (in blicks, 1 quarter = 705,600,000 blicks), duration, pitch (MIDI 0-127), lyrics, and optional phonemes.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", description: "0-based track index", default: 0 },
                    groupIndex: { type: "number", description: "0-based group reference index", default: 0 },
                    notes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                onset: { type: "number", description: "Onset in blicks" },
                                duration: { type: "number", description: "Duration in blicks" },
                                pitch: { type: "number", description: "MIDI pitch (0-127)" },
                                lyrics: { type: "string", description: "Lyrics" },
                                phonemes: { type: "string", description: "Space-separated phonemes (e.g. '.sh er')" },
                                languageOverride: { type: "string", description: "Optional language override" },
                                musicalType: { type: "string", enum: ["sing", "rap"] }
                            },
                            required: ["onset", "duration", "pitch", "lyrics"]
                        },
                        description: "Array of notes to add"
                    },
                    dry_run: { type: "boolean", description: "If true, preview addition without modifying project", default: false }
                },
                required: ["notes"]
            }
        },
        {
            name: "update_notes",
            description: "Update existing notes identified by 0-based noteIndex or locator (onset/pitch match). Supports dry_run.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", description: "0-based track index", default: 0 },
                    groupIndex: { type: "number", description: "0-based group reference index", default: 0 },
                    notes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                noteIndex: { type: "number", description: "0-based note index" },
                                locator: {
                                    type: "object",
                                    properties: {
                                        onset: { type: "number" },
                                        pitch: { type: "number" }
                                    }
                                },
                                onset: { type: "number" },
                                duration: { type: "number" },
                                pitch: { type: "number" },
                                lyrics: { type: "string" },
                                phonemes: { type: "string" },
                                languageOverride: { type: "string" },
                                musicalType: { type: "string", enum: ["sing", "rap"] }
                            }
                        },
                        description: "List of updates"
                    },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["notes"]
            }
        },
        {
            name: "delete_notes",
            description: "Delete note(s) from a group by noteIndices or locator.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    noteIndices: { type: "array", items: { type: "number" }, description: "Array of 0-based note indices to delete" },
                    noteIndex: { type: "number", description: "Single 0-based note index to delete" },
                    locator: {
                        type: "object",
                        properties: {
                            onset: { type: "number" },
                            pitch: { type: "number" }
                        }
                    },
                    dry_run: { type: "boolean", default: false }
                }
            }
        },
        // 5. Phonemes & Pronunciation
        {
            name: "get_phonemes",
            description: "Get user-specified phonemes for notes in a group or a specific noteIndex (returns empty string if none set).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    noteIndex: { type: "number", description: "Optional specific note index" }
                }
            }
        },
        {
            name: "set_phonemes",
            description: "Directly assign formal SynthV space-separated phoneme strings to notes (e.g. '.sh er', '.n ax', 'g u: t'). Solves MusicXML lyric joining issues.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    assignments: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                noteIndex: { type: "number", description: "0-based note index" },
                                locator: {
                                    type: "object",
                                    properties: {
                                        onset: { type: "number" },
                                        pitch: { type: "number" }
                                    }
                                },
                                phonemes: { type: "string", description: "Space-separated phoneme string" }
                            },
                            required: ["phonemes"]
                        },
                        description: "List of phoneme assignments"
                    },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["assignments"]
            }
        },
        {
            name: "get_computed_phonemes",
            description: "Retrieve SynthV internal synthesis engine-computed phonemes and attributes (symbol, language, activity, position, accent) using SV.getComputedAttributesForGroup.",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 }
                }
            }
        },
        {
            name: "get_singing_project_snapshot",
            description: "Read every SynthV track, group reference, absolute note position, visible lyric, direct phoneme, and computed phoneme in one call. Use this instead of manually iterating groups for whole-score verification.",
            inputSchema: {
                type: "object",
                properties: {
                    includeComputed: { type: "boolean", default: true, description: "Include engine-computed phonemes" }
                }
            }
        },
        {
            name: "begin_fresh_musicxml_choir_job",
            description: "Start a verifiable from-scratch choir import. Records the MusicXML hash and current SynthV project fingerprint, rejects an existing output path, and returns a job ID that later lyric audits use to prove a new SVP was created and reopened.",
            inputSchema: {
                type: "object",
                properties: {
                    musicxmlPath: { type: "string", description: "Absolute .musicxml or .xml path" },
                    expectedOutputPath: { type: "string", description: "Absolute path for a new, not-yet-existing .svp" }
                },
                required: ["musicxmlPath", "expectedOutputPath"]
            }
        },
        {
            name: "audit_musicxml_lyrics",
            description: "Deterministically compare every lyric-bearing MusicXML note with the active SynthV project. Returns passed=false plus complete structural, lyric-placeholder, direct-phoneme, sil, and melisma-derived pronunciation defects. Agents must not report completion unless passed=true.",
            inputSchema: {
                type: "object",
                properties: {
                    musicxmlPath: { type: "string", description: "Absolute .musicxml or .xml path" },
                    freshJobId: { type: "string", description: "Job ID from begin_fresh_musicxml_choir_job" },
                    trackMap: {
                        type: "object",
                        additionalProperties: { type: "number" },
                        default: {},
                        description: "MusicXML part ID/name to 0-based SynthV track index"
                    },
                    profile: { type: "string", enum: ["ecclesiastical-latin"], default: "ecclesiastical-latin" },
                    requireDirectPhonemes: { type: "boolean", default: true },
                    requireDirectLyricLabels: { type: "boolean", default: true },
                    verifyComputedPhonemes: { type: "boolean", default: true },
                    onsetToleranceBlicks: { type: "number", default: 1 },
                    durationToleranceBlicks: { type: "number", default: 1 }
                },
                required: ["musicxmlPath"]
            }
        },
        {
            name: "repair_musicxml_lyrics",
            description: "Create or apply the complete MusicXML-derived direct-phoneme correction plan, then re-audit the active project; a failed batch may require multiple Undo operations. Defaults to dry-run. A real mutation requires the fresh auditId returned by audit_musicxml_lyrics and refuses structural mismatches.",
            inputSchema: {
                type: "object",
                properties: {
                    musicxmlPath: { type: "string", description: "Absolute .musicxml or .xml path" },
                    freshJobId: { type: "string", description: "Job ID from begin_fresh_musicxml_choir_job" },
                    trackMap: { type: "object", additionalProperties: { type: "number" }, default: {} },
                    profile: { type: "string", enum: ["ecclesiastical-latin"], default: "ecclesiastical-latin" },
                    requireDirectPhonemes: { type: "boolean", default: true },
                    requireDirectLyricLabels: { type: "boolean", default: true },
                    verifyComputedPhonemes: { type: "boolean", default: true },
                    onsetToleranceBlicks: { type: "number", default: 1 },
                    durationToleranceBlicks: { type: "number", default: 1 },
                    auditId: { type: "string", description: "Fresh auditId; required when dry_run=false" },
                    dry_run: { type: "boolean", default: true },
                    rewriteLyrics: { type: "boolean", default: true },
                    renderWaitMs: { type: "number", default: 15000, maximum: 60000 }
                },
                required: ["musicxmlPath"]
            }
        },
        // 6. Note Attributes & Per-Phoneme Attributes
        {
            name: "get_note_attributes",
            description: "Get detailed note attributes (detune, rapAccent, per-phoneme timing/activity: leftOffset, position, activity, strength).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    noteIndex: { type: "number", description: "0-based note index" }
                },
                required: ["noteIndex"]
            }
        },
        {
            name: "set_note_attributes",
            description: "Set note attributes and per-phoneme attributes (phonemes: [{ leftOffset, position, activity, strength }]).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    noteIndex: { type: "number", description: "0-based note index" },
                    attributes: { type: "object", description: "Attributes object" },
                    detune: { type: "number", description: "Detune in cents" },
                    languageOverride: { type: "string" },
                    musicalType: { type: "string", enum: ["sing", "rap"] },
                    rapAccent: { type: "string" },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["noteIndex"]
            }
        },
        // 7. Voice & Automation Parameters
        {
            name: "get_voice",
            description: "Get voice settings on NoteGroupReference (paramLoudness, paramTension, paramBreathiness, paramGender, paramToneShift, vocalModeParams).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 }
                }
            }
        },
        {
            name: "set_voice",
            description: "Set voice settings on NoteGroupReference (loudness, tension, breathiness, gender, toneShift, vocalModeParams).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    voice: {
                        type: "object",
                        properties: {
                            paramLoudness: { type: "number", description: "Loudness in dB (-48 to 12)" },
                            paramTension: { type: "number", description: "Tension (-1.0 to 1.0)" },
                            paramBreathiness: { type: "number", description: "Breathiness (-1.0 to 1.0)" },
                            paramGender: { type: "number", description: "Gender (-1.0 to 1.0)" },
                            paramToneShift: { type: "number", description: "Tone shift" },
                            vocalModeParams: { type: "object", description: "Per-mode params: { [modeName]: { pitch, timbre, pronunciation } }" }
                        }
                    },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["voice"]
            }
        },
        {
            name: "get_parameters",
            description: "Read automation curve points for a parameter (pitchDelta, vibratoEnv, loudness, tension, breathiness, voicing, gender, vocalMode_*).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    paramName: { type: "string", description: "Parameter curve name" },
                    minOnset: { type: "number", description: "Optional start range in blicks" },
                    maxOnset: { type: "number", description: "Optional end range in blicks" }
                },
                required: ["paramName"]
            }
        },
        {
            name: "set_parameters",
            description: "Set automation points on parameter curve (add, replace_all, or remove_range).",
            inputSchema: {
                type: "object",
                properties: {
                    trackIndex: { type: "number", default: 0 },
                    groupIndex: { type: "number", default: 0 },
                    paramName: { type: "string", description: "Parameter name" },
                    mode: { type: "string", enum: ["add", "replace_all", "remove_range"], default: "add" },
                    points: {
                        type: "array",
                        items: {
                            type: "array",
                            items: { type: "number" },
                            minItems: 2,
                            maxItems: 2
                        },
                        description: "Array of [blick, value] pairs"
                    },
                    minOnset: { type: "number" },
                    maxOnset: { type: "number" },
                    simplifyThreshold: { type: "number" },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["paramName"]
            }
        },
        {
            name: "get_computed_pitch",
            description: "Sample SynthV computed pitch (MIDI semitones) at project-absolute blick positions. Requires SynthV 2.1.1+; inspect readiness and audition.",
            inputSchema: { type: "object", properties: { trackIndex: { type: "integer", default: 0 }, groupIndex: { type: "integer", default: 0 }, start: { type: "integer", minimum: 0 }, interval: { type: "integer", minimum: 1 }, frames: { type: "integer", minimum: 1, maximum: 10000 } }, required: ["start", "interval", "frames"] }
        },
        {
            name: "get_pitch_controls",
            description: "Read SynthV 2 pitch points and curves and return a snapshot required for editing. Positions are group-local blicks.",
            inputSchema: { type: "object", properties: { trackIndex: { type: "integer", default: 0 }, groupIndex: { type: "integer", default: 0 } } }
        },
        {
            name: "edit_pitch_control",
            description: "Add, update or delete one SynthV 2 pitch point/curve. Supply the latest snapshot from get_pitch_controls. Defaults to dry-run; shared groups require explicit acknowledgement.",
            inputSchema: { type: "object", properties: {
                    trackIndex: { type: "integer", default: 0 }, groupIndex: { type: "integer", default: 0 }, expectedSnapshot: { type: "string" },
                    operation: { type: "string", enum: ["add", "update", "delete"] }, index: { type: "integer", minimum: 0 },
                    type: { type: "string", enum: ["point", "curve"] }, position: { type: "integer", minimum: 0 }, pitch: { type: "number", minimum: 0, maximum: 127 },
                    points: { type: "array", items: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 } },
                    allowSharedGroup: { type: "boolean", default: false }, dry_run: { type: "boolean", default: true }
                }, required: ["expectedSnapshot", "operation"] }
        },
        { name: "get_editor_context", description: "Read current editor track, group and selected notes; indices are zero-based.", inputSchema: { type: "object", properties: {} } },
        { name: "convert_time", description: "Convert project time using the actual tempo map.", inputSchema: { type: "object", properties: { unit: { type: "string", enum: ["blick", "seconds", "quarter"] }, value: { type: "number", minimum: 0 } }, required: ["unit", "value"] } },
        { name: "sample_parameter", description: "Sample one automation parameter at group-local blick positions.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, paramName: { type: "string" }, positions: { type: "array", items: { type: "integer" }, minItems: 1, maxItems: 1000 } }, required: ["paramName", "positions"] } },
        { name: "get_track_state", description: "Read track, mixer and a snapshot for safe edits.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer", minimum: 0, default: 0 } } } },
        { name: "edit_track_state", description: "Update track name, color, export, gain, pan, mute or solo using a fresh track snapshot; defaults to dry-run.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer", minimum: 0 }, expectedSnapshot: { type: "string" }, name: { type: "string" }, color: { type: "string" }, bounced: { type: "boolean" }, gain: { type: "number" }, pan: { type: "number" }, mute: { type: "boolean" }, solo: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot"] } },
        { name: "get_group_reference", description: "Read group reference offsets, mute and fresh edit snapshot.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" } } } },
        { name: "edit_group_reference", description: "Edit group-reference offsets and mute, with fresh snapshot and dry-run.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, timeOffset: { type: "integer" }, pitchOffset: { type: "integer" }, mute: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot"] } },
        { name: "get_retakes", description: "Read note retake count and IDs generated and tracked by this MCP, plus edit snapshot.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, noteIndex: { type: "integer", minimum: 0 } }, required: ["noteIndex"] } },
        { name: "edit_retakes", description: "Generate, activate or delete an MCP-tracked retake; use latest snapshot, dry-run, and acknowledge shared groups.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, noteIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, operation: { type: "string", enum: ["generate", "activate", "delete"] }, takeId: { type: "integer" }, newDuration: { type: "boolean" }, newPitch: { type: "boolean" }, newTimbre: { type: "boolean" }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["noteIndex", "expectedSnapshot", "operation"] } },
        { name: "get_project_structure", description: "Read track and group structure and a snapshot for guarded edits.", inputSchema: { type: "object", properties: {} } },
        { name: "edit_project_structure", description: "Create/delete tracks and unreferenced library groups, or add/delete group references; dry-run and fresh structure snapshot required. Does not clone tracks or select voices.", inputSchema: { type: "object", properties: { expectedSnapshot: { type: "string" }, operation: { type: "string", enum: ["add_track", "delete_track", "add_group", "delete_group", "add_reference", "delete_reference"] }, trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, groupUUID: { type: "string" }, name: { type: "string" }, timeOffset: { type: "integer" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "operation"] } },
        { name: "get_time_axis", description: "Read tempo and meter marks and a snapshot for guarded edits.", inputSchema: { type: "object", properties: {} } },
        { name: "edit_time_axis", description: "Add/update/delete one tempo or meter mark using a fresh snapshot and dry-run; meter positions are measure numbers.", inputSchema: { type: "object", properties: { expectedSnapshot: { type: "string" }, operation: { type: "string", enum: ["set_tempo", "delete_tempo", "set_meter", "delete_meter"] }, position: { type: "integer", minimum: 0 }, bpm: { type: "number" }, numerator: { type: "integer" }, denominator: { type: "integer" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "operation", "position"] } },
        { name: "get_editor_view", description: "Read the current piano-roll view bounds and scaling.", inputSchema: { type: "object", properties: {} } },
        { name: "set_editor_view", description: "Move or scale the piano-roll view; dry-run by default.", inputSchema: { type: "object", properties: { left: { type: "number" }, right: { type: "number" }, scale: { type: "number" }, centerPitch: { type: "number" }, dry_run: { type: "boolean", default: true } } } },
        { name: "set_note_selection", description: "Select notes in the current piano-roll group. Requires current group UUID; dry-run by default.", inputSchema: { type: "object", properties: { expectedGroupUUID: { type: "string" }, mode: { type: "string", enum: ["replace", "add", "remove", "clear"] }, noteIndices: { type: "array", items: { type: "integer", minimum: 0 } }, dry_run: { type: "boolean", default: true } }, required: ["expectedGroupUUID", "mode"] } },
        { name: "convert_pitch", description: "Convert MIDI semitones and frequency in hertz.", inputSchema: { type: "object", properties: { unit: { type: "string", enum: ["midi", "hz"] }, value: { type: "number" } }, required: ["unit", "value"] } },
        { name: "get_phrase_context", description: "Read a bounded phrase and optionally sample each note's computed onset pitch; positions are group-local blicks.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, start: { type: "integer", minimum: 0 }, end: { type: "integer", minimum: 1 }, limit: { type: "integer", minimum: 1, maximum: 128, default: 64 }, includePitch: { type: "boolean", default: false } }, required: ["start", "end"] } },
        { name: "transform_notes", description: "Transpose, shift, or scale duration of up to 60 existing notes using a fresh group snapshot; shared groups require acknowledgement and dry-run is default.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, noteIndices: { type: "array", items: { type: "integer", minimum: 0 }, minItems: 1, maxItems: 60 }, pitchOffset: { type: "integer" }, onsetOffset: { type: "integer" }, durationScale: { type: "number" }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "noteIndices"] } },
        { name: "inspect_musicxml", description: "Inspect a local score-partwise MusicXML or MXL file, return SHA-256, lanes, overlap warnings and a bounded preview without modifying SynthV.", inputSchema: { type: "object", properties: { path: { type: "string" }, previewLimit: { type: "integer", minimum: 0, maximum: 100, default: 12 } }, required: ["path"] } },
        { name: "get_host_info", description: "Read SynthV host version, platform and UI language.", inputSchema: { type: "object", properties: {} } },
        { name: "get_selection_details", description: "Read selected notes, groups, pitch controls and optionally automation point positions.", inputSchema: { type: "object", properties: { paramName: { type: "string" } } } },
        { name: "set_editor_objects", description: "Change selected group references or pitch controls for the current editor; dry-run by default.", inputSchema: { type: "object", properties: { expectedGroupUUID: { type: "string" }, kind: { type: "string", enum: ["group", "pitch_control"] }, mode: { type: "string", enum: ["replace", "add", "remove", "clear"] }, indices: { type: "array", items: { type: "integer", minimum: 0 } }, dry_run: { type: "boolean", default: true } }, required: ["expectedGroupUUID", "kind", "mode"] } },
        { name: "convert_editor_coordinates", description: "Convert editor time, pitch, screen coordinates, or snap time according to the current grid.", inputSchema: { type: "object", properties: { direction: { type: "string", enum: ["time_to_x", "x_to_time", "pitch_to_y", "y_to_pitch", "snap_time"] }, value: { type: "number" } }, required: ["direction", "value"] } },
        { name: "get_automation_state", description: "Read parameter definition and all control points, returning a snapshot for guarded edits.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, paramName: { type: "string" } }, required: ["paramName"] } },
        { name: "edit_automation", description: "Safely add, remove, replace or simplify automation points using a fresh snapshot; dry-run and shared-group checks apply.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, paramName: { type: "string" }, expectedSnapshot: { type: "string" }, mode: { type: "string", enum: ["add", "remove_range", "replace_range", "simplify"] }, start: { type: "integer" }, end: { type: "integer" }, points: { type: "array", items: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 } }, threshold: { type: "number" }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["paramName", "expectedSnapshot", "mode"] } },
        { name: "get_voice_snapshot", description: "Read a group's voice parameters and guarded snapshot. SynthV does not expose the singer identity.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" } } } },
        { name: "copy_voice_settings", description: "Copy available group voice parameters and vocal mode settings with source/target snapshots; does not copy or select a singer. Defaults to dry-run.", inputSchema: { type: "object", properties: { sourceTrack: { type: "integer" }, sourceGroup: { type: "integer" }, targetTrack: { type: "integer" }, targetGroup: { type: "integer" }, expectedSource: { type: "string" }, expectedTarget: { type: "string" }, dry_run: { type: "boolean", default: true } }, required: ["sourceTrack", "sourceGroup", "targetTrack", "targetGroup", "expectedSource", "expectedTarget"] } },
        { name: "apply_expression_preset", description: "Apply an explicit scoop, falloff, vibrato, crescendo or breathiness curve in a bounded range, using a fresh automation snapshot; dry-run by default.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, preset: { type: "string", enum: ["scoop", "falloff", "vibrato", "crescendo", "breathiness"] }, start: { type: "integer" }, end: { type: "integer" }, amount: { type: "number" }, cycles: { type: "integer" }, expectedSnapshot: { type: "string" }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["preset", "start", "end", "amount", "expectedSnapshot"] } },
        { name: "humanize_notes", description: "Apply deterministic, bounded timing/duration variation to up to 60 guarded notes; optional chord alignment and dry-run by default.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, noteIndices: { type: "array", items: { type: "integer", minimum: 0 } }, seed: { type: "integer" }, onsetJitter: { type: "integer" }, durationJitter: { type: "integer" }, preserveChords: { type: "boolean", default: true }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "noteIndices", "seed", "onsetJitter", "durationJitter"] } },
        { name: "fit_lyrics", description: "Apply explicit syllable and optional formal phoneme assignments to up to 60 guarded notes; this does not infer pronunciation. Use MusicXML workflow for choir scores.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, assignments: { type: "array", items: { type: "object", properties: { noteIndex: { type: "integer" }, lyrics: { type: "string" }, phonemes: { type: "string" } }, required: ["noteIndex", "lyrics"] } }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "assignments"] } },
        { name: "host_clipboard", description: "Read or write SynthV host text clipboard. Clipboard writes default to dry-run.", inputSchema: { type: "object", properties: { operation: { type: "string", enum: ["read", "write"] }, text: { type: "string" }, dry_run: { type: "boolean", default: true } }, required: ["operation"] } },
        { name: "edit_voice_settings", description: "Update explicit voice and vocal mode parameters using a fresh voice snapshot. Does not select or identify the singer; defaults to dry-run.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, expectedSnapshot: { type: "string" }, voice: { type: "object" }, dry_run: { type: "boolean", default: true } }, required: ["expectedSnapshot", "voice"] } },
        { name: "inspect_midi", description: "Read-only inspection of a local MIDI format 0 or 1 file, with note counts, channels, SHA-256 and bounded preview.", inputSchema: { type: "object", properties: { path: { type: "string" }, previewLimit: { type: "integer", minimum: 0, maximum: 100, default: 12 } }, required: ["path"] } },
        { name: "import_score_lane", description: "Import one explicitly selected monophonic MusicXML/MXL or MIDI lane in bounded chunks. Requires source hash and fresh target snapshot. For choir use the standard MusicXML import workflow.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, path: { type: "string" }, sourceSha256: { type: "string" }, partId: { type: "string" }, voice: { type: "string" }, staff: { type: "string" }, midiTrack: { type: "integer" }, midiChannel: { type: "integer" }, startIndex: { type: "integer" }, limit: { type: "integer", maximum: 60 }, defaultLyric: { type: "string" }, expectedSnapshot: { type: "string" }, allowSharedGroup: { type: "boolean" }, dry_run: { type: "boolean", default: true } }, required: ["path", "sourceSha256", "expectedSnapshot"] } },
        { name: "script_data", description: "Read or edit namespaced scalar SV-MCP user metadata on a project, track, group reference, group or note. Writes require a fresh snapshot and default to dry-run.", inputSchema: { type: "object", properties: { trackIndex: { type: "integer" }, groupIndex: { type: "integer" }, noteIndex: { type: "integer" }, object: { type: "string", enum: ["project", "track", "group_reference", "group", "note"] }, key: { type: "string" }, operation: { type: "string", enum: ["read", "set", "remove"] }, value: {}, expectedSnapshot: { type: "string" }, dry_run: { type: "boolean", default: true } }, required: ["object", "key", "operation"] } },
        { name: "show_dialog", description: "Show an asynchronous SynthV dialog and return a dialog ID; defaults to dry-run. Use get_dialog_result to check the response.", inputSchema: { type: "object", properties: { kind: { type: "string", enum: ["message", "input", "ok_cancel", "yes_no_cancel"] }, title: { type: "string" }, message: { type: "string" }, defaultText: { type: "string" }, dry_run: { type: "boolean", default: true } }, required: ["kind", "title", "message"] } },
        { name: "get_dialog_result", description: "Read the result of a dialog opened during this MCP handler session.", inputSchema: { type: "object", properties: { dialogId: { type: "integer" } }, required: ["dialogId"] } },
        { name: "set_automation_selection", description: "Change selected automation points in the current group, using group-local blick positions and dry-run by default.", inputSchema: { type: "object", properties: { expectedGroupUUID: { type: "string" }, paramName: { type: "string" }, mode: { type: "string", enum: ["replace", "add", "remove", "clear"] }, positions: { type: "array", items: { type: "integer", minimum: 0 } }, dry_run: { type: "boolean", default: true } }, required: ["expectedGroupUUID", "paramName", "mode"] } },
        // 8. Playback Controls
        {
            name: "play",
            description: "Start playback in Synthesizer V Studio.",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "pause",
            description: "Pause playback in Synthesizer V Studio without resetting playhead.",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "stop",
            description: "Stop playback and return playhead to start position.",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "seek",
            description: "Seek playhead to specific time in seconds.",
            inputSchema: {
                type: "object",
                properties: {
                    positionSeconds: { type: "number", description: "Playhead position in seconds" }
                },
                required: ["positionSeconds"]
            }
        },
        {
            name: "get_playhead",
            description: "Get playhead position in seconds and status ('playing', 'looping', 'stopped').",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "loop",
            description: "Start loop playback between tBegin and tEnd in seconds.",
            inputSchema: {
                type: "object",
                properties: {
                    tBegin: { type: "number", description: "Start time in seconds" },
                    tEnd: { type: "number", description: "End time in seconds" }
                },
                required: ["tBegin", "tEnd"]
            }
        },
        // 9. Batch Operations
        {
            name: "batch_edit",
            description: "Execute note/phoneme/voice/parameter operations sequentially. A failed batch may leave earlier operations applied; use SynthV Undo as needed. Dry-run is recommended.",
            inputSchema: {
                type: "object",
                properties: {
                    operations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                action: {
                                    type: "string",
                                    enum: ["add_notes", "update_notes", "delete_notes", "set_phonemes", "set_note_attributes", "set_voice", "set_parameters"]
                                },
                                params: { type: "object" }
                            },
                            required: ["action", "params"]
                        }
                    },
                    dry_run: { type: "boolean", default: false }
                },
                required: ["operations"]
            }
        }
    ];
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: rawArgs } = request.params;
        try {
            let result;
            switch (name) {
                case "get_server_status": {
                    schemas.GetServerStatusSchema.parse(rawArgs || {});
                    const health = await ipc.checkHealth();
                    if (!health.healthy) {
                        result = {
                            status: "offline",
                            healthy: false,
                            message: health.message,
                            heartbeat: health.heartbeat || null
                        };
                    }
                    else {
                        const remoteStatus = await ipc.execute("get_server_status", rawArgs || {});
                        result = {
                            status: "connected",
                            healthy: true,
                            message: health.message,
                            server: remoteStatus,
                            heartbeat: health.heartbeat
                        };
                    }
                    break;
                }
                case "get_server_logs": {
                    const maxLines = (rawArgs && typeof rawArgs.lines === "number") ? rawArgs.lines : 50;
                    const logPaths = [
                        "/tmp/mcp-svstudio.log",
                        path.join(ipc.getIpcDir(), "mcp-svstudio.log"),
                        path.join(os.homedir(), ".mcp-svstudio", "ipc", "mcp-svstudio.log")
                    ];
                    const logsFound = {};
                    for (const lp of logPaths) {
                        try {
                            const content = await fs.readFile(lp, "utf-8");
                            const lines = content.trim().split("\n");
                            logsFound[lp] = lines.slice(-maxLines);
                        }
                        catch { }
                    }
                    result = { logs: logsFound };
                    break;
                }
                case "get_project_info": {
                    schemas.GetProjectInfoSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_project_info", rawArgs || {});
                    break;
                }
                case "open_project_file": {
                    const args = schemas.OpenProjectFileSchema.parse(rawArgs || {});
                    result = await openProjectFile(args);
                    break;
                }
                case "list_tracks": {
                    schemas.ListTracksSchema.parse(rawArgs || {});
                    result = await ipc.execute("list_tracks", rawArgs || {});
                    break;
                }
                case "list_groups": {
                    schemas.ListGroupsSchema.parse(rawArgs || {});
                    result = await ipc.execute("list_groups", rawArgs || {});
                    break;
                }
                case "get_notes": {
                    const args = schemas.GetNotesSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_notes", args);
                    break;
                }
                case "find_notes": {
                    const args = schemas.FindNotesSchema.parse(rawArgs || {});
                    result = await ipc.execute("find_notes", args);
                    break;
                }
                case "add_notes": {
                    const args = schemas.AddNotesSchema.parse(rawArgs || {});
                    for (const n of args.notes) {
                        const pitchVal = validateMidiPitch(n.pitch);
                        if (!pitchVal.valid)
                            throw new McpError(ErrorCode.InvalidParams, pitchVal.error);
                        const onsetVal = validateBlick(n.onset, "onset");
                        if (!onsetVal.valid)
                            throw new McpError(ErrorCode.InvalidParams, onsetVal.error);
                        const durVal = validateBlick(n.duration, "duration");
                        if (!durVal.valid)
                            throw new McpError(ErrorCode.InvalidParams, durVal.error);
                    }
                    result = await ipc.execute("add_notes", args);
                    break;
                }
                case "update_notes": {
                    const args = schemas.UpdateNotesSchema.parse(rawArgs || {});
                    for (const u of args.notes) {
                        if (u.pitch !== undefined) {
                            const pv = validateMidiPitch(u.pitch);
                            if (!pv.valid)
                                throw new McpError(ErrorCode.InvalidParams, pv.error);
                        }
                        if (u.onset !== undefined) {
                            const ov = validateBlick(u.onset, "onset");
                            if (!ov.valid)
                                throw new McpError(ErrorCode.InvalidParams, ov.error);
                        }
                        if (u.duration !== undefined) {
                            const dv = validateBlick(u.duration, "duration");
                            if (!dv.valid)
                                throw new McpError(ErrorCode.InvalidParams, dv.error);
                        }
                    }
                    result = await ipc.execute("update_notes", args);
                    break;
                }
                case "delete_notes": {
                    const args = schemas.DeleteNotesSchema.parse(rawArgs || {});
                    result = await ipc.execute("delete_notes", args);
                    break;
                }
                case "get_phonemes": {
                    const args = schemas.GetPhonemesSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_phonemes", args);
                    break;
                }
                case "set_phonemes": {
                    const args = schemas.SetPhonemesSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_phonemes", args);
                    break;
                }
                case "get_computed_phonemes": {
                    const args = schemas.GetComputedPhonemesSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_computed_phonemes", args);
                    break;
                }
                case "get_singing_project_snapshot": {
                    const args = schemas.GetSingingProjectSnapshotSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_singing_project_snapshot", args, 30_000);
                    break;
                }
                case "begin_fresh_musicxml_choir_job": {
                    const args = schemas.BeginFreshMusicXmlChoirJobSchema.parse(rawArgs || {});
                    result = await beginFreshMusicXmlChoirJob(ipc, args);
                    break;
                }
                case "audit_musicxml_lyrics": {
                    const args = schemas.AuditMusicXmlLyricsSchema.parse(rawArgs || {});
                    result = await auditMusicXmlLyrics(ipc, args);
                    break;
                }
                case "repair_musicxml_lyrics": {
                    const args = schemas.RepairMusicXmlLyricsSchema.parse(rawArgs || {});
                    result = await repairMusicXmlLyrics(ipc, args);
                    break;
                }
                case "get_note_attributes": {
                    const args = schemas.GetNoteAttributesSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_note_attributes", args);
                    break;
                }
                case "set_note_attributes": {
                    const args = schemas.SetNoteAttributesSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_note_attributes", args);
                    break;
                }
                case "get_voice": {
                    const args = schemas.GetVoiceSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_voice", args);
                    break;
                }
                case "set_voice": {
                    const args = schemas.SetVoiceSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_voice", args);
                    break;
                }
                case "get_parameters": {
                    const args = schemas.GetParametersSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_parameters", args);
                    break;
                }
                case "set_parameters": {
                    const args = schemas.SetParametersSchema.parse(rawArgs || {});
                    if (args.points) {
                        for (const [b, v] of args.points) {
                            const blickVal = validateBlick(b, "parameter blick position");
                            if (!blickVal.valid)
                                throw new McpError(ErrorCode.InvalidParams, blickVal.error);
                            const valCheck = validateParameterValue(args.paramName, v);
                            if (!valCheck.valid)
                                throw new McpError(ErrorCode.InvalidParams, valCheck.error);
                        }
                    }
                    result = await ipc.execute("set_parameters", args);
                    break;
                }
                case "get_computed_pitch": {
                    const args = schemas.GetComputedPitchSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_computed_pitch", args, 30_000);
                    break;
                }
                case "get_pitch_controls": {
                    const args = schemas.GetPitchControlsSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_pitch_controls", args);
                    break;
                }
                case "edit_pitch_control": {
                    const args = schemas.EditPitchControlSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_pitch_control", args);
                    break;
                }
                case "get_editor_context": {
                    const args = schemas.EditorContextSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_editor_context", args);
                    break;
                }
                case "convert_time": {
                    const args = schemas.ConvertTimeSchema.parse(rawArgs || {});
                    result = await ipc.execute("convert_time", args);
                    break;
                }
                case "sample_parameter": {
                    const args = schemas.SampleParameterSchema.parse(rawArgs || {});
                    result = await ipc.execute("sample_parameter", args);
                    break;
                }
                case "get_track_state": {
                    const args = schemas.GetTrackStateSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_track_state", args);
                    break;
                }
                case "edit_track_state": {
                    const args = schemas.EditTrackStateSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_track_state", args);
                    break;
                }
                case "get_group_reference": {
                    const args = schemas.GetGroupReferenceSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_group_reference", args);
                    break;
                }
                case "edit_group_reference": {
                    const args = schemas.EditGroupReferenceSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_group_reference", args);
                    break;
                }
                case "get_retakes": {
                    const args = schemas.GetRetakesSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_retakes", args);
                    break;
                }
                case "edit_retakes": {
                    const args = schemas.EditRetakesSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_retakes", args);
                    break;
                }
                case "get_project_structure": {
                    const args = schemas.ProjectStructureSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_project_structure", args);
                    break;
                }
                case "edit_project_structure": {
                    const args = schemas.EditStructureSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_project_structure", args);
                    break;
                }
                case "get_time_axis": {
                    const args = schemas.ProjectStructureSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_time_axis", args);
                    break;
                }
                case "edit_time_axis": {
                    const args = schemas.EditTimeAxisSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_time_axis", args);
                    break;
                }
                case "get_editor_view": {
                    const args = schemas.EditorViewSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_editor_view", args);
                    break;
                }
                case "set_editor_view": {
                    const args = schemas.SetEditorViewSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_editor_view", args);
                    break;
                }
                case "set_note_selection": {
                    const args = schemas.SetNoteSelectionSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_note_selection", args);
                    break;
                }
                case "convert_pitch": {
                    const args = schemas.ConvertPitchSchema.parse(rawArgs || {});
                    result = await ipc.execute("convert_pitch", args);
                    break;
                }
                case "get_phrase_context": {
                    const args = schemas.GetPhraseContextSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_phrase_context", args, 30_000);
                    break;
                }
                case "transform_notes": {
                    const args = schemas.TransformNotesSchema.parse(rawArgs || {});
                    result = await ipc.execute("transform_notes", args, 30_000);
                    break;
                }
                case "inspect_musicxml": {
                    const args = schemas.InspectMusicXmlSchema.parse(rawArgs || {});
                    result = await inspectMusicXml(args.path, args.previewLimit);
                    break;
                }
                case "get_host_info": {
                    const args = schemas.ProjectStructureSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_host_info", args);
                    break;
                }
                case "get_selection_details": {
                    const args = schemas.SelectionDetailsSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_selection_details", args);
                    break;
                }
                case "set_editor_objects": {
                    const args = schemas.SetEditorObjectsSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_editor_objects", args);
                    break;
                }
                case "convert_editor_coordinates": {
                    const args = schemas.ConvertCoordinatesSchema.parse(rawArgs || {});
                    result = await ipc.execute("convert_editor_coordinates", args);
                    break;
                }
                case "get_automation_state": {
                    const args = schemas.AutomationStateSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_automation_state", args, 30000);
                    break;
                }
                case "edit_automation": {
                    const args = schemas.EditAutomationSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_automation", args, 30000);
                    break;
                }
                case "get_voice_snapshot": {
                    const args = schemas.GetGroupReferenceSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_voice_snapshot", args);
                    break;
                }
                case "copy_voice_settings": {
                    const args = schemas.CopyVoiceSchema.parse(rawArgs || {});
                    result = await ipc.execute("copy_voice_settings", args);
                    break;
                }
                case "apply_expression_preset": {
                    const args = schemas.ExpressionPresetSchema.parse(rawArgs || {});
                    const plan = expressionPoints(args.preset, args.start, args.end, args.amount, args.cycles);
                    result = await ipc.execute("edit_automation", { trackIndex: args.trackIndex, groupIndex: args.groupIndex, paramName: plan.paramName, expectedSnapshot: args.expectedSnapshot, mode: "replace_range", start: args.start, end: args.end, points: plan.points, allowSharedGroup: args.allowSharedGroup, dry_run: args.dry_run }, 30000);
                    break;
                }
                case "humanize_notes": {
                    const args = schemas.HumanizeNotesSchema.parse(rawArgs || {});
                    result = await ipc.execute("humanize_notes", args, 30000);
                    break;
                }
                case "fit_lyrics": {
                    const args = schemas.FitLyricsSchema.parse(rawArgs || {});
                    result = await ipc.execute("fit_lyrics", args, 30000);
                    break;
                }
                case "host_clipboard": {
                    const args = schemas.HostClipboardSchema.parse(rawArgs || {});
                    result = await ipc.execute("host_clipboard", args);
                    break;
                }
                case "edit_voice_settings": {
                    const args = schemas.EditVoiceSettingsSchema.parse(rawArgs || {});
                    result = await ipc.execute("edit_voice_settings", args);
                    break;
                }
                case "inspect_midi": {
                    const args = schemas.InspectMusicXmlSchema.parse(rawArgs || {});
                    result = await inspectMidi(args.path, args.previewLimit);
                    break;
                }
                case "import_score_lane": {
                    const args = schemas.ImportScoreLaneSchema.parse(rawArgs || {});
                    const lane = await prepareLane(args);
                    const applied = await ipc.execute("import_score_notes", { trackIndex: args.trackIndex, groupIndex: args.groupIndex, expectedSnapshot: args.expectedSnapshot, allowSharedGroup: args.allowSharedGroup, dry_run: args.dry_run, notes: lane.notes }, 30000);
                    result = { sourceSha256: lane.sha256, total: lane.total, startIndex: lane.startIndex, nextIndex: lane.nextIndex, ...applied };
                    break;
                }
                case "script_data": {
                    const args = schemas.ScriptDataSchema.parse(rawArgs || {});
                    result = await ipc.execute("script_data", args);
                    break;
                }
                case "show_dialog": {
                    const args = schemas.DialogSchema.parse(rawArgs || {});
                    result = await ipc.execute("show_dialog", args);
                    break;
                }
                case "get_dialog_result": {
                    const args = schemas.DialogResultSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_dialog_result", args);
                    break;
                }
                case "set_automation_selection": {
                    const args = schemas.SetAutomationSelectionSchema.parse(rawArgs || {});
                    result = await ipc.execute("set_automation_selection", args);
                    break;
                }
                case "play": {
                    schemas.PlaySchema.parse(rawArgs || {});
                    result = await ipc.execute("play", {});
                    break;
                }
                case "pause": {
                    schemas.PauseSchema.parse(rawArgs || {});
                    result = await ipc.execute("pause", {});
                    break;
                }
                case "stop": {
                    schemas.StopSchema.parse(rawArgs || {});
                    result = await ipc.execute("stop", {});
                    break;
                }
                case "seek": {
                    const args = schemas.SeekSchema.parse(rawArgs || {});
                    result = await ipc.execute("seek", args);
                    break;
                }
                case "get_playhead": {
                    schemas.GetPlayheadSchema.parse(rawArgs || {});
                    result = await ipc.execute("get_playhead", {});
                    break;
                }
                case "loop": {
                    const args = schemas.LoopSchema.parse(rawArgs || {});
                    result = await ipc.execute("loop", args);
                    break;
                }
                case "batch_edit": {
                    const args = schemas.BatchEditSchema.parse(rawArgs || {});
                    result = await ipc.execute("batch_edit", args);
                    break;
                }
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' not found`);
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
        catch (err) {
            if (err instanceof McpError) {
                throw err;
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: err.message || String(err),
                            success: false
                        }, null, 2)
                    }
                ],
                isError: true
            };
        }
    });
    return server;
}
//# sourceMappingURL=server.js.map