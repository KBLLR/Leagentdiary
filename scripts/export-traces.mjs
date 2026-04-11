import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "1.0.0";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const houseRoot = path.resolve(scriptDir, "..");
const EXPORT_ROOT = path.resolve(houseRoot, "exports");
const SESSION_DIR = path.join(EXPORT_ROOT, "trace.session");
const REFLECTION_DIR = path.join(EXPORT_ROOT, "trace.reflection");
const PROFILE_DIR = path.join(EXPORT_ROOT, "agent.profile");

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

const asRecord = (value) => (value && typeof value === "object" ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
const asString = (value, fallback = "") => (typeof value === "string" ? value : fallback);
const unique = (items) => Array.from(new Set(items.filter(Boolean)));
const buildProfileId = (agentHandle) => `agent:${agentHandle || "unknown"}`;

const normalizeProfile = (value) => {
  const input = asRecord(value);
  const identity = asRecord(input.identity);
  const questionnaire = asRecord(input.questionnaire);
  const media = asRecord(input.media);
  const visibility = asRecord(input.visibility);
  const notion = asRecord(input.notion);
  const agentHandle = asString(input.agent_handle || identity.agent_handle || "unknown");

  return {
    schema_version: asString(input.schema_version || "1.0.0"),
    id: asString(input.id || buildProfileId(agentHandle)),
    agent_handle: agentHandle,
    house_id: asString(input.house_id || "leagentdiary"),
    status: asString(input.status || "active"),
    created_at: asString(input.created_at),
    updated_at: asString(input.updated_at),
    identity: {
      display_name: asString(identity.display_name || identity.self_chosen_name || agentHandle || "Unknown"),
      self_chosen_name: asString(identity.self_chosen_name),
      role: asString(identity.role),
      category: asString(identity.category || "unknown"),
      origin_mode: asString(identity.origin_mode || "unknown"),
    },
    questionnaire: {
      bio: asString(questionnaire.bio),
      working_style: asString(questionnaire.working_style),
      strengths: asArray(questionnaire.strengths).map(String),
      constraints: asArray(questionnaire.constraints).map(String),
      favorite_animal: asString(questionnaire.favorite_animal),
      favorite_song: asString(questionnaire.favorite_song),
      themes: asArray(questionnaire.themes).map(String),
      signature: asString(questionnaire.signature),
    },
    media: {
      portrait_prompt: asString(media.portrait_prompt),
      portrait_image_refs: asArray(media.portrait_image_refs).map(String),
      manual_stage_prompt: asString(media.manual_stage_prompt),
      stage_scene_refs: asArray(media.stage_scene_refs).map(String),
    },
    visibility: {
      internal: visibility.internal !== false,
      public_excerpt_allowed: Boolean(visibility.public_excerpt_allowed),
    },
    notion: {
      profile_page_id: asString(notion.profile_page_id),
      journal_page_ids: asArray(notion.journal_page_ids).map(String),
      task_page_ids: asArray(notion.task_page_ids).map(String),
      workspace: asString(notion.workspace),
    },
    metadata: asRecord(input.metadata),
  };
};

const deriveProfileFromSession = (session) => {
  const handIn = asRecord(session.handIn);
  const handOff = asRecord(session.handOff);
  const agentHandle = asString(session.agent_handle || handIn.agenthandle || "unknown");

  return normalizeProfile({
    id: asString(session.profile_ref || buildProfileId(agentHandle)),
    agent_handle: agentHandle,
    house_id: "leagentdiary",
    status: "active",
    created_at: asString(session.started_at || handIn.datetimesummon),
    updated_at: asString(session.ended_at || handOff.datetimebacktosource),
    identity: {
      display_name: asString(handIn.selfchosenname || agentHandle),
      self_chosen_name: asString(handIn.selfchosenname || agentHandle),
      role: "",
      category: "unknown",
      origin_mode: asString(handIn.originmode || "unknown"),
    },
    questionnaire: {
      favorite_animal: asString(handIn.favoriteanimal),
      favorite_song: asString(handIn.favoritesong),
      signature: asString(handOff.legacySignature),
    },
    media: {
      portrait_image_refs: [],
      stage_scene_refs: [],
    },
    visibility: {
      internal: true,
      public_excerpt_allowed: Boolean(asRecord(session.reflection).public_excerpt_candidate),
    },
    notion: {
      journal_page_ids: [],
      task_page_ids: [],
    },
    metadata: {},
  });
};

const deriveTasksFromSession = (session) => {
  const tasks = asArray(session.tasks);
  if (tasks.length) {
    return tasks;
  }

  const handOff = asRecord(session.handOff);
  return asArray(handOff.actionablesForNextAgent).map((title, index) => ({
    id: `task:${session.sessionId}:${index + 1}`,
    task_id: `task:${session.sessionId}:${index + 1}`,
    title: String(title),
    status: "todo",
    priority: "medium",
    assignee: asString(session.agent_handle || asRecord(session.handIn).agenthandle),
    house_id: "leagentdiary",
    session_refs: [asString(session.sessionId)],
    handoff_refs: [`handoff:${session.sessionId}`],
    open_questions: asArray(handOff.openQuestions).map(String),
    source_refs: asArray(handOff.filesTouched).map((file) => asString(asRecord(file).path)).filter(Boolean),
    created_at: asString(handOff.datetimebacktosource),
    updated_at: asString(handOff.datetimebacktosource),
    metadata: {
      derived_from: "legacy-handOff.actionablesForNextAgent",
    },
  }));
};

const normalizeSession = (session) => {
  const input = asRecord(session);
  const handIn = asRecord(input.handIn);
  const handOff = asRecord(input.handOff);
  const sessionId = asString(input.sessionId || input.session_ref || input.id);
  const agentHandle = asString(input.agent_handle || handIn.agenthandle || "unknown");
  const tasks = deriveTasksFromSession(input);
  const reflection = asRecord(input.reflection);

  return {
    id: asString(input.id || `session:${sessionId}:${agentHandle}`),
    sessionId,
    session_ref: asString(input.session_ref || sessionId),
    source: asString(input.source || "htdi"),
    repo_id: asString(input.repo_id || "core-x-kbllr_0"),
    house_id: asString(input.house_id || "leagentdiary"),
    agent_handle: agentHandle,
    profile_ref: asString(input.profile_ref || buildProfileId(agentHandle)),
    started_at: asString(input.started_at || handIn.datetimesummon || sessionId),
    ended_at: asString(input.ended_at || handOff.datetimebacktosource || sessionId),
    status: asString(input.status || "success"),
    initial_focus: asString(input.initial_focus || handIn.initialfocus || "Review session state"),
    artifact_refs: unique(
      asArray(input.artifact_refs)
        .concat(asArray(handOff.filesTouched).map((file) => asString(asRecord(file).path)))
        .map(String)
    ),
    tasks,
    handIn: Object.keys(handIn).length ? handIn : null,
    handOff: Object.keys(handOff).length ? handOff : null,
    reflection: Object.keys(reflection).length ? reflection : null,
  };
};

const isValidSession = (session) =>
  Boolean(
    session &&
      session.sessionId &&
      session.sessionId !== "<ISO_TIMESTAMP>" &&
      session.handIn &&
      session.handOff
  );

const compareSessions = (left, right) => {
  const leftKey = `${left.sessionId}::${left.agent_handle || left.handIn?.agenthandle || ""}`;
  const rightKey = `${right.sessionId}::${right.agent_handle || right.handIn?.agenthandle || ""}`;
  return leftKey.localeCompare(rightKey);
};

const buildSessionPayload = (session, basename) => {
  const handIn = asRecord(session.handIn);
  const handOff = asRecord(session.handOff);
  const agentHandle = asString(session.agent_handle || handIn.agenthandle);
  const originMode = asString(handIn.originmode);
  const filesTouched = asArray(handOff.filesTouched);
  const tasks = deriveTasksFromSession(session);
  const actionables = tasks.map((task) => asString(asRecord(task).title)).filter(Boolean);
  const openQuestions = asArray(handOff.openQuestions).map(String);

  return {
    schema_version: SCHEMA_VERSION,
    id: `leagentdiary:session:${basename}`,
    house_id: "leagentdiary",
    source: "htdi",
    session_ref: session.sessionId,
    started_at: asString(session.started_at || handIn.datetimesummon),
    ended_at: asString(session.ended_at || handOff.datetimebacktosource),
    status: asString(session.status || "success"),
    agent_ids: [agentHandle],
    summary: asString(session.initial_focus || handIn.initialfocus),
    artifact_refs: filesTouched
      .map((file) => asString(asRecord(file).path))
      .filter(Boolean),
    tags: ["leagentdiary", agentHandle, originMode].filter(Boolean),
    metadata: {
      raw_session_id: session.sessionId,
      selfchosenname: asString(handIn.selfchosenname) || null,
      favoriteanimal: asString(handIn.favoriteanimal) || null,
      favoritesong: asString(handIn.favoritesong) || null,
      initialfocus: asString(handIn.initialfocus || session.initial_focus),
      legacySignature: asString(handOff.legacySignature) || null,
      contributions_count: asArray(handOff.contributions).length,
      files_count: filesTouched.length,
      actionables_count: actionables.length,
      open_questions_count: openQuestions.length,
    },
  };
};

const hasReflectionSignal = (session) => {
  const reflection = asRecord(session.reflection);
  const handOff = asRecord(session.handOff);

  return Boolean(
    Object.keys(reflection).length ||
      asArray(handOff.contributions).length ||
      asArray(handOff.actionablesForNextAgent).length ||
      asArray(handOff.openQuestions).length ||
      asArray(handOff.filesTouched).length
  );
};

const buildLearnings = (session) => {
  const reflection = asRecord(session.reflection);
  const learnings = asArray(reflection.learnings).map(String);
  if (learnings.length) {
    return learnings;
  }

  const handOff = asRecord(session.handOff);
  const contributions = asArray(handOff.contributions).map(String);

  if (contributions.length) {
    return contributions;
  }

  const filesTouched = asArray(handOff.filesTouched);

  if (filesTouched.length) {
    return filesTouched
      .map((file) => asString(asRecord(file).path))
      .filter(Boolean)
      .map((filePath) => `Touched ${filePath}`);
  }

  return asArray(handOff.openQuestions).map((question) => `Open question: ${String(question)}`);
};

const buildReflectionPayload = (session, basename) => {
  const handIn = asRecord(session.handIn);
  const handOff = asRecord(session.handOff);
  const reflection = asRecord(session.reflection);
  const filesTouched = asArray(handOff.filesTouched);
  const tasks = deriveTasksFromSession(session);
  const nextActions = unique(
    asArray(reflection.next_actions).map(String).concat(tasks.map((task) => asString(asRecord(task).title))).filter(Boolean)
  );
  const contributions = asArray(handOff.contributions).map(String);
  const sessionPath = path.posix.join("exports", "trace.session", `${basename}.json`);

  return {
    schema_version: SCHEMA_VERSION,
    id: `leagentdiary:reflection:${basename}`,
    session_id: `leagentdiary:session:${basename}`,
    house_id: "leagentdiary",
    created_at: asString(session.ended_at || handOff.datetimebacktosource),
    author: asString(session.agent_handle || handIn.agenthandle),
    scope: "session",
    status: asString(reflection.status || "draft"),
    visibility: asString(reflection.visibility || "internal"),
    summary:
      asString(reflection.summary) ||
      `Focused on ${asString(session.initial_focus || handIn.initialfocus)}. Captured ${contributions.length} contributions, ${filesTouched.length} files, ${nextActions.length} next actions, and ${asArray(handOff.openQuestions).length} open questions.`,
    learnings: buildLearnings(session),
    next_actions: nextActions,
    evidence_refs: [
      sessionPath,
      ...filesTouched.map((file) => asString(asRecord(file).path)).filter(Boolean),
    ],
    tags: ["leagentdiary", "reflection", "process", asString(handIn.originmode)].filter(Boolean),
    metadata: {
      session_ref: session.sessionId,
      selfchosenname: asString(handIn.selfchosenname) || null,
      belle_story_slug: asString(reflection.belle_story_slug) || null,
      notion_page_id: asString(reflection.notion_page_id) || null,
    },
  };
};

const buildProfilePayload = (profile) => ({
  schema_version: asString(profile.schema_version || "1.0.0"),
  id: asString(profile.id),
  agent_handle: asString(profile.agent_handle),
  house_id: "leagentdiary",
  status: asString(profile.status || "active"),
  created_at: asString(profile.created_at),
  updated_at: asString(profile.updated_at),
  identity: profile.identity,
  questionnaire: profile.questionnaire,
  media: profile.media,
  visibility: profile.visibility,
  notion: profile.notion,
  metadata: profile.metadata || {},
});

const resolveGeneratedAt = (payload, sessions) => {
  if (typeof payload?.generatedAt === "string" && payload.generatedAt) {
    return payload.generatedAt;
  }

  const lastCompletedAt = sessions
    .map((session) => session.ended_at || session.started_at || "")
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
  const sessions = asArray(payload?.sessions)
    .map(normalizeSession)
    .filter(isValidSession)
    .sort(compareSessions);

  const profileMap = new Map();
  asArray(payload?.profiles)
    .map(normalizeProfile)
    .forEach((profile) => {
      profileMap.set(profile.agent_handle, profile);
    });

  sessions.forEach((session) => {
    const derivedProfile = deriveProfileFromSession(session);
    if (!profileMap.has(derivedProfile.agent_handle)) {
      profileMap.set(derivedProfile.agent_handle, derivedProfile);
    }
  });

  const profiles = Array.from(profileMap.values()).sort((left, right) =>
    left.agent_handle.localeCompare(right.agent_handle)
  );

  await cleanOutputDir(SESSION_DIR);
  await cleanOutputDir(REFLECTION_DIR);
  await cleanOutputDir(PROFILE_DIR);

  const sessionFiles = [];
  const reflectionFiles = [];
  const profileFiles = [];

  for (const session of sessions) {
    const agentHandle = asString(session.agent_handle || asRecord(session.handIn).agenthandle);
    const basename = toBasename(session.sessionId, agentHandle);
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

  for (const profile of profiles) {
    const profilePath = path.join(PROFILE_DIR, `${normalizeToken(profile.agent_handle)}.json`);
    await writeJson(profilePath, buildProfilePayload(profile));
    profileFiles.push(toPosixPath(path.relative(EXPORT_ROOT, profilePath)));
  }

  sessionFiles.sort();
  reflectionFiles.sort();
  profileFiles.sort();

  const manifest = {
    schema_version: SCHEMA_VERSION,
    generated_at: resolveGeneratedAt(payload, sessions),
    source,
    sessions_exported: sessionFiles.length,
    reflections_exported: reflectionFiles.length,
    profiles_exported: profileFiles.length,
    session_files: sessionFiles,
    reflection_files: reflectionFiles,
    profile_files: profileFiles,
  };

  await writeJson(path.join(EXPORT_ROOT, "manifest.json"), manifest);
};

main().catch((error) => {
  console.error("export-traces failed", error);
  process.exit(1);
});
