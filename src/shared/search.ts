import type { Library, SlideEntry } from "./types";
import { STOPWORDS, SYNONYM_GROUPS } from "./synonyms";
import { categoryName, subcategoryName } from "./library";

/**
 * Normalizes text for matching: lower case, umlauts folded (ä/ae → a), ß → ss, × → x,
 * punctuation removed. Applied identically to documents and queries.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/×/g, "x")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/[^a-z0-9&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string, dropStopwords = true): string[] {
  const n = normalize(text);
  if (!n) return [];
  return n.split(" ").filter((t) => t && t !== "&" && (!dropStopwords || !STOPWORDS.has(t)));
}

const NORMALIZED_STOPWORDS = new Set([...STOPWORDS].map((w) => normalize(w)));

/** phrase (normalized) -> synonym group indexes */
const SYN_MAP: Map<string, number[]> = (() => {
  const map = new Map<string, number[]>();
  SYNONYM_GROUPS.forEach((group, gi) => {
    for (const term of group) {
      const n = normalize(term);
      if (!n) continue;
      const list = map.get(n) ?? [];
      if (!list.includes(gi)) list.push(gi);
      map.set(n, list);
    }
  });
  return map;
})();
const SYN_KEYS = [...SYN_MAP.keys()];

interface Field {
  tokens: string[];
  /** normalized text padded with spaces, keywords separated by " | " */
  text: string;
  weight: number;
}

export interface IndexedDoc {
  entry: SlideEntry;
  fields: Field[];
}

export interface SearchIndex {
  docs: IndexedDoc[];
}

function field(text: string, weight: number): Field {
  const n = normalize(text);
  return {
    tokens: n ? n.split(" ").filter((t) => !NORMALIZED_STOPWORDS.has(t)) : [],
    text: ` ${n} `,
    weight,
  };
}

export function buildIndex(lib: Library): SearchIndex {
  return {
    docs: lib.slides.map((entry) => ({
      entry,
      fields: [
        field(entry.title, 6),
        {
          ...field(entry.keywords.join(" "), 5),
          text: ` ${entry.keywords.map((k) => normalize(k)).join(" | ")} `,
        },
        field(subcategoryName(lib, entry.category, entry.subcategory), 4),
        field(categoryName(lib, entry.category), 3),
        field(entry.sourceTitle ?? "", 2),
        field(entry.description, 2),
        field(entry.layout ?? "", 1),
        field(entry.text, 1),
      ],
    })),
  };
}

interface Term {
  t: string;
  w: number;
}

export interface QueryGroup {
  /** what the user typed for this group (normalized) */
  label: string;
  terms: Term[];
}

function addTerm(terms: Term[], t: string, w: number) {
  const existing = terms.find((x) => x.t === t);
  if (existing) existing.w = Math.max(existing.w, w);
  else terms.push({ t, w });
}

function groupFor(term: string): QueryGroup {
  const terms: Term[] = [{ t: term, w: 1 }];
  const exact = SYN_MAP.get(term);
  if (exact) {
    for (const gi of exact) for (const s of SYNONYM_GROUPS[gi]) addTerm(terms, normalize(s), 0.85);
  } else if (term.length >= 4) {
    // user is still typing: expand synonyms of vocabulary words that start with the term
    for (const key of SYN_KEYS) {
      if (!key.includes(" ") && key.startsWith(term)) {
        for (const gi of SYN_MAP.get(key) ?? [])
          for (const s of SYNONYM_GROUPS[gi]) addTerm(terms, normalize(s), 0.7);
      }
    }
  }
  return { label: term, terms };
}

/** Splits a query into groups; known multi-word phrases ("bar chart") form one group. */
export function parseQuery(query: string): QueryGroup[] {
  const toks = tokenize(query);
  const groups: QueryGroup[] = [];
  let i = 0;
  while (i < toks.length) {
    let used = 1;
    for (let n = Math.min(3, toks.length - i); n >= 2; n--) {
      const phrase = toks.slice(i, i + n).join(" ");
      if (SYN_MAP.has(phrase)) {
        groups.push(groupFor(phrase));
        used = n;
        break;
      }
    }
    if (used === 1) groups.push(groupFor(toks[i]));
    i += used;
  }
  return groups;
}

