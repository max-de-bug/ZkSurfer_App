import { useState } from 'react';
import { CryptoNewsItem, MacroNewsItem } from '@/types/types';

export default function NewsCard({ item }: { item: CryptoNewsItem | MacroNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const max = 200;

  // Handle undefined rationale with fallback
  const txt = item.rationale || item.title || 'No description available';
  const needs = txt.length > max;
  const preview = needs && !expanded ? txt.slice(0, max) : txt;

  // Handle undefined reason with fallback
  const reason = item.reason || 'No additional information available';

  // Handle undefined sentimentTag with fallback
  const sentimentTag = item.sentimentTag || 'neutral';

  return (
    <div
      className="relative bg-[#1a2332] rounded-lg p-4 hover:bg-opacity-75 transition cursor-pointer"
      onClick={() => window.open(item.link, '_blank')}
    >
      {/* Info icon + popup */}
      <div className="absolute top-2 right-2 z-50 group">
        <svg className="w-4 h-4 text-gray-400 cursor-pointer" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor">i</text>
        </svg>
        <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-44 z-60">
          {reason}
        </div>
      </div>

      <h4 className="font-bold text-sm mt-4">{item.title}</h4>

      <p className="text-xs text-gray-400 mt-1">
        {preview}
        {needs && !expanded && '... '}
        {needs && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            className="text-blue-400 underline text-xs ml-1"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Sentiment tag, just after the text */}
      <div className="mt-2">
        <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded
          ${sentimentTag === 'bullish' ? 'bg-green-500 text-black'
            : sentimentTag === 'neutral' ? 'bg-gray-500 text-white'
              : 'bg-red-500 text-white'}`}
        >
          {sentimentTag.toUpperCase()}
        </span>
      </div>
    </div>
  );
}