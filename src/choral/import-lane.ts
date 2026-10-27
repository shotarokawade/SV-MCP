import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { readCompressedMusicXml } from "./mxl.js";
import { parseMusicXml } from "./musicxml.js";
import { parseMidi } from "./midi.js";

const QUARTER=705_600_000;
export interface ImportLaneRequest {
  path:string; sourceSha256:string; partId?:string; voice?:string; staff?:string; midiTrack?:number; midiChannel?:number;
  startIndex:number; limit:number; defaultLyric:string;
}
export async function prepareLane(args:ImportLaneRequest) {
  if(!path.isAbsolute(args.path))throw new Error("Score path must be absolute");
  const ext=path.extname(args.path).toLowerCase();
  if(![".xml",".musicxml",".mxl",".mid",".midi"].includes(ext))throw new Error("Unsupported score format");
  const info=await stat(args.path);if(!info.isFile()||info.size>16*1024*1024)throw new Error("Score must be a file at most 16 MiB");
  const bytes=await readFile(args.path);if(bytes.length>16*1024*1024)throw new Error("Score exceeds size limit");
  const sha=createHash("sha256").update(bytes).digest("hex");
  if(sha!==args.sourceSha256.toLowerCase())throw new Error("STALE_SCORE: inspect the changed source again");
  let lane:{onset:number;duration:number;pitch:number;lyrics:string}[];
  if(ext===".mid"||ext===".midi"){
    if(args.midiTrack===undefined||args.midiChannel===undefined)throw new Error("midiTrack and midiChannel are required");
    const midi=parseMidi(bytes),track=midi.tracks[args.midiTrack];if(!track)throw new Error("MIDI track not found");
    if(track.danglingNotes)throw new Error("MIDI track contains unterminated notes");
    lane=track.notes.filter(n=>n.channel===args.midiChannel).map(n=>({onset:Math.round(n.onsetTicks*QUARTER/midi.ticksPerQuarter),duration:Math.round(n.durationTicks*QUARTER/midi.ticksPerQuarter),pitch:n.pitch,lyrics:args.defaultLyric}));
  }else{
    if(!args.partId||!args.voice||!args.staff)throw new Error("partId, voice and staff are required");
    const xml=ext===".mxl"?readCompressedMusicXml(bytes):bytes;
    const part=parseMusicXml(xml.toString("utf8")).parts.find(p=>p.id===args.partId);if(!part)throw new Error("MusicXML part not found");
    lane=part.notes.filter(n=>n.voice===args.voice && n.staff===args.staff).map(n=>({onset:Math.round(n.onsetQuarter*QUARTER),duration:Math.round(n.durationQuarter*QUARTER),pitch:n.pitch,lyrics:n.lyric?.text||"+"}));
  }
  lane.sort((a,b)=>a.onset-b.onset);
  if(!lane.length)throw new Error("Score lane contains no notes");
  for(let i=0;i<lane.length;i++){
    const n=lane[i];if(!Number.isSafeInteger(n.onset)||!Number.isSafeInteger(n.duration)||n.onset<0||n.duration<1||!Number.isInteger(n.pitch)||n.pitch<0||n.pitch>127)throw new Error("Lane contains unsupported note timing or pitch");
    if(i>0 && n.onset<lane[i-1].onset+lane[i-1].duration)throw new Error("Lane is polyphonic or overlapping");
  }
  if(args.startIndex>=lane.length)throw new Error("startIndex outside lane");
  const notes=lane.slice(args.startIndex,args.startIndex+args.limit);
  return {sha256:sha,total:lane.length,startIndex:args.startIndex,nextIndex:args.startIndex+notes.length<lane.length?args.startIndex+notes.length:null,notes};
}
