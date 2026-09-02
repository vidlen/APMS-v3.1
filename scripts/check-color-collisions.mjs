#!/usr/bin/env node
// Self-check for the light/dark theme redesign (see APMS v3.0 UI brief
// section 9, "PCI color protection"): the nav/UI accent (--primary/--ring)
// must never land close enough to a domain color (PCI/risk/ICAO) to be
// confused with it. Domain colors are read straight from their source
// files, not duplicated here, so this stays honest if either side changes.
//
// ponytail: hue-distance only, no perceptual color-space math - the ceiling
// is a coarse "same-ish hue" check, not a true delta-E comparison. Good
// enough to catch "someone changed --primary to green" without pulling in
// a color library.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HUE_COLLISION_THRESHOLD_DEG = 40;

// Saturation below this reads as gray-ish to a human even if it's not fully
// achromatic - e.g. the Not Surveyed hatch's Tailwind "slate" family
// (#64748b etc.) sits around 16% saturation with a hue that happens to fall
// near this app's blue accent, but nobody would call that swatch "blue".
// 0.25 clears the whole slate family while PCI/risk ramp colors (all
// vivid, 50%+ saturation) stay well inside the check.
const NEUTRAL_SATURATION_THRESHOLD = 0.25;
// Near-white/near-black colors (e.g. the hatch pattern's #e2e8f0 highlight,
// or a "Failed" band's near-white swatch) have inflated HSL saturation from
// the formula's denominator shrinking at the lightness extremes, even
// though they read as white/black to the eye - gate on lightness too.
const MIN_MEANINGFUL_LIGHTNESS = 0.15;
const MAX_MEANINGFUL_LIGHTNESS = 0.85;

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { hue: null, saturation: 0 }; // achromatic (gray/white)
  const saturation = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  const hue = h < 0 ? h + 360 : h;
  const meaningless =
    saturation < NEUTRAL_SATURATION_THRESHOLD ||
    l < MIN_MEANINGFUL_LIGHTNESS ||
    l > MAX_MEANINGFUL_LIGHTNESS;
  return { hue: meaningless ? null : hue, saturation, lightness: l };
}

function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function extractHexColors(filePath) {
  const text = readFileSync(join(root, filePath), "utf8");
  return [...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0]);
}

function extractUiAccentHues(cssPath) {
  const text = readFileSync(join(root, cssPath), "utf8");
  const hues = [];
  for (const varName of ["--primary", "--ring"]) {
    const re = new RegExp(`${varName}:\\s*([\\d.]+)\\s`, "g");
    for (const m of text.matchAll(re)) hues.push({ var: varName, hue: Number(m[1]) });
  }
  return hues;
}

const domainSources = [
  "src/lib/pci-utils.ts",
  "src/config/riskScales.ts",
  "src/config/icaoMatrix.ts",
];

const domainColors = domainSources.flatMap((path) =>
  extractHexColors(path).map((hex) => ({ hex, path, ...hexToHsl(hex) }))
);

const uiAccents = extractUiAccentHues("src/index.css");

let failures = 0;
for (const accent of uiAccents) {
  for (const domain of domainColors) {
    if (domain.hue === null) continue;
    const dist = hueDistance(accent.hue, domain.hue);
    if (dist < HUE_COLLISION_THRESHOLD_DEG) {
      failures++;
      console.error(
        `FAIL: ${accent.var} (hue ${accent.hue}°) is only ${dist.toFixed(1)}° from ${domain.hex} ` +
          `(${domain.path}, hue ${domain.hue.toFixed(1)}°) - too close to a domain color.`
      );
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} color collision(s) found.`);
  process.exit(1);
}

console.log(
  `OK: ${uiAccents.length} UI accent value(s) checked against ${domainColors.length} domain color(s) ` +
    `from ${domainSources.length} source file(s) - no collisions within ${HUE_COLLISION_THRESHOLD_DEG}°.`
);
