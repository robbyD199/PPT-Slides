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
