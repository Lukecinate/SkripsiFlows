export type BlockType =
  | "metadata"
  | "chapter"
  | "section"
  | "subchapter"
  | "paragraph"
  | "list"
  | "table"
  | "image"
  | "quote"
  | "citation"
  | "reference"
  | "page-break";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DocumentBlock {
  id: string;
  type: BlockType;
  content: string;
  children?: DocumentBlock[];
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  source: "markdown" | "plain-text" | "paste" | "ai-assisted" | "manual";
  needsReview: boolean;
  metadata?: Record<string, string>;
}

export interface ReferenceEntry {
  id: string;
  type: "article" | "book" | "website" | "thesis" | "report" | "unknown";
  title: string;
  authors: string[];
  year?: number;
  doi?: string;
  url?: string;
  raw: string;
  completeness: number;
}

export interface DocumentMetadata {
  authors?: string[];
  nim?: string[];
  institution?: string;
  program?: string;
  studyProgram?: string;
  faculty?: string;
  campus?: string;
  city?: string;
  year?: number;
  supervisor?: string[];
  logoLabel?: string;
  englishTitle?: string;
}

export interface SkripsiDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  templateId: string;
  citationStyle: string;
  blocks: DocumentBlock[];
  references: ReferenceEntry[];
  reviewRequired: boolean;
  createdAt: string;
  updatedAt: string;
  documentMetadata?: DocumentMetadata;
}
