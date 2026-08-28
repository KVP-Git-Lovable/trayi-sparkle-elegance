import { describe, it, expect } from "vitest";
import { cleanText } from "./text-clean";

describe("cleanText", () => {
  describe("legitimate text (no mojibake)", () => {
    it("preserves normal English text", () => {
      expect(cleanText("perfectly designed for you")).toBe(
        "perfectly designed for you"
      );
    });

    it("handles empty and null inputs", () => {
      expect(cleanText("")).toBe("");
      expect(cleanText(null)).toBe("");
      expect(cleanText(undefined)).toBe("");
    });
  });

  describe("legitimate Unicode characters", () => {
    it("preserves curly quotes", () => {
      expect(cleanText('test with "curly quotes"')).toBe(
        'test with "curly quotes"'
      );
    });

    it("preserves accented characters", () => {
      expect(cleanText("café")).toBe("café");
    });

    it("preserves em-dash and en-dash", () => {
      expect(cleanText("em—dash and en–dash")).toBe("em—dash and en–dash");
    });

    it("preserves right single quotation mark", () => {
      expect(cleanText("McDonald's")).toBe("McDonald's");
    });

    it("preserves ellipsis character", () => {
      expect(cleanText("wait…")).toBe("wait…");
    });
  });

  describe("simple mojibake (currently works)", () => {
    it("cleans double-encoded non-breaking space", () => {
      expect(cleanText("Ã‚Â")).toBe("");
    });

    it("cleans triple-encoded non-breaking space", () => {
      expect(cleanText("Ãƒâ€šÃ‚Â")).toBe("");
    });

    it("cleans simple mojibake patterns", () => {
      expect(cleanText("textÃ‚Âmore")).toBe("textmore");
    });
  });

  describe("complex mojibake (was failing — now fixed)", () => {
    // These cases were failing in the old implementation
    it("cleans low double quotation mark sequence", () => {
      expect(cleanText("Ã¢â‚¬Å¡")).toBe("'");
    });

    it("cleans high quotation mark", () => {
      expect(cleanText("Ã¢â‚¬Ÿ")).toBe('"');
    });

    it("cleans trademark symbol", () => {
      expect(cleanText("Ãƒâ€š")).toBe("™");
    });
  });

  describe("production exact sequence (CRITICAL)", () => {
    // This is the exact sequence reported from production
    it("cleans production garbled sequence to expected text", () => {
      const garbled = "ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š";
      const expected = "perfectly designed for you";
      expect(cleanText(garbled)).toBe(expected);
    });
  });

  describe("mixed scenarios", () => {
    it("handles text with both clean and garbled content", () => {
      const input = "Real textÃƒÆ'Ã†â€™withÂmixedÃ‚content";
      const result = cleanText(input);
      // Should not contain mojibake artifacts
      expect(result).not.toMatch(/Ã/);
      expect(result).not.toMatch(/Â/);
      expect(result).not.toMatch(/Ã‚/);
    });

    it("preserves legitimate hyphens while cleaning mojibake", () => {
      const input = "1990–2000Â range";
      const result = cleanText(input);
      expect(result).toContain("1990–2000");
      expect(result).not.toMatch(/Â/);
    });
  });

  describe("whitespace and formatting", () => {
    it("collapses multiple spaces", () => {
      expect(cleanText("test  with   spaces")).toBe("test with spaces");
    });

    it("removes leading and trailing whitespace", () => {
      expect(cleanText("  test  ")).toBe("test");
    });

    it("replaces non-breaking spaces with regular spaces", () => {
      expect(cleanText("test with non-breaking")).toMatch(
        /test with non-breaking/
      );
    });

    it("removes replacement character", () => {
      expect(cleanText("test�replacement")).toBe("testreplacement");
    });
  });

  describe("edge cases", () => {
    it("handles multiple mojibake sequences in one string", () => {
      const input = "startÃ‚Âmiddleã€€endÃƒâ€š";
      const result = cleanText(input);
      // Should not contain mojibake artifacts
      expect(result).not.toMatch(/Ã/);
      expect(result).not.toMatch(/Â/);
    });

    it("handles text with only mojibake", () => {
      expect(cleanText("Ã‚Â")).toBe("");
      expect(cleanText("ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š")).toBe(
        "perfectly designed for you"
      );
    });

    it("handles HTML entities (shouldn't break)", () => {
      expect(cleanText("test&nbsp;entity")).toBe("test&nbsp;entity");
    });
  });

  describe("regression: real product descriptions", () => {
    it("cleans description with smart quotes and special characters", () => {
      const desc =
        'Elegant ringÃ‚Â with "elegant" designÃƒâ€š and clean craftsmanship';
      const result = cleanText(desc);
      expect(result).not.toMatch(/Ã/);
      expect(result).not.toMatch(/Â/);
      expect(result).not.toMatch(/â€/);
    });

    it("preserves legitimate HTML tags (stripHtml is separate concern)", () => {
      const text = "Description<br/>with tags";
      expect(cleanText(text)).toBe("Description<br/>with tags");
    });
  });
});
