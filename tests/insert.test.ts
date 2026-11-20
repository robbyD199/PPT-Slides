import { computeTargetSlideId, newIdsAfterInsert } from "../src/shared/insert";

describe("computeTargetSlideId", () => {
  const all = ["256#1", "257#2", "258#3", "259#4"];

  it("inserts after the selected slide", () => {
    expect(computeTargetSlideId(all, ["257#2"])).toBe("257#2");
  });

  it("uses the last selected slide in presentation order when several are selected", () => {
    expect(computeTargetSlideId(all, ["258#3", "256#1"])).toBe("258#3");
  });

  it("falls back to the end when nothing is selected", () => {
    expect(computeTargetSlideId(all, [])).toBe("259#4");
  });

  it("ignores unknown selected ids and falls back to the end", () => {
    expect(computeTargetSlideId(all, ["999#9"])).toBe("259#4");
  });

  it("returns undefined for an empty presentation (insert at the start = end)", () => {
    expect(computeTargetSlideId([], [])).toBeUndefined();
  });
});

describe("newIdsAfterInsert", () => {
  it("returns the new ids in presentation order", () => {
    expect(newIdsAfterInsert(["1#a", "2#b"], ["1#a", "9#z", "2#b"])).toEqual(["9#z"]);
  });
});

import { geometryDiffers, matchPlaceholders } from "../src/shared/insert";
import type { PlaceholderBox } from "../src/shared/types";

describe("template placeholder layout", () => {
  const boxes: PlaceholderBox[] = [
    { name: "Title 1", type: "title", idx: null, box: [43.7, 28, 872.6, 57.6], size: 24 },
    { name: "Text Placeholder 2", type: "body", idx: "17", box: [600, 8, 315, 10], size: 9 },
    { name: "Text Placeholder 2", type: "body", idx: "18", box: [43, 492, 573, 32], size: 9 },
  ];

  it("pairs shapes by name, repeated names in order", () => {
    const pairs = matchPlaceholders(["Picture 3", "Title 1", "Text Placeholder 2", "Text Placeholder 2"], boxes);
    expect(pairs.map(([i, b]) => [i, b.idx])).toEqual([
      [1, null],
      [2, "17"],
      [3, "18"],
    ]);
  });

  it("ignores shapes without template placeholder", () => {
    expect(matchPlaceholders(["Rectangle 5"], boxes)).toEqual([]);
  });

  it("detects geometry differences above 0.75 pt", () => {
    expect(geometryDiffers({ left: 43.7, top: 28, width: 872.6, height: 57.6 }, boxes[0].box)).toBe(false);
    expect(geometryDiffers({ left: 44, top: 28.5, width: 872.6, height: 57.6 }, boxes[0].box)).toBe(false);
    expect(geometryDiffers({ left: 60, top: 40, width: 800, height: 90 }, boxes[0].box)).toBe(true);
  });
});

import { hasLibraryMaster } from "../src/shared/insert";

describe("hasLibraryMaster", () => {
  const lib = ["Title Slide", "Title and Content", "Title Only", "Title and Subtitle"];
  it("detects decks based on the own template", () => {
    expect(hasLibraryMaster([["Title Slide", "Title and Content", "Title Only", "Title and Subtitle", "Blank"]], lib)).toBe(true);
  });
  it("detects foreign designs (e.g. Ion without 'Title and Subtitle')", () => {
    expect(hasLibraryMaster([["Title Slide", "Title and Content", "Title Only", "Section Header"]], lib)).toBe(false);
    expect(hasLibraryMaster([], lib)).toBe(false);
  });
});

import { resolveFormatting } from "../src/shared/insert";

describe("resolveFormatting (Auto default)", () => {
  const lib = ["Title Slide", "Title and Content", "Title Only", "Title and Subtitle"];
  it("uses the deck's own master when it is the library master", () => {
    expect(resolveFormatting("Auto", [lib], lib)).toBe("UseDestinationTheme");
  });
  it("brings the library master into foreign or unknown decks", () => {
    expect(resolveFormatting("Auto", [["Title Slide", "Blank"]], lib)).toBe("KeepSourceFormatting");
    expect(resolveFormatting("Auto", null, lib)).toBe("KeepSourceFormatting");
  });
  it("respects explicit choices", () => {
    expect(resolveFormatting("UseDestinationTheme", [["Blank"]], lib)).toBe("UseDestinationTheme");
    expect(resolveFormatting("KeepSourceFormatting", [lib], lib)).toBe("KeepSourceFormatting");
  });
});
