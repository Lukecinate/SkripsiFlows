import { ingestSource } from "./lib/ingestion.ts";
import { readFileSync } from "fs";

const content = readFileSync("./test-5mb.md", "utf8");
const start = performance.now();

const result = ingestSource({
  content,
  kind: "markdown",
  name: "test-5mb.md",
  extension: ".md"
});

const end = performance.now();
console.log("Time: " + (end - start).toFixed(2) + "ms");
console.log("Blocks: " + (result.document?.blocks.length ?? 0));
console.log("Issues: " + result.issues.length);
console.log("Success: " + !!result.document);
