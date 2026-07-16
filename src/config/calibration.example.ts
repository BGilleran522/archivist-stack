// =====================================================================
//  CALIBRATION — the product's edge. NEUTRAL PLACEHOLDER VALUES.
// =====================================================================
//
//  Everything in this file is tuning: weights, thresholds, the persona's
//  voice, model routing. This is where a product stops being a template
//  and starts being *yours*. The values below are deliberately bland so
//  the template runs and its tests pass — they are NOT good product
//  values.
//
//  HOW TO USE:
//    cp calibration.example.ts calibration.ts   # then tune calibration.ts
//
//  calibration.ts is git-ignored (see .gitignore). Your tuned numbers
//  never land in a public fork. Keep them as a trade secret; they are not
//  patentable and they are not meant to be shared.
// =====================================================================

// ---- Scoring weights (recommendation / ranking engines) -------------
// Each factor scores 0..10; final = weighted sum. All 1.0 here = every
// factor equal = a flat, uninteresting recommender. Tune per product.
export const SIGNAL_WEIGHTS = {
  relevance: 1.0,
  recency: 1.0,
  urgency: 1.0,
  fit: 1.0,
} as const;

// ---- Verdict thresholds ---------------------------------------------
// Bucket a weighted score into classes. Placeholder cutoffs.
export const VERDICT_THRESHOLDS = {
  strong: 70,
  consider: 50,
  wait: 30,
} as const;

// ---- Persona memory -------------------------------------------------
export const MEMORY = {
  minConfidence: 0.6,   // drop hedged guesses below this
  maxPerExtraction: 5,  // cap facts stored per conversation
} as const;

// ---- Persona voice --------------------------------------------------
// The identity + style ARE the product's character. Placeholder here.
export const PERSONA = {
  identity: "You are a helpful assistant grounded in the user's own records.",
  style: "Be concise and factual. No hype.",
} as const;

// ---- AI model routing -----------------------------------------------
export const AI = {
  defaultModel: "claude-3-5-haiku-latest",
  tasks: {
    fact_extract: "claude-3-5-haiku-latest",
    verdict_reasoning: "claude-3-5-haiku-latest",
    chat: "claude-3-5-sonnet-latest",
  },
} as const;
