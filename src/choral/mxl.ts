import { inflateRawSync } from "node:zlib";
import { XMLParser } from "fast-xml-parser";

const MAX_ENTRY = 32 * 1024 * 1024;
const u16=(b:Buffer,p:number) => {if(p<0||p+2>b.length)throw new Error("Truncated ZIP");return b.readUInt16LE(p);};
const u32=(b:Buffer,p:number) => {if(p<0||p+4>b.length)throw new Error("Truncated ZIP");return b.readUInt32LE(p);};
function crc32(bytes:Buffer) {
  let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}

/** Decode only the manifest and declared score; no archive paths are written to disk. */
export function readCompressedMusicXml(bytes:Buffer):Buffer {
  let eocd=-1;
  for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--){
    if(u32(bytes,p)===0x06054b50 && p+22+u16(bytes,p+20)===bytes.length){eocd=p;break;}
  }
  if(eocd<0)throw new Error("MXL ZIP end record not found");
  if(u16(bytes,eocd+4)!==0 || u16(bytes,eocd+6)!==0 || u16(bytes,eocd+8)!==u16(bytes,eocd+10)) throw new Error("Multi-disk ZIP is not supported");
  const count=u16(bytes,eocd+10), cdSize=u32(bytes,eocd+12), cdStart=u32(bytes,eocd+16);
  if(count>4096 || cdStart+cdSize>eocd)throw new Error("Invalid or oversized ZIP directory");
  const entries=new Map<string,{flags:number;method:number;crc:number;compressed:number;size:number;local:number}>();
  let pos=cdStart;
  for(let i=0;i<count;i++){
    if(u32(bytes,pos)!==0x02014b50 || pos+46>cdStart+cdSize)throw new Error("Invalid ZIP directory entry");
    const flags=u16(bytes,pos+8),method=u16(bytes,pos+10),crc=u32(bytes,pos+16),compressed=u32(bytes,pos+20),size=u32(bytes,pos+24);
    const n=u16(bytes,pos+28),extra=u16(bytes,pos+30),comment=u16(bytes,pos+32),local=u32(bytes,pos+42);
    if(pos+46+n+extra+comment>cdStart+cdSize)throw new Error("Truncated ZIP directory entry");
    const name=bytes.toString("utf8",pos+46,pos+46+n);
    if(entries.has(name))throw new Error("Duplicate ZIP entry");
    entries.set(name,{flags,method,crc,compressed,size,local});pos+=46+n+extra+comment;
  }
  const extract=(name:string)=>{
    const entry=entries.get(name);if(!entry)throw new Error(`MXL entry missing: ${name}`);
    if(entry.flags&1 || ![0,8].includes(entry.method))throw new Error("Unsupported encrypted or compressed ZIP entry");
    if(entry.size>MAX_ENTRY || entry.compressed>MAX_ENTRY)throw new Error("MXL entry exceeds size limit");
    const p=entry.local;if(u32(bytes,p)!==0x04034b50)throw new Error("Invalid ZIP local header");
    const start=p+30+u16(bytes,p+26)+u16(bytes,p+28),end=start+entry.compressed;
    if(start<0 || end>cdStart)throw new Error("Invalid ZIP entry bounds");
    const content=entry.method===0?bytes.subarray(start,end):inflateRawSync(bytes.subarray(start,end),{maxOutputLength:MAX_ENTRY});
    if(content.length!==entry.size || crc32(content)!==entry.crc)throw new Error("MXL entry failed integrity check");
    return content;
  };
  const manifest=extract("META-INF/container.xml").toString("utf8");
  const parsed=new XMLParser({ignoreAttributes:false,attributeNamePrefix:"@_"}).parse(manifest);
  const raw=parsed?.container?.rootfiles?.rootfile;
  const files=Array.isArray(raw)?raw:raw?[raw]:[];
  const selected=files.find((x:any)=>x?.["@_media-type"]==="application/vnd.recordare.musicxml+xml")??files[0];
  const scorePath=selected?.["@_full-path"];
  if(typeof scorePath!=="string" || !scorePath || scorePath.startsWith("/") || scorePath.includes("\\") || scorePath.split("/").some((x:string)=>x===".." || x===".")) throw new Error("Invalid MXL score path");
  return extract(scorePath);
}
