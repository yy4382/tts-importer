import { describe, it, expect } from "vitest";
import { isValidXML } from "./is-valid-xml";

describe("isValidXML", () => {
  it("should return true for valid XML", () => {
    expect(isValidXML("<root>Hello</root>")).toBe(true);
  });
  it("should return false for invalid XML", () => {
    expect(isValidXML("<root>Hello")).toBe(false);
  });
});
