

import React, { useState } from 'react'
import Image from 'next/image'
import { FaLock } from 'react-icons/fa'
import { CircularAvatar } from './CircularAvatar';

interface LeaderboardEntry {
  name: string
  avatar: string
  predictions: number
  accuracy: number
}

type LeaderboardProps = {
  entries?: LeaderboardEntry[]
}

const defaultEntries: LeaderboardEntry[] = [
  { name: 'Alice', avatar: '/images/alice-avatar.png', predictions: 112, accuracy: 75 },
  { name: 'Bob', avatar: '/images/bob-avatar.png', predictions: 98, accuracy: 68 },
  { name: 'Carol', avatar: '/images/carol-avatar.png', predictions: 76, accuracy: 71 },
  { name: 'Dave', avatar: '/images/dave-avatar.png', predictions: 64, accuracy: 65 },
  { name: 'Eve', avatar: '/images/eve-avatar.png', predictions: 58, accuracy: 62 },
  { name: 'Frank', avatar: '/images/frank-avatar.png', predictions: 53, accuracy: 60 },
  { name: 'Grace', avatar: '/images/grace-avatar.png', predictions: 47, accuracy: 58 },
  { name: 'Heidi', avatar: '/images/heidi-avatar.png', predictions: 42, accuracy: 55 },
  { name: 'Ivan', avatar: '/images/ivan-avatar.png', predictions: 38, accuracy: 52 },
  { name: 'Judy', avatar: '/images/judy-avatar.png', predictions: 35, accuracy: 50 },
]

const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const allEntries = entries ?? defaultEntries
  const [unlocked, setUnlocked] = useState(false)

  return (
    <div className="flex flex-col flex-1 mt-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden text-white border border-gray-700 shadow-2xl">
      <h3 className="px-4 pt-4 text-lg font-bold">Leaderboard</h3>

      {/* RELATIVE WRAPPER so we can absolutely position our frosted overlay */}
      <div className="relative flex-1 px-4 mt-2">
        {/** 
         * When locked: clamp height to 3 items (each ~56px tall including padding)
         * When unlocked: let it grow/scroll to show all entries
         */}
          <ul
   className={`divide-y divide-gray-700 overflow-hidden ${
     unlocked
       ? 'max-h-[32rem] overflow-y-auto'
       : 'max-h-[26.5rem]'
   }`}
 >
   {allEntries.map((item, i) => (
     <li
       key={i}
       /* 3 columns: ring, text-block, percent */
       className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-3"
     >
       {/* 1. ringed-avatar */}
       <CircularAvatar
         avatar={item.avatar}
         alt={item.name}
         percent={item.accuracy}
         size={40}
         strokeWidth={3}
       />

       {/* 2. name over predictions */}
       <div className="flex flex-col">
         <span className="font-medium">{item.name}</span>
         <span className="text-xs text-gray-400">
           {item.predictions} predictions
         </span>
       </div>

       {/* 3. numeric accuracy */}
       <span className="font-semibold">{item.accuracy}%</span>
     </li>
   ))}
 </ul>
      

        {/** GLASSMORPHISM OVERLAY */}
        {!unlocked && (
          <div
            className="
              absolute bottom-0 left-0 w-full
              h-[calc(100% - 16.5rem)]  /* covers everything below the first 3 items */
              bg-white/10 backdrop-blur-md
              flex flex-col items-center justify-end
              pt-4 pb-6 px-4
            "
          >
            <div className="flex items-center space-x-2 mb-3">
              <FaLock className="text-gray-300" />
              <span className="text-gray-200 text-sm text-center">
                Make a prediction to unlock full leaderboard
              </span>
            </div>
            <button
              onClick={() => setUnlocked(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded text-white font-semibold"
            >
              Predict Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
