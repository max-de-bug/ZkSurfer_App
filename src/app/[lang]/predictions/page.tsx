'use client'
import React from 'react'
import PredictionPanel from '@/component/ui/PredictionPanel'
import { TradingChart } from '@/component/ui/TradingChart'
import OrderBook from '@/component/ui/OrderBook'
import Leaderboard from '@/component/ui/Leaderboard'
import YourPredictions from '@/component/ui/YourPredictions'

const TradingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950 p-3">
            <div className=" mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Prediction Dashboard</h1>

                <div className="flex gap-6 flex-col lg:flex-row">

                    {/* Prediction panel on the side */}
                    <PredictionPanel className="lg:w-80" />
                    {/* Chart takes more space */}
                    <TradingChart />
                  <OrderBook coin="SOL" depth={10} />
                    {/* <div>
                        <Leaderboard />
                        <YourPredictions />
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default TradingPage