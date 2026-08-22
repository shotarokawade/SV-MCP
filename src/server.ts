import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { MailboxIPC } from "./ipc/mailbox.js";
import * as schemas from "./types/mcp.js";
import { validateParameterValue, validateMidiPitch, validateBlick } from "./engine/validator.js";

export function createSynthesizerVMcpServer(ipc: MailboxIPC = new MailboxIPC()): Server {
  const server = new Server(
    {
      name: "mcp-svstudio",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

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
      description: "Execute multiple note/phoneme/voice/parameter operations in a single atomic transaction with snapshot rollback.",
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
      let result: any;

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
          } else {
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
          const logsFound: Record<string, string[]> = {};
          for (const lp of logPaths) {
            try {
              const content = await fs.readFile(lp, "utf-8");
              const lines = content.trim().split("\n");
              logsFound[lp] = lines.slice(-maxLines);
            } catch {}
          }
          result = { logs: logsFound };
          break;
        }

        case "get_project_info": {
          schemas.GetProjectInfoSchema.parse(rawArgs || {});
          result = await ipc.execute("get_project_info", rawArgs || {});
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
            if (!pitchVal.valid) throw new McpError(ErrorCode.InvalidParams, pitchVal.error!);
            const onsetVal = validateBlick(n.onset, "onset");
            if (!onsetVal.valid) throw new McpError(ErrorCode.InvalidParams, onsetVal.error!);
            const durVal = validateBlick(n.duration, "duration");
            if (!durVal.valid) throw new McpError(ErrorCode.InvalidParams, durVal.error!);
          }
          result = await ipc.execute("add_notes", args);
          break;
        }

        case "update_notes": {
          const args = schemas.UpdateNotesSchema.parse(rawArgs || {});
          for (const u of args.notes) {
            if (u.pitch !== undefined) {
              const pv = validateMidiPitch(u.pitch);
              if (!pv.valid) throw new McpError(ErrorCode.InvalidParams, pv.error!);
            }
            if (u.onset !== undefined) {
              const ov = validateBlick(u.onset, "onset");
              if (!ov.valid) throw new McpError(ErrorCode.InvalidParams, ov.error!);
            }
            if (u.duration !== undefined) {
              const dv = validateBlick(u.duration, "duration");
              if (!dv.valid) throw new McpError(ErrorCode.InvalidParams, dv.error!);
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
              if (!blickVal.valid) throw new McpError(ErrorCode.InvalidParams, blickVal.error!);
              const valCheck = validateParameterValue(args.paramName, v);
              if (!valCheck.valid) throw new McpError(ErrorCode.InvalidParams, valCheck.error!);
            }
          }
          result = await ipc.execute("set_parameters", args);
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
    } catch (err: any) {
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
