export type LintLevel = "ok" | "info" | "warn";

export interface LintInfo {
  level: LintLevel;
  warnings: string[];
  infos?: string[];
}

/** Geometry of a placeholder in the template (points): [left, top, width, height]. */
export interface PlaceholderBox {
  name: string;
  type: string;
  idx: string | null;
  box: [number, number, number, number];
  /** effective level-1 font size in the template (pt) */
  size?: number | null;
  /** true if the placeholder text uses several outline levels */
  multiLevel?: boolean;
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
  /** template placeholder geometry (library slides only) */
  placeholders?: PlaceholderBox[];
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

/** User preference: "Auto" decides per presentation (see resolveFormatting). */
export type FormattingPref = Formatting | "Auto";
