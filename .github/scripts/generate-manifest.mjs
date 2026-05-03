import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const prNumber = process.env.PR_NUMBER ?? "0";
const prTitle = process.env.PR_TITLE ?? "Unknown";
const prBody = process.env.PR_BODY ?? "";

const changedFiles = existsSync("/tmp/changed_files.txt")
  ? readFileSync("/tmp/changed_files.txt", "utf8").trim()
  : "";

const diff = existsSync("/tmp/pr_diff.txt")
  ? readFileSync("/tmp/pr_diff.txt", "utf8").trim()
  : "";

const MANIFEST_FORMAT = `---
pr: {PR_NUMBER}
date: {DATE}
title: {TITLE}
features: {COMMA_SEPARATED_FEATURE_KEYWORDS}
---

## Summary
{1-3 sentence description of what was done and why}

## Changed files
- \`path/to/file.tsx\` — what changed and why
- \`path/to/other.ts\` — what changed and why

## Created files
- \`path/to/new.tsx\` — what it does

## Key implementation details
- {Specific pattern, prop name, API used — enough for a developer or AI to understand how it works}
- {Breaking changes, migration notes, non-obvious decisions}

## Likely affected screens
- {Screen or component name} — {why it could be affected}`;

const prompt = `You are generating a feature memory manifest for a codebase. This manifest will be used by an AI bug-fixer to understand what changed in a PR, which files are involved, and what could cause bugs.

PR #${prNumber}: ${prTitle}

PR description:
${prBody || "(no description)"}

Changed files:
${changedFiles || "(not available)"}

Code diff (may be truncated):
\`\`\`
${diff || "(not available)"}
\`\`\`

Generate a feature memory manifest using EXACTLY this format:
${MANIFEST_FORMAT}

Rules:
- Replace {DATE} with today's date: ${new Date().toISOString().slice(0, 10)}
- Replace {PR_NUMBER} with: ${prNumber}
- features: field — comma-separated keywords: screen names, section names, library names, feature names (e.g. "Registration, StepForm, Validation, React Hook Form")
- ## Changed files — must use backtick format with description. Only include files that actually changed.
- ## Created files — only if new files were created. Omit section if none.
- ## Key implementation details — the most important things for understanding this change: component props, state management patterns, library usage, non-obvious decisions, breaking changes
- ## Likely affected screens — which other parts of the app could be affected
- Be specific and technical. This is read by an AI, not a human.
- Output ONLY the markdown, no other text.`;

const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  messages: [{ role: "user", content: prompt }],
});

const manifest = response.content[0].type === "text" ? response.content[0].text.trim() : "";

if (!manifest) {
  console.error("Empty manifest generated");
  process.exit(1);
}

// Generate filename
const date = new Date().toISOString().slice(0, 10);
const slug = prTitle
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 40);
const filename = `${date}-pr-${prNumber}-${slug}.md`;

const memoryDir = join(process.cwd(), ".feature-memory");
if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true });

const outputPath = join(memoryDir, filename);
writeFileSync(outputPath, manifest, "utf8");

console.log(`Generated: .feature-memory/${filename}`);
console.log(manifest);
