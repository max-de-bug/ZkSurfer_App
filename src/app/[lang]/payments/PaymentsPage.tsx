'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaCreditCard } from 'react-icons/fa';
import ButtonV1New from '@/component/ui/buttonV1';

interface RechargeOption {
  package: string;
  credits: string;
  price: string;
}

const rechargeOptions: RechargeOption[] = [
  { package: '1', credits: '5,000',   price: '$10' },
  { package: '2', credits: '10,000',  price: '$15' },
  { package: '3', credits: '25,000',  price: '$30' },
  { package: '4', credits: '50,000',  price: '$50' },
  { package: '5', credits: '100,000', price: '$90' },
  { package: '6', credits: '200,000', price: '$140' },
  { package: '7', credits: '500,000', price: '$300' },
];

const PAYMENT_HISTORY_URL = 'https://zynapse.zkagi.ai/v1/payment-history';
const API_KEY             = 'zk-123321';

const PaymentsPage: React.FC = () => {
  const { publicKey } = useWallet();

  const [activeTab,       setActiveTab]       = useState<'recharge'|'past'>('recharge');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [pastPayments,    setPastPayments]    = useState<any[]>([]);
  const [loadingPast,     setLoadingPast]     = useState(false);
  const [errorPast,       setErrorPast]       = useState<string|null>(null);

  // Whenever we switch into "Past Payments", fetch the history
  useEffect(() => {
    if (activeTab !== 'past' || !publicKey) return;

    setLoadingPast(true);
    setErrorPast(null);

    fetch(PAYMENT_HISTORY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        wallet_address: publicKey.toString(),
      }),
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        // assume the response is an array, or adapt if it's nested
        if (Array.isArray(data)) {
          setPastPayments(data);
        } else if (Array.isArray(data.payments)) {
          setPastPayments(data.payments);
        } else {
          // fallback: wrap object in array
          setPastPayments([data]);
        }
      })
      .catch(err => {
        console.error("Error loading payment history:", err);
        setErrorPast(err.message);
      })
      .finally(() => setLoadingPast(false));
  }, [activeTab, publicKey]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Payments</h1>
        {/* Sidebar link example */}
        <Link href="/payments" className="flex items-center space-x-2 text-blue-600 hover:underline">
          <FaCreditCard />
          <span>Payments</span>
        </Link>
      </header>

      <div className="mb-6 border-b">
        <button
          className={`py-2 px-4 -mb-px font-medium ${
            activeTab === 'recharge'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('recharge')}
        >
          Recharge
        </button>
        <button
          className={`py-2 px-4 -mb-px font-medium ${
            activeTab === 'past'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('past')}
        >
          Past Payments
        </button>
      </div>

      {activeTab === 'recharge' && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-3">Package</th>
                <th className="px-6 py-3">Credits</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Buy</th>
              </tr>
            </thead>
            <tbody>
              {rechargeOptions.map(opt => (
                <tr key={opt.package} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{opt.package}</td>
                  <td className="px-6 py-3">{opt.credits}</td>
                  <td className="px-6 py-3 font-medium">{opt.price}</td>
                  <td className="px-6 py-3">
                    <ButtonV1New onClick={() => setIsModalOpen(true)}>
                      Buy
                    </ButtonV1New>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          {loadingPast && <p>Loading payment history…</p>}
          {errorPast && <p className="text-red-500">Error: {errorPast}</p>}
          {!loadingPast && !errorPast && pastPayments.length === 0 && (
            <p className="text-gray-600">No past payments to display.</p>
          )}
          {!loadingPast && pastPayments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded shadow-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {/* adjust columns to your API’s fields */}
                    {Object.keys(pastPayments[0]).map(key => (
                      <th key={key} className="px-6 py-3">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pastPayments.map((record, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      {Object.values(record).map((val, j) => (
                        <td key={j} className="px-6 py-3">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty modal placeholder for "Buy" (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            {/* …your existing purchase modal content… */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
