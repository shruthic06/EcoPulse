"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const certification_verifier_js_1 = require("./certification-verifier.js");
(0, vitest_1.describe)("certificationDatabase", () => {
    (0, vitest_1.it)("contains at least GOTS, OEKO-TEX, Fair Trade, and Bluesign", () => {
        const ids = certification_verifier_js_1.certificationDatabase.map((r) => r.id);
        (0, vitest_1.expect)(ids).toContain("gots");
        (0, vitest_1.expect)(ids).toContain("oeko-tex-100");
        (0, vitest_1.expect)(ids).toContain("fair-trade");
        (0, vitest_1.expect)(ids).toContain("bluesign");
    });
    (0, vitest_1.it)("each record has at least one alias", () => {
        for (const record of certification_verifier_js_1.certificationDatabase) {
            (0, vitest_1.expect)(record.aliases.length).toBeGreaterThan(0);
        }
    });
});
(0, vitest_1.describe)("verify", () => {
    (0, vitest_1.it)("returns verified: true for exact name match (case-insensitive)", () => {
        const results = (0, certification_verifier_js_1.verify)(["GOTS"]);
        (0, vitest_1.expect)(results).toHaveLength(1);
        (0, vitest_1.expect)(results[0].verified).toBe(true);
        (0, vitest_1.expect)(results[0].matched).not.toBeNull();
        (0, vitest_1.expect)(results[0].matched.id).toBe("gots");
        (0, vitest_1.expect)(results[0].claim).toBe("GOTS");
    });
    (0, vitest_1.it)("matches aliases case-insensitively", () => {
        const results = (0, certification_verifier_js_1.verify)(["Global Organic Textile Standard"]);
        (0, vitest_1.expect)(results[0].verified).toBe(true);
        (0, vitest_1.expect)(results[0].matched.id).toBe("gots");
    });
    (0, vitest_1.it)("returns verified: false with matched: null for unknown claims", () => {
        const results = (0, certification_verifier_js_1.verify)(["Made With Love"]);
        (0, vitest_1.expect)(results).toHaveLength(1);
        (0, vitest_1.expect)(results[0].verified).toBe(false);
        (0, vitest_1.expect)(results[0].matched).toBeNull();
    });
    (0, vitest_1.it)("handles mixed known and unknown claims", () => {
        const results = (0, certification_verifier_js_1.verify)(["GOTS", "Unknown Cert", "Bluesign"]);
        (0, vitest_1.expect)(results).toHaveLength(3);
        (0, vitest_1.expect)(results[0].verified).toBe(true);
        (0, vitest_1.expect)(results[1].verified).toBe(false);
        (0, vitest_1.expect)(results[2].verified).toBe(true);
    });
    (0, vitest_1.it)("handles empty claims array", () => {
        const results = (0, certification_verifier_js_1.verify)([]);
        (0, vitest_1.expect)(results).toHaveLength(0);
    });
    (0, vitest_1.it)("trims whitespace from claims", () => {
        const results = (0, certification_verifier_js_1.verify)(["  GOTS  "]);
        (0, vitest_1.expect)(results[0].verified).toBe(true);
    });
    (0, vitest_1.it)("matches OEKO-TEX by alias", () => {
        const results = (0, certification_verifier_js_1.verify)(["oekotex"]);
        (0, vitest_1.expect)(results[0].verified).toBe(true);
        (0, vitest_1.expect)(results[0].matched.id).toBe("oeko-tex-100");
    });
    (0, vitest_1.it)("returns correct Certification shape when matched", () => {
        const results = (0, certification_verifier_js_1.verify)(["Fair Trade"]);
        const cert = results[0].matched;
        (0, vitest_1.expect)(cert).toHaveProperty("id");
        (0, vitest_1.expect)(cert).toHaveProperty("name");
        (0, vitest_1.expect)(cert).toHaveProperty("aliases");
        (0, vitest_1.expect)(cert).toHaveProperty("category");
        // Should NOT have CertificationRecord-only fields
        (0, vitest_1.expect)(cert).not.toHaveProperty("description");
        (0, vitest_1.expect)(cert).not.toHaveProperty("verificationUrl");
    });
});
//# sourceMappingURL=certification-verifier.test.js.map