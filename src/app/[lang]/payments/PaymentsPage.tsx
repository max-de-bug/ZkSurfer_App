'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCreditCard } from 'react-icons/fa';

interface RechargeOption {
  package: string;
  credits: string;
  price: string;
}

const rechargeOptions: RechargeOption[] = [
  { package: '1', credits: '5,000', price: '$10' },
  { package: '2', credits: '10,000', price: '$15' },
  { package: '3', credits: '25,000', price: '$30' },
  { package: '4', credits: '50,000', price: '$50' },
  { package: '5', credits: '100,000', price: '$90' },
  { package: '6', credits: '200,000', price: '$140' },
  { package: '7', credits: '500,000', price: '$300' },
];

const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'past'>('recharge');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Payments</h1>
        {/* Example sidebar link insertion:
        <Link href="/payments" className="flex items-center space-x-2 text-blue-600 hover:underline">
          <FaCreditCard />
          <span>Payments</span>
        </Link>
        Place this link below your API Keys link in the sidebar. */}
      </header>

      <div className="mb-6 border-b">
        <button
          className={`py-2 px-4 -mb-px font-medium ${activeTab === 'recharge'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('recharge')}
        >
          Recharge
        </button>
        <button
          className={`py-2 px-4 -mb-px font-medium ${activeTab === 'past'
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
              {rechargeOptions.map((opt) => (
                <tr key={opt.package} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{opt.package}</td>
                  <td className="px-6 py-3">{opt.credits}</td>
                  <td className="px-6 py-3 font-medium">{opt.price}</td>
                  <td className="px-6 py-3">
                    <button
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'past' && (
        <div className="text-gray-500">
          {/* TODO: implement past payments list */}
          No past payments to display.
        </div>
      )}

      {/* Empty modal placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            {/* Modal content goes here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;