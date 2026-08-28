import { afterEach, describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { openProjectFile, validateProjectFile } from "../src/project-file.js";

const created: string[] = [];

afterEach(async () => {
  await Promise.all(created.splice(0).map(item => fs.rm(item, { recursive: true, force: true })));
});

describe("project file automation", () => {
  it("returns an argv-only dry run for a supported absolute file", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "sv-mcp-project-"));
    created.push(root);
    const source = path.join(root, "score.musicxml");
    await fs.writeFile(source, "<score-partwise/>");
    const result = await openProjectFile({ path: source });
    expect(result.dry_run).toBe(true);
    expect(result.command).toEqual(["/usr/bin/open", "-a", "Synthesizer V Studio 2 Pro", source]);
  });

  it("rejects relative and unsupported paths", async () => {
    await expect(validateProjectFile("score.svp")).rejects.toThrow("absolute");
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "sv-mcp-project-"));
    created.push(root);
    const source = path.join(root, "score.txt");
    await fs.writeFile(source, "x");
    await expect(validateProjectFile(source)).rejects.toThrow("unsupported");
  });

  it("requires explicit replacement authorization for a live open", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "sv-mcp-project-"));
    created.push(root);
    const source = path.join(root, "score.svp");
    await fs.writeFile(source, "{}");
    await expect(openProjectFile({ path: source, dry_run: false })).rejects.toThrow("allowReplaceCurrentProject");
  });
});
