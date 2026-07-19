"use client";

import { useMemo } from "react";
import { analyzeCitations, parseReferences } from "../../../../lib/citation";
import type { SkripsiDocument, DocumentBlock } from "../../../../lib/document-model";

export interface UseCitationAnalysisReturn {
  referenceBlock: DocumentBlock | undefined;
  citationAnalysis: ReturnType<typeof analyzeCitations> | null;
}

export function useCitationAnalysis(document: SkripsiDocument | null): UseCitationAnalysisReturn {
  const referenceBlock = useMemo(
    () => document?.blocks.find((b) => b.type === "reference"),
    [document?.blocks]
  );

  const citationAnalysis = useMemo(
    () =>
      document && referenceBlock
        ? analyzeCitations(document.blocks.map((b) => b.content).join("\n"), parseReferences(referenceBlock.content))
        : null,
    [document?.blocks, referenceBlock]
  );

  return { referenceBlock, citationAnalysis };
}
