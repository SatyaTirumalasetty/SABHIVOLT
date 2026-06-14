import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONTENT,
  deepMerge,
  normalizeContent,
  statusColor,
  genId,
  guessCoords,
} from "./content";

describe("deepMerge", () => {
  it("fills missing nested keys from base", () => {
    const merged = deepMerge(
      { hero: { headline: "A", subheadline: "B" } },
      { hero: { headline: "custom" } }
    );
    expect(merged.hero.headline).toBe("custom");
    expect(merged.hero.subheadline).toBe("B");
  });

  it("never leaves undefined where base has a value", () => {
    const merged = deepMerge(DEFAULT_CONTENT, { hero: {} });
    expect(merged.hero.ctaPrimary).toBe(DEFAULT_CONTENT.hero.ctaPrimary);
    expect(merged.dashboard.node).toBe(DEFAULT_CONTENT.dashboard.node);
  });

  it("takes arrays wholesale from saved when present", () => {
    const merged = deepMerge(DEFAULT_CONTENT, { stats: [{ value: "1", label: "x" }] });
    expect(merged.stats).toHaveLength(1);
    expect(merged.stats[0].label).toBe("x");
  });
});

describe("normalizeContent", () => {
  it("returns defaults for non-object input", () => {
    expect(normalizeContent(null)).toEqual(DEFAULT_CONTENT);
    expect(normalizeContent("nope")).toEqual(DEFAULT_CONTENT);
  });

  it("upgrades a partial legacy blob to the full shape", () => {
    const legacy = { hero: { headline: "Old headline" } };
    const c = normalizeContent(legacy);
    expect(c.hero.headline).toBe("Old headline");
    expect(c.solutions.items.length).toBeGreaterThan(0);
    expect(c.network.locations.length).toBeGreaterThan(0);
    expect(c.driver.features.length).toBeGreaterThan(0);
  });

  it("backfills coordinates for locations missing them", () => {
    const c = normalizeContent({
      network: { locations: [{ name: "Hyderabad HITEC City", status: "Planned" }] },
    });
    expect(c.network.locations[0].lat).toBeTruthy();
    expect(c.network.locations[0].lon).toBeTruthy();
  });
});

describe("statusColor", () => {
  it("maps headquarters/live to emerald", () => {
    expect(statusColor("Headquarters")).toBe("#10b981");
    expect(statusColor("Live")).toBe("#10b981");
  });
  it("maps in development to amber", () => {
    expect(statusColor("In development")).toBe("#f59e0b");
  });
  it("defaults to grey", () => {
    expect(statusColor("Planned")).toBe("#94a3b8");
  });
});

describe("genId", () => {
  it("produces unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => genId()));
    expect(ids.size).toBe(100);
  });
});

describe("guessCoords", () => {
  it("recognises known cities", () => {
    expect(guessCoords("Bengaluru ORR").lat).toBe("12.9716");
  });
  it("falls back to a central default", () => {
    const g = guessCoords("Unknown place");
    expect(g.lat).toBeTruthy();
    expect(g.lon).toBeTruthy();
  });
});
