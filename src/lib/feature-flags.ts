/**
 * Feature-flag stubs. All default to disabled.
 * Flags are env-driven; code existing does not activate functionality.
 */

function readFlag(name: string): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return false;
  }
  return value.toLowerCase() === "true" || value === "1";
}

export const featureFlags = {
  aiClassification: readFlag("ENABLE_AI_CLASSIFICATION"),
  vendorScoring: readFlag("ENABLE_VENDOR_SCORING"),
  sms: readFlag("ENABLE_SMS"),
  automaticRouting: readFlag("ENABLE_AUTOMATIC_ROUTING"),
  programmaticPublishing: readFlag("ENABLE_PROGRAMMATIC_PUBLISHING"),
} as const;

export type FeatureFlags = typeof featureFlags;
