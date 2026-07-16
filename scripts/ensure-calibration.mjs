import { constants } from "node:fs";
import { access, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src/config/calibration.example.ts");
const target = join(root, "src/config/calibration.ts");

try {
  await access(target, constants.F_OK);
  console.log("Calibration already exists; leaving your private values untouched.");
} catch {
  await copyFile(source, target);
  console.log("Created git-ignored src/config/calibration.ts from neutral defaults.");
}