/** Damerau-Levenshtein distance with early exit above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = new Array(b.length + 1).fill(0);
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
    prev = cur;
  }
  return prev[b.length];
}

/**
 * 1 = exact, 0.8 = prefix (typing), 0.6 = inside a compound word, 0.5 = typo.
 * Typos: same first letter required; distance 2 only for long words with the same first 3 letters
 * (so "Balkendiagramm" does not match "Blasendiagramm").
 */
export function tokenScore(term: string, token: string, allowFuzzy = true): number {
  if (token === term) return 1;
  if (term.length >= 2 && token.startsWith(term)) return 0.8;
  if (term.length >= 4 && token.includes(term)) return 0.6;
  if (allowFuzzy && term.length >= 5 && token.length >= 4 && token[0] === term[0]) {
    const max = term.length >= 9 && token.slice(0, 3) === term.slice(0, 3) ? 2 : 1;
    if (editDistance(term, token, max) <= max) return 0.5;
  }
  return 0;
}

function termScore(term: Term, doc: IndexedDoc): number {
  let best = 0;
  const isPhrase = term.t.includes(" ");
  const fuzzy = term.w === 1; // only what the user typed, not synonym expansions
  for (const f of doc.fields) {
    let s = 0;
    if (isPhrase) {
      if (f.text.includes(` ${term.t} `)) s = 1;
      else if (term.t.length >= 6 && f.text.includes(term.t)) s = 0.6;
    } else {
      for (const tok of f.tokens) {
        const v = tokenScore(term.t, tok, fuzzy);
        if (v > s) s = v;
        if (s === 1) break;
      }
    }
    best = Math.max(best, s * f.weight);
  }
  return best * term.w;
}

export interface SearchHit {
  entry: SlideEntry;
  score: number;
  matched: number;
}

export interface SearchResult {
  /** best first: hits matching all query parts, then partial hits */
  hits: SearchHit[];
  /** number of leading hits that match every part of the query */
  completeCount: number;
  /** true if at least one slide matches every part of the query */
  complete: boolean;
  groups: QueryGroup[];
}

/** Hits scoring below this share of the best hit are dropped (weak typo / synonym matches). */
const RELATIVE_CUTOFF = 0.45;

/**
 * Ranked search over title, keywords, (sub)category, description and slide text.
 * Slides matching all query parts come first ("Beste Treffer"), then partial matches.
 */
export function search(index: SearchIndex, query: string): SearchResult {
  const groups = parseQuery(query);
  if (!groups.length) return { hits: [], completeCount: 0, complete: true, groups };
  const scored: SearchHit[] = [];
  for (const doc of index.docs) {
    let score = 0;
    let matched = 0;
    for (const g of groups) {
      let gs = 0;
      for (const t of g.terms) gs = Math.max(gs, termScore(t, doc));
      // a synonym that only appears in the slide body text adds score but does not count as a match
      if (gs >= 1) matched++;
      score += gs;
    }
    if (score > 0) scored.push({ entry: doc.entry, score, matched });
  }
  scored.sort(
    (a, b) => b.matched - a.matched || b.score - a.score || a.entry.order - b.entry.order
  );
  const best = scored.reduce((m, h) => Math.max(m, h.score), 0);
  const hits = scored.filter((h) => h.score >= best * RELATIVE_CUTOFF);
  const completeCount = hits.filter((h) => h.matched === groups.length).length;
  return { hits, completeCount, complete: completeCount > 0, groups };
}

/** Search suggestions shown when the search box is empty. */
export const SEARCH_SUGGESTIONS = [
  "Executive Summary",
  "Säulendiagramm",
  "Wasserfall",
  "2×2-Matrix",
  "Zeitplan",
  "Key Facts",
  "Organigramm",
  "Agenda",
  "Issue Tree",
  "Financial Overview",
];
