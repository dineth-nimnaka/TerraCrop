import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';
import type { GeminiExplanation, ScoreBreakdown } from '../types/index';

const MODEL_ID = 'gemini-2.0-flash';
const REQUEST_TIMEOUT_MS = 30_000;

interface ExplanationInput {
  cropName: string;
  score: ScoreBreakdown;
  dataSources: string[];
  constraints: string[];
  uncertainties: string[];
}

function buildPrompt(input: ExplanationInput): string {
  return `You are an agricultural advisor for Sri Lankan farmers. Given the following crop suitability assessment, provide a concise explanation.

CROP: ${input.cropName}

SCORE BREAKDOWN:
- Climate fit: ${input.score.climate}
- Water fit: ${input.score.water}
- Soil fit: ${input.score.soil}
- Season/rotation fit: ${input.score.seasonRotation}
- Farmer preference fit: ${input.score.farmerPreference}
- Total: ${input.score.total} / ${input.score.maxPossible}
- Data coverage: ${(input.score.dataCoverage * 100).toFixed(0)}%

SCORING REASONS:
${input.score.reasons.map((r) => `- ${r}`).join('\n')}

${input.score.missingComponents.length > 0 ? `MISSING DATA COMPONENTS:\n${input.score.missingComponents.map((m) => `- ${m}`).join('\n')}` : ''}

DATA SOURCES: ${input.dataSources.join(', ')}

CONSTRAINTS: ${input.constraints.length > 0 ? input.constraints.join(', ') : 'None noted'}

UNCERTAINTIES: ${input.uncertainties.length > 0 ? input.uncertainties.join(', ') : 'None noted'}

Respond ONLY with valid JSON matching this exact schema:
{
  "summary": "A 1-2 sentence plain-language summary of the recommendation.",
  "why_it_may_fit": "Explanation of why this crop could work in this location with these conditions.",
  "risks_to_check": "Key risks the farmer should verify before planting.",
  "evidence_references": ["Array of data sources or evidence used"],
  "disclaimer": "A brief disclaimer about the limitations of this AI-generated advice."
}

Do not include markdown formatting, code fences, or any text outside the JSON object.`;
}

function getDefaultExplanation(cropName: string): GeminiExplanation {
  return {
    summary: `${cropName} has been evaluated based on available climate, soil, and water data for your field location.`,
    why_it_may_fit:
      'The score reflects how well local conditions match the known growing requirements for this crop based on NASA POWER climate data and your field check-in information.',
    risks_to_check:
      'Verify local soil conditions, pest pressure, seed availability, and market access before planting. Consult with your local agricultural extension officer for personalized advice.',
    evidence_references: [
      'NASA POWER climate data',
      'FAO crop parameter guidelines',
      'Field check-in data',
    ],
    disclaimer:
      'This is an automated assessment based on publicly available data and general crop science. It is not a substitute for professional agronomic advice. Always consult local experts before making planting decisions.',
  };
}

function isValidExplanation(value: unknown): value is GeminiExplanation {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  if (typeof obj.summary !== 'string' || obj.summary.length === 0) return false;
  if (typeof obj.why_it_may_fit !== 'string' || obj.why_it_may_fit.length === 0) return false;
  if (typeof obj.risks_to_check !== 'string' || obj.risks_to_check.length === 0) return false;
  if (typeof obj.disclaimer !== 'string' || obj.disclaimer.length === 0) return false;

  if (!Array.isArray(obj.evidence_references)) return false;
  if (
    !obj.evidence_references.every(
      (ref: unknown) => typeof ref === 'string' && ref.length > 0,
    )
  )
    return false;

  return true;
}

function parseJsonResponse(text: string): unknown {
  // Strip potential markdown code fences
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

export async function getExplanation(input: ExplanationInput): Promise<GeminiExplanation> {
  try {
    const model = getGenerativeModel(ai, { model: MODEL_ID });

    const prompt = buildPrompt(input);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let resultText: string;
    try {
      const result = await model.generateContent(prompt);
      resultText = result.response.text();
    } finally {
      clearTimeout(timeoutId);
    }

    if (!resultText || resultText.trim().length === 0) {
      return getDefaultExplanation(input.cropName);
    }

    const parsed = parseJsonResponse(resultText);

    if (!isValidExplanation(parsed)) {
      console.warn('Gemini returned invalid explanation structure, using default.');
      return getDefaultExplanation(input.cropName);
    }

    return parsed;
  } catch (error) {
    console.error('Gemini explanation request failed:', error);
    return getDefaultExplanation(input.cropName);
  }
}
