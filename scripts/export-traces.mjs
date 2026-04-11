import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "1.0.0";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const houseRoot = path.resolve(scriptDir, "..");
const EXPORT_ROOT = path.resolve(houseRoot, "exports");
const SESSION_DIR = path.join(EXPORT_ROOT, "trace.session");
const REFLECTION_DIR = path.join(EXPORT_ROOT, "trace.reflection");

const normalizeUrl = (value) => String(value || "").replace(/\/+$/, "");
const DEFAULT_SOURCE_URL = `${normalizeUrl(
  process.env.HTDI_API_URL || process.env.VITE_HTDI_API_URL || "http://localhost:3000/api"
)}/diary`;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    sourceFile: "",
    sourceUrl: DEFAULT_SOURCE_URL,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--source-file") {
      parsed.sourceFile = args[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--source-url") {
      parsed.sourceUrl = args[index + 1] || DEFAULT_SOURCE_URL;
      index += 1;
    }
  }

  return parsed;
};

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const isValidSession = (session) =>
  Boolean(
    session &&
      session.sessionId &&
      session.sessionId !== "<ISO_TIMESTAMP>" &&
      session.handIn &&
      session.handOff
  );

const normalizeToken = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";

const toBasename = (sessionId, agentHandle) =>
  `${normalizeToken(sessionId)}__${normalizeToken(agentHandle)}`;

const ensureDir = (dirPath) => fs.mkdir(dirPath, { recursive: true });

const writeJson = async (filePath, payload) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
};

const cleanOutputDir = async (dirPath) => {
  await fs.rm(dirPath, { recursive: true, force: true });
  await ensureDir(dirPath);
};

const toPosixPath = (value) => value.split(path.sep).join(path.posix.sep);

const normalizeSourceUrl = (value) => {
  const url = normalizeUrl(value);
  return url.endsWith("/diary") ? url : `${url}/diary`;
};

const normalizeSourceRef = (value) => {
  const stringValue = String(value || "");

  if (/^https?:\/\//.test(stringValue)) {
    return normalizeSourceUrl(stringValue);
  }

  return toPosixPath(stringValue);
};

const signalCount = (value) => (Array.isArray(value) ? value.length : 0);

const compareSessions = (left, right) => {
  const leftKey = `${left.sessionId}::${left.handIn?.agenthandle || ""}`;
  const rightKey = `${right.sessionId}::${right.handIn?.agenthandle || ""}`;
  return leftKey.localeCompare(rightKey);
};

const buildSessionPayload = (session, basename) => {
  const agentHandle = session.handIn.agenthandle;
  const originMode = session.handIn.originmode;
  const filesTouched = Array.isArray(session.handOff.filesTouched) ? session.handOff.filesTouched : [];
  const contributions = Array.isArray(session.handOff.contributions) ? session.handOff.contributions : [];
  const actionables = Array.isArray(session.handOff.actionablesForNextAgent)
    ? session.handOff.actionablesForNextAgent
    : [];
  const openQuestions = Array.isArray(session.handOff.openQuestions) ? session.handOff.openQuestions : [];

  return {
    schema_version: SCHEMA_VERSION,
    id: `leagentdiary:session:${basename}`,
    house_id: "leagentdiary",
    source: "htdi",
    session_ref: session.sessionId,
    started_at: session.handIn.datetimesummon,
    ended_at: session.handOff.datetimebacktosource,
    status: "success",
    agent_ids: [agentHandle],
    summary: session.handIn.initialfocus,
    artifact_refs: filesTouched
      .map((file) => file?.path)
      .filter(Boolean),
    tags: ["leagentdiary", agentHandle, originMode].filter(Boolean),
    metadata: {
      raw_session_id: session.sessionId,
      selfchosenname: session.handIn.selfchosenname || null,
      favoriteanimal: session.handIn.favoriteanimal || null,
      favoritesong: session.handIn.favoritesong || null,
      initialfocus: session.handIn.initialfocus,
      legacySignature: session.handOff.legacySignature || null,
      contributions_count: contributions.length,
      files_count: filesTouched.length,
      actionables_count: actionables.length,
      open_questions_count: openQuestions.length,
    },
  };
};

const hasReflectionSignal = (session) =>
  signalCount(session.handOff?.contributions) > 0 ||
  signalCount(session.handOff?.actionablesForNextAgent) > 0 ||
  signalCount(session.handOff?.openQuestions) > 0 ||
  signalCount(session.handOff?.filesTouched) > 0;

