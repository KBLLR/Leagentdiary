import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const houseRoot = path.resolve(scriptDir, "..");
const exportRoot = path.join(houseRoot, "exports");
const fixtureArgs = ["run", "export:traces", "--", "--source-file", "fixtures/htdi.diary.sample.json"];

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: houseRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });

const listFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

const snapshotExports = async () => {
  const files = (await listFiles(exportRoot)).sort();
  const snapshot = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath);
    const digest = createHash("sha256").update(raw).digest("hex");

    snapshot.push({
      path: filePath.replace(`${houseRoot}${path.sep}`, "").split(path.sep).join("/"),
      sha256: digest,
    });
  }

  return snapshot;
};

const main = async () => {
  await run("npm", ["run", "lint"]);
  await run("npm", ["run", "build"]);
  await run("npm", fixtureArgs);

  const firstSnapshot = await snapshotExports();

  await run("npm", fixtureArgs);

  const secondSnapshot = await snapshotExports();

  if (JSON.stringify(firstSnapshot) !== JSON.stringify(secondSnapshot)) {
    throw new Error("Export outputs changed between identical fixture runs.")
  }

  console.log("verify:active passed");
};

main().catch((error) => {
  console.error("verify:active failed", error);
  process.exit(1);
});
