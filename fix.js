const fs = require(fs);
let c = fs.readFileSync(lib/ingestion.ts,utf8);

// Insert after detectHeading
let old1 = 'return { type: subchapter, content, hashLevel };\n}\n\nfunction';
let new1 = `return { type: subchapter, content, hashLevel };
}

/** Heading keywords for Indonesian academic documents */
const HEADING_KEYWORDS = new Set([
  latar