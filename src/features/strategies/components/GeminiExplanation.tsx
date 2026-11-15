import React, { useState } from 'react';
import { getExplanation } from '../../../services/geminiService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { CropRecommendation, GeminiExplanation as GeminiExplanationType } from '../../../types/index';

interface GeminiExplanationProps {
  recommendation: CropRecommendation;
  dataSources: string[];
  constraints: string[];
  uncertainties: string[];
  enabled?: boolean;
}

export const GeminiExplanation: React.FC<GeminiExplanationProps> = ({
  recommendation,
  dataSources,
  constraints,
  uncertainties,
  enabled = true,
}) => {
  const [explanation, setExplanation] = useState<GeminiExplanationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!enabled) {
    return null;
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setOpen(true);

    try {
      // NOTE: Strictly sending ONLY computed facts (no user PII or exact coordinates)
      const result = await getExplanation({
        cropName: recommendation.crop.name,
        score: recommendation.score,
        dataSources,
        constraints,
        uncertainties,
      });
      setExplanation(result);
    } catch (err) {
      console.error('Failed to get Gemini explanation:', err);
      setError('Unable to load AI explanation. Showing deterministic agronomic summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {!open ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          className="text-xs"
          icon={
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        >
          Explain with Gemini AI
        </Button>
      ) : (
        <Card className="p-4 bg-purple-50/50 border border-purple-200 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                Gemini Agronomic Advisory
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="py-4">
              <LoadingSpinner size="sm" label="Generating scientific explanation..." />
            </div>
          ) : explanation ? (
            <div className="space-y-3 text-xs text-[#0F172A]">
              <div>
                <strong className="text-purple-900 block mb-0.5">Summary:</strong>
                <p className="text-slate-700 leading-relaxed">{explanation.summary}</p>
              </div>

              <div>
                <strong className="text-purple-900 block mb-0.5">Why it fits your conditions:</strong>
                <p className="text-slate-700 leading-relaxed">{explanation.why_it_may_fit}</p>
              </div>

              <div>
                <strong className="text-amber-900 block mb-0.5">Field risks to verify:</strong>
                <p className="text-amber-800 leading-relaxed">{explanation.risks_to_check}</p>
              </div>

              {explanation.evidence_references?.length > 0 && (
                <div>
                  <strong className="text-slate-700 block mb-0.5">Referenced sources:</strong>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                    {explanation.evidence_references.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-purple-100 text-[10px] text-slate-500 italic">
                {explanation.disclaimer}
              </div>
            </div>
          ) : error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : null}
        </Card>
      )}
    </div>
  );
};
