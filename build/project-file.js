import { execFile as execFileCallback } from "node:child_process";
import { access, stat } from "node:fs/promises";
import { extname, isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
const execFile = promisify(execFileCallback);
const SUPPORTED_EXTENSIONS = new Set([".svp", ".musicxml", ".xml", ".mid", ".midi"]);
export async function validateProjectFile(input) {
    if (!isAbsolute(input))
        throw new Error("path must be absolute");
    const path = resolve(input);
    const extension = extname(path).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
        throw new Error(`unsupported project input extension: ${extension || "(none)"}`);
    }
    await access(path);
    if (!(await stat(path)).isFile())
        throw new Error("path is not a file");
    return path;
}
export async function openProjectFile(request) {
    const path = await validateProjectFile(request.path);
    const application = request.application || "Synthesizer V Studio 2 Pro";
    const command = ["/usr/bin/open", "-a", application, path];
    if (request.dry_run !== false) {
        return { dry_run: true, command, path, requiresPostOpenMcpVerification: true };
    }
    if (request.allowReplaceCurrentProject !== true) {
        throw new Error("allowReplaceCurrentProject=true is required because opening replaces the active project");
    }
    await execFile(command[0], command.slice(1), { timeout: 30_000 });
    return {
        dry_run: false,
        launched: true,
        path,
        requiresPostOpenMcpVerification: true,
        verification: "Poll get_server_status and get_singing_project_snapshot; do not infer import success from this launch result."
    };
}
//# sourceMappingURL=project-file.js.map