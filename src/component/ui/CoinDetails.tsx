// 'use client';
// import { FC } from 'react';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ArrowLeft } from 'lucide-react';
// import Image from 'next/image';
// import { Coin } from '@/types/marketplaceTypes';

// interface CoinDetailProps {
//   coin: Coin;
//   onBack: () => void;
// }

// export const CoinDetail: FC<CoinDetailProps> = ({ coin, onBack }) => (
//   <div className="space-y-6 bg-[#000A19]">
//     <button
//       onClick={onBack}
//       className="flex items-center gap-2 text-white hover:text-white"
//       type="button"
//     >
//       <ArrowLeft size={20} /> Back
//     </button>

//     <div className="flex items-start gap-6">
//       <div className="relative w-20 h-20">
//         <Image
//           src={coin.image || "/api/placeholder/80/80"}
//           alt={coin.name}
//           className="rounded-full border border-white"
//           width={80}
//           height={80}
//         />
//       </div>
//       <div>
//         <h2 className="text-2xl font-bold">{coin.name}</h2>
//         <p className="text-gray-600 mt-2">{coin.description}</p>
//       </div>
//     </div>

//     <Card>
//       <CardHeader className="pb-2">
//         <h3 className="font-semibold">Trade</h3>
//       </CardHeader>
//       <CardContent>
//         <div className="flex gap-4">
//           <div className="flex-1">
//             <Input type="number" placeholder="Amount" className="mb-2" />
//             <Button className="w-full">Buy</Button>
//           </div>
//           <div className="flex-1">
//             <Input type="number" placeholder="Amount" className="mb-2" />
//             <Button className="w-full">Sell</Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardContent className="p-4">
//         <iframe
//           src="https://www.geckoterminal.com/embed"
//           className="w-full h-96 border-0"
//           title="GeckoTerminal Chart"
//         />
//       </CardContent>
//     </Card>
//   </div>
// );


// import { FC, useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { ArrowLeft } from 'lucide-react';
// import Image from 'next/image';
// import { Coin } from '@/types/marketplaceTypes';

// interface CoinDetailProps {
//   coin: Coin;
//   onBack: () => void;
// }

// export const CoinDetail: FC<CoinDetailProps> = ({ coin, onBack }) => {
//   const [amount, setAmount] = useState('');
//   const [selectedToken, setSelectedToken] = useState('SOL');

//   const presetAmounts = ['0.1 SOL', '0.5 SOL', '1 SOL'];

//   const handlePresetClick = (preset: string) => {
//     setAmount(preset.split(' ')[0]);
//   };

//   return (
//     <div className="space-y-6 bg-[#000A19] p-4">
//       <button
//         onClick={onBack}
//         className="flex items-center gap-2 text-white hover:text-white"
//         type="button"
//       >
//         <ArrowLeft size={20} /> Back
//       </button>

//       <div className="flex items-start gap-6">
//         <div className="relative w-20 h-20">
//           <Image
//             src={coin.image || "/api/placeholder/80/80"}
//             alt={coin.name}
//             className="rounded-full border border-white"
//             width={80}
//             height={80}
//           />
//         </div>
//         <div>
//           <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
//           <p className="text-gray-400 mt-2">{coin.description}</p>
//         </div>
//       </div>

//       <Card className="bg-[#0F1724] border-gray-800">
//         <CardContent className="p-4">
//           <Tabs defaultValue="buy" className="w-full">
//             <TabsList className="w-full mb-4 bg-transparent border-b border-gray-800">
//               <TabsTrigger
//                 value="buy"
//                 className="flex-1 text-white data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400"
//               >
//                 Buy
//               </TabsTrigger>
//               <TabsTrigger
//                 value="sell"
//                 className="flex-1 text-white data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-400"
//               >
//                 Sell
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="buy">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <Input
//                     type="number"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="flex-1 bg-[#1A2332] border-gray-700 text-white"
//                     placeholder="0.0"
//                   />
//                   <Select
//                     value={selectedToken}
//                     onValueChange={setSelectedToken}
//                   >
//                     <SelectTrigger className="w-24 bg-[#1A2332] border-gray-700 text-white">
//                       <SelectValue>{selectedToken}</SelectValue>
//                     </SelectTrigger>
//                     <SelectContent className="bg-[#1A2332] border-gray-700">
//                       <SelectItem value="SOL">SOL</SelectItem>
//                       <SelectItem value="ETH">ETH</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="flex gap-2">
//                   {presetAmounts.map((preset) => (
//                     <Button
//                       key={preset}
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handlePresetClick(preset)}
//                       className="flex-1 bg-[#1A2332] border-gray-700 text-white hover:bg-[#2A3342]"
//                     >
//                       {preset}
//                     </Button>
//                   ))}
//                 </div>

