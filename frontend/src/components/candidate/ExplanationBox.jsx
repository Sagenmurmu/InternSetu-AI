import React from 'react';
import { Lightbulb, CheckCircle } from 'lucide-react';

export default function ExplanationBox({ explanations = [] }) {
  if (!explanations || explanations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Why This Match?
        </h3>
      </div>
      <div className="space-y-3">
        {explanations.map((text, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
