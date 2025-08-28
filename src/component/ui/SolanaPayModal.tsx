// import ReactDOM from 'react-dom';
// import { QRCodeCanvas } from 'qrcode.react';

// export function SolanaPayModal({
//   url,
//   onClose,
// }: {
//   url: string;
//   onClose: () => void;
// }) {
//   return ReactDOM.createPortal(
//     <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70">
//       <div className="bg-gray-900 rounded-xl p-6 space-y-4">
//         <h3 className="text-white text-lg font-semibold">
//           Scan with your Solana wallet
//         </h3>
//         <QRCodeCanvas value={url} size={256} />
//         <button
//           onClick={onClose}
//           className="w-full py-2 bg-red-600 text-white rounded-lg"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>,
//     document.body
//   );
// }


import ReactDOM from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';

export function SolanaPayModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <h3 className="text-white mb-4">Scan with your Solana wallet</h3>
        <QRCodeCanvas value={url} size={256} />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}
