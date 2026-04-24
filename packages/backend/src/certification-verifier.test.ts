import { describe, it, expect } from "vitest";
import { verify, certificationDatabase } from "./certification-verifier.js";

describe("certificationDatabase", () => {
  it("contains at least GOTS, OEKO-TEX, Fair Trade, and Bluesign", () => {
    const ids = certificationDatabase.map((r) => r.id);
    expect(ids).toContain("gots");
    expect(ids).toContain("oeko-tex-100");
    expect(ids).toContain("fair-trade");
    expect(ids).toContain("bluesign");
  });

  it("each record has at least one alias", () => {
    for (const record of certificationDatabase) {
      expect(record.aliases.length).toBeGreaterThan(0);
    }
  });
});

describe("verify", () => {
  it("returns verified: true for exact name match (case-insensitive)", () => {
    const results = verify(["GOTS"]);
    expect(results).toHaveLength(1);
    expect(results[0].verified).toBe(true);
    expect(results[0].matched).not.toBeNull();
    expect(results[0].matched!.id).toBe("gots");
    expect(results[0].claim).toBe("GOTS");
  });

  it("matches aliases case-insensitively", () => {
    const results = verify(["Global Organic Textile Standard"]);
    expect(results[0].verified).toBe(true);
    expect(results[0].matched!.id).toBe("gots");
  });

  it("returns verified: false with matched: null for unknown claims", () => {
    const results = verify(["Made With Love"]);
    expect(results).toHaveLength(1);
    expect(results[0].verified).toBe(false);
    expect(results[0].matched).toBeNull();
  });

  it("handles mixed known and unknown claims", () => {
    const results = verify(["GOTS", "Unknown Cert", "Bluesign"]);
    expect(results).toHaveLength(3);
    expect(results[0].verified).toBe(true);
    expect(results[1].verified).toBe(false);
    expect(results[2].verified).toBe(true);
  });

  it("handles empty claims array", () => {
    const results = verify([]);
    expect(results).toHaveLength(0);
  });

  it("trims whitespace from claims", () => {
    const results = verify(["  GOTS  "]);
    expect(results[0].verified).toBe(true);
  });

  it("matches OEKO-TEX by alias", () => {
    const results = verify(["oekotex"]);
    expect(results[0].verified).toBe(true);
    expect(results[0].matched!.id).toBe("oeko-tex-100");
  });

  it("returns correct Certification shape when matched", () => {
    const results = verify(["Fair Trade"]);
    const cert = results[0].matched!;
    expect(cert).toHaveProperty("id");
    expect(cert).toHaveProperty("name");
    expect(cert).toHaveProperty("aliases");
    expect(cert).toHaveProperty("category");
    // Should NOT have CertificationRecord-only fields
    expect(cert).not.toHaveProperty("description");
    expect(cert).not.toHaveProperty("verificationUrl");
  });
});
