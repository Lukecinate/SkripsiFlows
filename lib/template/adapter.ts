/**
 * Campus Template Adapter
 * 
 * Contract for campus-specific template customization.
 * Allows different universities to define their own formatting rules
 * without modifying core export logic.
 * 
 * @module template/adapter
 */

import type { DocumentBlock, SkripsiDocument, DocumentMetadata } from "../document-model";
import type { TemplateStyle, TemplateRole, ThesisTemplate } from "../template";

/** Issue found during template validation */
export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
  blockId?: string;
  path?: string;
}

/** Cover page metadata specific to a campus */
export interface CoverData {
  title: string;
  subtitle?: string;
  institution: string;
  faculty?: string;
  program?: string;
  campus?: string;
  city: string;
  year: number;
  authors: string[];
  nim?: string[];
  supervisors?: string[];
  logoLabel?: string;
}

/** Template Adapter interface */
export interface TemplateAdapter {
  /** Unique adapter ID */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Resolve style for a block - campus can override base template styles */
  resolveStyle: (block: DocumentBlock, baseStyle: TemplateStyle) => TemplateStyle;
  
  /** Generate cover page data from document metadata */
  coverMetadata: (meta: DocumentMetadata) => CoverData;
  
  /** Validate document against campus-specific rules */
  validate: (doc: SkripsiDocument) => ValidationIssue[];
  
  /** Optional: customize numbering formats */
  numberingOverrides?: Partial<Record<"front" | "body", "lowerRoman" | "decimal" | "upperRoman" | "upperLetter" | "lowerLetter">>;
  
  /** Optional: customize page margins (twips) */
  pageMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
    gutter?: number;
  };
}

/** Registry for template adapters */
const adapterRegistry = new Map<string, TemplateAdapter>();

/** Register a campus template adapter */
export function registerTemplateAdapter(adapter: TemplateAdapter): void {
  adapterRegistry.set(adapter.id, adapter);
}

/** Get a registered adapter by ID */
export function getTemplateAdapter(id: string): TemplateAdapter | undefined {
  return adapterRegistry.get(id);
}

/** List all registered adapters */
export function listTemplateAdapters(): TemplateAdapter[] {
  return Array.from(adapterRegistry.values());
}

/** Create a template with campus-specific overrides applied */
export function createAdaptedTemplate(
  baseTemplate: ThesisTemplate,
  adapter: TemplateAdapter
): ThesisTemplate {
  const adaptedStyles: Record<TemplateRole, TemplateStyle> = {} as Record<TemplateRole, TemplateStyle>;
  
  for (const [role, baseStyle] of Object.entries(baseTemplate.styles)) {
    const mockBlock = { type: role as DocumentBlock["type"], content: "", metadata: {} } as DocumentBlock;
    adaptedStyles[role as TemplateRole] = adapter.resolveStyle(mockBlock, baseStyle);
  }
  
  return {
    ...baseTemplate,
    id: `${baseTemplate.id}-${adapter.id}`,
    name: `${baseTemplate.name} (${adapter.name})`,
    styles: adaptedStyles,
  };
}
