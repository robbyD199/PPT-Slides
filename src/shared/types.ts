export type LintLevel = "ok" | "info" | "warn";

export interface LintInfo {
  level: LintLevel;
  warnings: string[];
  infos?: string[];
}

export interface SlideEntry {
  /** "<slideId>#<creationId>" for library slides, "layout:<name>" for empty layouts */
  key: string;
  kind: "slide" | "layout";
  slideId?: string;
  creationId?: string | null;
  position: number;
  title: string;
  category: string | null;
  subcategory: string | null;
  keywords: string[];
  description: string;
  order: number;
  sourceTitle?: string;
  layout?: string | null;
  text: string;
  thumb: string;
  preview: string;
  file: string;
  hash: string;
  lint: LintInfo;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  short?: string;
  description?: string;
  subcategories: Subcategory[];
}

export interface TemplateInfo {
  id: string;
  name: string;
  file: string;
  colors: Record<string, string>;
  active?: boolean;
}

export interface Library {
  schema: number;
  name: string;
  updated: string;
  built: string;
  build: string;
  insertMode: "perSlide" | "library";
  libraryFile: string;
  categories: Category[];
  templates: TemplateInfo[];
  slides: SlideEntry[];
}

export interface SubGroup {
  subcategory: Subcategory | null;
  slides: SlideEntry[];
}

export interface Group {
  category: Category;
  subgroups: SubGroup[];
  count: number;
}

export type Formatting = "UseDestinationTheme" | "KeepSourceFormatting";
