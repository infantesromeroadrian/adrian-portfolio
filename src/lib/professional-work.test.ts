import assert from "node:assert/strict";
import test from "node:test";
import { architectureStudies, protectedAgentCase } from "./public-work.ts";
import { professionalCases, professionalCasePaths, FEATURED_PROFESSIONAL_SLUG } from "./professional-work.ts";

test("professional cases have unique routes, complete evidence and valid conceptual references", () => {
  const slugs = professionalCases.map((study) => study.slug);
  const conceptualLinks = new Set(architectureStudies.map((study) => study.href));
  assert.equal(slugs.length, 5);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.includes(FEATURED_PROFESSIONAL_SLUG));

  for (const study of professionalCases) {
    assert.match(study.slug, /^[a-z]+(?:-[a-z]+)*$/);
    const paths = professionalCasePaths(study.slug);
    assert.notEqual(paths.page, protectedAgentCase.href);
    assert.equal(paths.page, `/work/${study.slug}/`);
    assert.equal(paths.diagram, `/architecture/${study.slug}.html`);
    assert.equal(paths.preview, `/architecture/${study.slug}-preview.webp`);
    const requiredText = [
      study.title, study.introduction, study.scope, study.problem, study.constraints,
      study.contribution.personal, study.contribution.shared,
      study.example.situation, study.example.behavior,
      study.evidence.basis, study.evidence.limitation, study.previewAlt,
    ];
    assert.ok(requiredText.every((value) => typeof value === "string" && value.trim().length > 0), study.slug);
    assert.equal(study.evidence.reviewedOn, "2026-11-08");
    assert.ok(study.decisions.length > 0, study.slug);
    assert.ok(study.decisions.every((decision) => decision.title.trim() && decision.description.trim()), study.slug);
    if (study.relatedConceptualHref) {
      assert.ok(conceptualLinks.has(study.relatedConceptualHref), study.relatedConceptualHref);
    }
  }
});
