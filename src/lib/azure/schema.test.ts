import { expect, describe, it } from "vitest";
import { dedupeSpeakerStyle } from "./schema";

describe("dedupeSpeakerStyle", () => {
  it("should dedupe speaker style", () => {
    expect(dedupeSpeakerStyle([null, "style1", "style2", "style1"])).toEqual([
      null,
      "style1",
      "style2",
    ]);
  });
  it("handle multiple null", () => {
    expect(dedupeSpeakerStyle([null, null, "style1"])).toEqual([
      null,
      "style1",
    ]);
  });
  it("handle multiple null and style", () => {
    expect(
      dedupeSpeakerStyle([null, null, "style1", "style2", "style1"])
    ).toEqual([null, "style1", "style2"]);
  });
  it("handle empty array", () => {
    expect(dedupeSpeakerStyle([])).toEqual([null]);
  });
});
