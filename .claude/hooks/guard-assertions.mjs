#!/usr/bin/env node
// Guardarraíl de la constitución (§5) para Claude Code: hook PreToolUse sobre Edit, Write y MultiEdit.
// Pide aprobación humana ("ask") cuando una edición en tests/, pages/ o fixtures/:
//   - borra o cambia una línea con expect(...)
//   - agrega test.skip / test.fixme / .only
//   - toca un fallo sembrado de tests/faults/
// y bloquea ("deny") cualquier waitForTimeout nuevo. Agregar aserciones nuevas no requiere aprobación.

import fs from 'node:fs';
import path from 'node:path';

const GUARDED = /^(tests|pages|fixtures)\/.*\.ts$/;

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch {
    return null;
  }
}

function respond(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
    }),
  );
  process.exit(0);
}

function applyEdit(text, oldStr, newStr, all) {
  if (!oldStr) return text;
  return all ? text.split(oldStr).join(newStr) : text.replace(oldStr, () => newStr);
}

const assertionLines = (text) =>
  text
    .split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter((l) => /\bexpect(\.soft)?\(/.test(l));

const count = (text, re) => (text.match(re) || []).length;

const input = readStdin();
if (!input) process.exit(0);

const { tool_name: tool, tool_input: args = {} } = input;
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = args.file_path ? path.resolve(input.cwd || projectDir, args.file_path) : null;
if (!filePath) process.exit(0);

const rel = path.relative(projectDir, filePath).split(path.sep).join('/');
if (!GUARDED.test(rel)) process.exit(0);

const before = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
let after = before;
if (tool === 'Write') after = args.content ?? '';
else if (tool === 'Edit') after = applyEdit(before, args.old_string, args.new_string ?? '', args.replace_all);
else if (tool === 'MultiEdit') {
  for (const e of args.edits ?? []) after = applyEdit(after, e.old_string, e.new_string ?? '', e.replace_all);
} else process.exit(0);

if (count(after, /waitForTimeout\s*\(/g) > count(before, /waitForTimeout\s*\(/g)) {
  respond('deny', 'Constitución §3: prohibido waitForTimeout. Sincroniza con aserciones web (expect(locator).toBeVisible()) o con cambios de URL.');
}

const reasons = [];

if (rel.startsWith('tests/faults/') && before) {
  reasons.push(`${rel} es un fallo sembrado (dataset de calibración del triage); no debe corregirse.`);
}

const remaining = [...assertionLines(after)];
const removed = [];
for (const line of assertionLines(before)) {
  const i = remaining.indexOf(line);
  if (i >= 0) remaining.splice(i, 1);
  else removed.push(line);
}
if (removed.length) {
  const list = removed.slice(0, 5).map((l) => `  - ${l}`).join('\n');
  reasons.push(`Se borran o cambian ${removed.length} aserción(es):\n${list}\nConstitución §5: la IA no modifica aserciones para que un test pase.`);
}

const skipRe = /\btest(\.describe)?\.(skip|fixme|only)\s*\(|\btest\.describe\.only\s*\(/g;
if (count(after, skipRe) > count(before, skipRe)) {
  reasons.push('Se agrega test.skip / test.fixme / .only.');
}

if (reasons.length) {
  respond('ask', `Guardarraíl de aserciones (${rel}): requiere aprobación humana.\n${reasons.join('\n')}`);
}
process.exit(0);