//                 <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
//                   place trade
//                 </Button>

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="w-full text-gray-400 border-gray-700 hover:bg-[#1A2332]"
//                 >
//                   add comment
//                 </Button>
//               </div>
//             </TabsContent>

//             <TabsContent value="sell">
//               {/* Similar structure as buy tab but with sell-specific styling */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <Input
//                     type="number"
//                     className="flex-1 bg-[#1A2332] border-gray-700 text-white"
//                     placeholder="0.0"
//                   />
//                   <Select defaultValue="SOL">
//                     <SelectTrigger className="w-24 bg-[#1A2332] border-gray-700 text-white">
//                       <SelectValue>SOL</SelectValue>
//                     </SelectTrigger>
//                     <SelectContent className="bg-[#1A2332] border-gray-700">
//                       <SelectItem value="SOL">SOL</SelectItem>
//                       <SelectItem value="ETH">ETH</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="flex gap-2">
//                   {presetAmounts.map((preset) => (
//                     <Button
//                       key={preset}
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-[#1A2332] border-gray-700 text-white hover:bg-[#2A3342]"
//                     >
//                       {preset}
//                     </Button>
//                   ))}
//                 </div>

//                 <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
//                   place trade
//                 </Button>

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="w-full text-gray-400 border-gray-700 hover:bg-[#1A2332]"
//                 >
//                   add comment
//                 </Button>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>

//       <Card className="bg-[#0F1724] border-gray-800">
//         <CardContent className="p-4">
//           <iframe
//             src="https://www.geckoterminal.com/embed"
//             className="w-full h-96 border-0"
//             title="GeckoTerminal Chart"
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CoinDetail;

import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Coin } from '@/types/marketplaceTypes';
import { useTransactionHandler } from '@/hooks/useTransactionHandler';

interface CoinDetailProps {
  coin: Coin;
  onBack: () => void;
}

export const CoinDetail: FC<CoinDetailProps> = ({ coin, onBack }) => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('SOL');
  const { handleTransaction, isLoading } = useTransactionHandler();

  const presetAmounts = ['0.1 SOL', '0.5 SOL', '1 SOL'];

  const handlePresetClick = (preset: string) => {
    setAmount(preset.split(' ')[0]);
  };

  const handleTradeSubmit = async (action: 'buy' | 'sell') => {
    await handleTransaction({
      coin: {
        ...coin,
        address: coin.address ?? "",  // Provide a fallback if address is undefined
      },
      action,
      amount,
      selectedToken,
    });
  };


  const TradeButton = ({ action }: { action: 'buy' | 'sell' }) => (
    <Button
      className={`w-full ${action === 'buy'
        ? 'bg-green-500 hover:bg-green-600'
        : 'bg-red-500 hover:bg-red-600'
        } text-white`}
      onClick={() => handleTradeSubmit(action)}
      disabled={isLoading || !amount}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          Processing...
        </div>
      ) : (
        `Place ${action}`
      )}
    </Button>
  );

  return (
    <div className="space-y-6 bg-[#000A19] p-4">
      {/* ... Keep existing header and image section ... */}

      <Card className="bg-[#0F1724] border-gray-800">
        <CardContent className="p-4">
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="w-full mb-4 bg-transparent border-b border-gray-800">
              <TabsTrigger
                value="buy"
                className="flex-1 text-white data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="flex-1 text-white data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-400"
              >
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-[#1A2332] border-gray-700 text-white"
                    placeholder="0.0"
                  />
                  <Select
                    value={selectedToken}
                    onValueChange={setSelectedToken}
                  >
                    <SelectTrigger className="w-24 bg-[#1A2332] border-gray-700 text-white">
                      <SelectValue>{selectedToken}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A2332] border-gray-700">
                      <SelectItem value="SOL">SOL</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="flex-1 bg-[#1A2332] border-gray-700 text-white hover:bg-[#2A3342]"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>

                <TradeButton action="buy" />
              </div>
            </TabsContent>

            <TabsContent value="sell">
              <div className="space-y-4">
                {/* ... Similar structure as buy tab ... */}
                <TradeButton action="sell" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ... Keep existing chart section ... */}
    </div>
  );
};

export default CoinDetail;