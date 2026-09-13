// Runs TypeScript tests through the compiler API, without child processes.
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const root = path.resolve("work/test-output");
const sources = [
  "lib/content.ts",
  "lib/validation.ts",
  "lib/csv.ts",
  "lib/email-templates.ts",
  "tests/validation.test.ts",
  "tests/database.test.ts",
];
for (const file of sources) {
  const target = path.join(root, file.replace(/\.ts$/, ".js"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const source = fs
    .readFileSync(file, "utf8")
    .replace(
      "new URL('../supabase/migrations/'+file,import.meta.url)",
      "process.cwd()+'/supabase/migrations/'+file",
    );
  fs.writeFileSync(
    target,
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
  );
}
const require = createRequire(import.meta.url);
require(path.join(root, "tests/validation.test.js"));
require(path.join(root, "tests/database.test.js"));
