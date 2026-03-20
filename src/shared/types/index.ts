/**
 * @file Shared Type Definitions
 * @description Centralized TypeScript interfaces used across the ClaimBridge application.
 * Eliminates `any` usage and enforces strict type safety across component boundaries.
 */

/** Structured response from the VAHAN mock API */
export interface VahanRecord {
  /** Uppercase license plate string */
  licensePlate: string;
  /** Full name of the registered vehicle owner */
  ownerName: string;
  /** Vehicle make and model */
  vehicleModel: string;
  /** Date of original registration (ISO 8601) */
  registrationDate: string;
  /** Current insurance status: ACTIVE | EXPIRED | LAPSED */
  insuranceStatus: string;
  /** Name of the insuring company */
  insurer: string;
  /** Fitness certificate validity date (ISO 8601) */
  fitnessValidUpto: string;
}

/** Structured AI evaluation result from the Gemini analyze-claim route */
export interface ClaimAnalysisResult {
  /** Insured Declared Value extracted from the policy PDF */
  idv: number;
  /** Whether Zero-Depreciation add-on is active */
  zeroDepActive: boolean;
  /** Whether Consumables add-on is active */
  consumablesActive: boolean;
  /** Estimated repair cost based on Google Search Grounding */
  estimatedDamageCost: number;
  /** AI-generated justification narrative */
  justification: string;
  /** URLs used as grounding sources */
  searchSources: string[];
}

/** Firebase user profile subset used by the ClaimProcessor */
export interface AuthUser {
  /** Firebase UID */
  uid: string;
  /** Display name from Google Account */
  displayName: string | null;
  /** Email address */
  email: string | null;
}

/** Form state for the claim input fields */
export interface ClaimFormState {
  /** Uploaded vehicle damage image */
  imageFile: File | null;
  /** Uploaded insurance policy PDF */
  pdfFile: File | null;
  /** User-entered car model string */
  carModel: string;
  /** User-entered city for search grounding */
  city: string;
  /** User-entered vehicle license plate */
  licensePlate: string;
}