const buildLearnings = (session) => {
  const contributions = Array.isArray(session.handOff.contributions) ? session.handOff.contributions : [];

  if (contributions.length) {
    return contributions.map(String);
  }

  const filesTouched = Array.isArray(session.handOff.filesTouched) ? session.handOff.filesTouched : [];

  if (filesTouched.length) {
    return filesTouched
      .map((file) => file?.path)
      .filter(Boolean)
      .map((filePath) => `Touched ${filePath}`);
  }

  const openQuestions = Array.isArray(session.handOff.openQuestions) ? session.handOff.openQuestions : [];

  if (openQuestions.length) {
    return openQuestions.map((question) => `Open question: ${question}`);
  }

  return [];
};

const buildReflectionPayload = (session, basename) => {
  const filesTouched = Array.isArray(session.handOff.filesTouched) ? session.handOff.filesTouched : [];
  const actionables = Array.isArray(session.handOff.actionablesForNextAgent)
    ? session.handOff.actionablesForNextAgent
    : [];
  const openQuestions = Array.isArray(session.handOff.openQuestions) ? session.handOff.openQuestions : [];
  const contributions = Array.isArray(session.handOff.contributions) ? session.handOff.contributions : [];
  const sessionPath = path.posix.join("exports", "trace.session", `${basename}.json`);

  return {
    schema_version: SCHEMA_VERSION,
    id: `leagentdiary:reflection:${basename}`,
    session_id: `leagentdiary:session:${basename}`,
    house_id: "leagentdiary",
    created_at: session.handOff.datetimebacktosource,
    author: session.handIn.agenthandle,
    scope: "session",
    status: "draft",
    visibility: "internal",
    summary: `Focused on ${session.handIn.initialfocus}. Captured ${contributions.length} contributions, ${filesTouched.length} files, ${actionables.length} actionables, and ${openQuestions.length} open questions.`,
    learnings: buildLearnings(session),
    next_actions: actionables.map(String),
    evidence_refs: [
      sessionPath,
      ...filesTouched.map((file) => file?.path).filter(Boolean),
    ],
    tags: ["leagentdiary", "reflection", "process", session.handIn.originmode].filter(Boolean),
    metadata: {
      session_ref: session.sessionId,
      selfchosenname: session.handIn.selfchosenname || null,
    },
  };
};

const resolveGeneratedAt = (payload, sessions) => {
  if (typeof payload?.generatedAt === "string" && payload.generatedAt) {
    return payload.generatedAt;
  }

  const lastCompletedAt = sessions
    .map((session) => session.handOff?.datetimebacktosource || session.handIn?.datetimesummon || "")
    .filter(Boolean)
    .sort()
    .at(-1);

  return lastCompletedAt || "1970-01-01T00:00:00Z";
};

const loadSource = async ({ sourceFile, sourceUrl }) => {
  if (sourceFile) {
    const resolved = path.resolve(houseRoot, sourceFile);
    const payload = await readJson(resolved);
    const relativePath = path.relative(houseRoot, resolved) || path.basename(resolved);

    return {
      payload,
      source: normalizeSourceRef(payload?.source || relativePath),
    };
  }

  const normalizedUrl = normalizeSourceUrl(sourceUrl);

  return {
    payload: await fetchJson(normalizedUrl),
    source: normalizedUrl,
  };
};

const main = async () => {
  const args = parseArgs();
  const { payload, source } = await loadSource(args);
  const sessions = Array.isArray(payload?.sessions)
    ? payload.sessions.filter(isValidSession).sort(compareSessions)
    : [];

  await cleanOutputDir(SESSION_DIR);
  await cleanOutputDir(REFLECTION_DIR);

  const sessionFiles = [];
  const reflectionFiles = [];

  for (const session of sessions) {
    const basename = toBasename(session.sessionId, session.handIn.agenthandle);
    const sessionPayload = buildSessionPayload(session, basename);
    const sessionPath = path.join(SESSION_DIR, `${basename}.json`);

    await writeJson(sessionPath, sessionPayload);
    sessionFiles.push(toPosixPath(path.relative(EXPORT_ROOT, sessionPath)));

    if (!hasReflectionSignal(session)) {
      continue;
    }

    const reflectionPayload = buildReflectionPayload(session, basename);
    const reflectionPath = path.join(REFLECTION_DIR, `${basename}.json`);

    await writeJson(reflectionPath, reflectionPayload);
    reflectionFiles.push(toPosixPath(path.relative(EXPORT_ROOT, reflectionPath)));
  }

  sessionFiles.sort();
  reflectionFiles.sort();

  const manifest = {
    schema_version: SCHEMA_VERSION,
    generated_at: resolveGeneratedAt(payload, sessions),
    source,
    sessions_exported: sessionFiles.length,
    reflections_exported: reflectionFiles.length,
    session_files: sessionFiles,
    reflection_files: reflectionFiles,
  };

  await writeJson(path.join(EXPORT_ROOT, "manifest.json"), manifest);
};

main().catch((error) => {
  console.error("export-traces failed", error);
  process.exit(1);
});
