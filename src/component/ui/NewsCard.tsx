// import { useState } from 'react';
// import { CryptoNewsItem, MacroNewsItem } from '@/types/types';

// export default function NewsCard({ item }: { item: CryptoNewsItem | MacroNewsItem }) {
//   const [expanded, setExpanded] = useState(false);
//   const maxLen = 200;
//   const text = item.rationale || '';
//   const needsReadMore = text.length > maxLen;
//   const preview = needsReadMore && !expanded
//     ? text.slice(0, maxLen)
//     : text;

//   return (
//     <div
//       className="relative bg-[#1a2332] rounded-lg p-4 hover:bg-opacity-75 transition cursor-pointer"
//       onClick={() => window.open(item.link, '_blank')}
//     >
//       {/* Advice badge (Buy/Hold/Sell) */}
//       <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold bg-blue-500 text-white rounded">
//         {item.advice.toUpperCase()}
//       </span>

//       {/* Info icon + popup */}
//       <div className="absolute top-2 right-2 z-50">
//         <div className="relative group">
//           <svg
//             className="w-4 h-4 text-gray-400 cursor-pointer"
//             viewBox="0 0 24 24"
//           >
//             <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
//             <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor">i</text>
//           </svg>
//           <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-60 w-44">
//             {item.reason}
//           </div>
//         </div>
//       </div>

//       {/* Title */}
//       <h4 className="font-bold text-sm mt-4">{item.title}</h4>

//       {/* Truncated / full rationale + Read more toggle */}
//       <p className="text-xs text-gray-400 mt-1">
//         {preview}
//         {needsReadMore && !expanded && '... '}
//         {needsReadMore && (
//           <button
//             onClick={e => {
//               e.stopPropagation();        // prevent card click
//               setExpanded(!expanded);
//             }}
//             className="text-blue-400 underline text-xs ml-1"
//           >
//             {expanded ? 'Show less' : 'Read more'}
//           </button>
//         )}
//       </p>

//       {/* Sentiment badge (Bullish/Neutral/Bearish) */}
//       <span
//         className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] font-bold rounded
//           ${item.sentimentTag === 'bullish' ? 'bg-green-500 text-black'
//             : item.sentimentTag === 'neutral' ? 'bg-gray-500 text-white'
//               : 'bg-red-500 text-white'}`}
//       >
//         {item.sentimentTag.toUpperCase()}
//       </span>
//     </div>
//   );
// }

// src/component/ui/NewsCard.tsx
import { useState } from 'react';
import { CryptoNewsItem, MacroNewsItem } from '@/types/types';

export default function NewsCard({ item }: { item: CryptoNewsItem|MacroNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const max = 200;
  const txt = item.rationale;
  const needs = txt.length > max;
  const preview = needs && !expanded ? txt.slice(0, max) : txt;

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
          {item.reason}
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
          ${item.sentimentTag === 'bullish' ? 'bg-green-500 text-black'
            : item.sentimentTag === 'neutral' ? 'bg-gray-500 text-white'
            : 'bg-red-500 text-white'}`}
        >
          {item.sentimentTag.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
