// src/assets/MoonPhase.jsx

// --- GLYPH CONFIGURATION ---
export const MOON_GLYPHS = {
  new: "◯",
  waxing_crescent: ")",
  first_quarter: "|)",
  waxing_gibbous: "((",
  full: "\u2B24", // ⬤ (Black Large Circle)
  waning_gibbous: "))",
  last_quarter: "(|",
  waning_crescent: "(",
};

/**
 * Normalizes an angle to the 0-360 range
 */
const normalize = (value) => {
  value = value - Math.floor(value / 360) * 360;
  if (value < 0) value += 360;
  return value;
};

/**
 * Calculates Moon Phase Data with high astronomical precision.
 * Based on SunCalc logic (ecliptic longitude difference).
 * @param {Date} date - The date to calculate for
 * @returns {Object} { glyph, phaseName, illumination }
 */
export const calculateMoonPhase = (date = new Date()) => {
  // 1. Astronomical Constants
  const RAD = Math.PI / 180;
  const t = (date.valueOf() / 86400000 - 0.5 + 2440588 - 2451545) / 36525;

  // 2. Solar Coordinates
  const L0 = normalize(280.466 + 36000.77 * t); // Mean longitude
  const M = normalize(357.529 + 35999.05 * t);  // Mean anomaly
  const C = (1.915 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * RAD) 
          + (0.020 - 0.000101 * t) * Math.sin(2 * M * RAD);
  const sunLong = normalize(L0 + C); // True longitude

  // 3. Lunar Coordinates
  const L_moon = normalize(218.316 + 481267.8813 * t); // Mean longitude
  const M_moon = normalize(134.963 + 477198.8676 * t); // Mean anomaly
  const F = normalize(93.272 + 483202.0175 * t);       // Mean distance
  
  const moonLong = L_moon + 6.289 * Math.sin(M_moon * RAD); // Approximate true longitude

  // 4. Calculate Phase Angle (Age of moon)
  // 0 = New, 90 = First Q, 180 = Full, 270 = Last Q
  let phaseAngle = normalize(moonLong - sunLong);
  
  // 5. Calculate Illumination Fraction (0.0 - 1.0)
  // Formula: (1 - cos(phaseAngle)) / 2
  // At 0 deg (New): (1 - 1)/2 = 0
  // At 180 deg (Full): (1 - -1)/2 = 1
  const illuminationFraction = (1 - Math.cos(phaseAngle * RAD)) / 2;
  const illumination = Math.round(illuminationFraction * 100) + "%";

  // 6. Map to Glyph & Name
  // Phase logic needs 0-1 cycle for easy mapping
  const phaseCycle = phaseAngle / 360; 
  
  let glyph = MOON_GLYPHS.new;
  let phaseName = "New Moon";

  // Using wider thresholds to catch the visual phases
  if (phaseCycle < 0.03 || phaseCycle > 0.97) {
    glyph = MOON_GLYPHS.new;
    phaseName = "New Moon";
  } else if (phaseCycle < 0.22) {
    glyph = MOON_GLYPHS.waxing_crescent;
    phaseName = "Waxing Crescent";
  } else if (phaseCycle < 0.28) {
    glyph = MOON_GLYPHS.first_quarter;
    phaseName = "First Quarter";
  } else if (phaseCycle < 0.47) {
    glyph = MOON_GLYPHS.waxing_gibbous;
    phaseName = "Waxing Gibbous";
  } else if (phaseCycle < 0.53) {
    glyph = MOON_GLYPHS.full;
    phaseName = "Full Moon";
  } else if (phaseCycle < 0.72) {
    glyph = MOON_GLYPHS.waning_gibbous;
    phaseName = "Waning Gibbous";
  } else if (phaseCycle < 0.78) {
    glyph = MOON_GLYPHS.last_quarter;
    phaseName = "Last Quarter";
  } else {
    glyph = MOON_GLYPHS.waning_crescent;
    phaseName = "Waning Crescent";
  }

  return { glyph, phaseName, illumination };
};