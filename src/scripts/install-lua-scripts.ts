import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getSynthVScriptDirectories(): string[] {
  const home = os.homedir();
  const platform = os.platform();

  const candidates: string[] = [];

  if (platform === "darwin") {
    candidates.push(
      path.join(home, "Library", "Application Support", "Dreamtonics", "Synthesizer V Studio 2", "scripts"),
      path.join(home, "Library", "Application Support", "Dreamtonics", "Synthesizer V Studio", "scripts")
    );
  } else if (platform === "win32") {
    const appdata = process.env.APPDATA || path.join(home, "AppData", "Roaming");
    const userDocs = path.join(home, "Documents");
    candidates.push(
      path.join(appdata, "Dreamtonics", "Synthesizer V Studio 2", "scripts"),
      path.join(userDocs, "Dreamtonics", "Synthesizer V Studio 2", "scripts"),
      path.join(appdata, "Dreamtonics", "Synthesizer V Studio", "scripts"),
      path.join(userDocs, "Dreamtonics", "Synthesizer V Studio", "scripts")
    );
  } else {
    candidates.push(
      path.join(home, ".local", "share", "Dreamtonics", "Synthesizer V Studio 2", "scripts"),
      path.join(home, ".local", "share", "Dreamtonics", "Synthesizer V Studio", "scripts")
    );
  }

  return candidates;
}

export async function installScripts(): Promise<{ installedTo: string[]; copiedFiles: string[] }> {
  const rootDir = path.resolve(__dirname, "..", "..");
  const svScriptsDir = path.join(rootDir, "sv-scripts");

  const files = [
    "StartMCPServerRequestHandler.lua",
    "StopMCPServerRequestHandler.lua"
  ];

  const targets = getSynthVScriptDirectories();
  const installedTo: string[] = [];
  const copiedFiles: string[] = [];

  for (const targetBase of targets) {
    try {
      const mcpSubDir = path.join(targetBase, "MCP");
      await fs.mkdir(mcpSubDir, { recursive: true });

      for (const file of files) {
        const srcFile = path.join(svScriptsDir, file);
        const destFile = path.join(mcpSubDir, file);
        await fs.copyFile(srcFile, destFile);
        copiedFiles.push(destFile);
      }

      installedTo.push(mcpSubDir);
    } catch {
      // Ignore directories that cannot be written or do not exist
    }
  }

  return { installedTo, copiedFiles };
}

if (process.argv[1] && (process.argv[1].endsWith("install-lua-scripts.js") || process.argv[1].endsWith("install-lua-scripts.ts"))) {
  installScripts().then((res) => {
    if (res.installedTo.length > 0) {
      console.log(`Successfully installed MCP Lua scripts to:`);
      res.installedTo.forEach((dir) => console.log(`  -> ${dir}`));
    } else {
      console.warn("Could not find Synthesizer V Studio scripts directory automatically.");
      console.warn("Please copy the files in 'sv-scripts/' manually to your Synthesizer V Studio scripts folder.");
    }
  }).catch((err) => {
    console.error("Error installing scripts:", err);
    process.exit(1);
  });
}
