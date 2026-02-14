import { useState } from 'react';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const ShareLink = ({ url }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!', { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-lg shadow-gray-200/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">Share this poll</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCopy}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[120px]"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy
            </>
          )}
        </button>
      </div>
      
      <button
        onClick={() => setShowQR(!showQR)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <QrCode className="w-4 h-4" />
        {showQR ? 'Hide' : 'Show'} QR Code
      </button>
      
      {showQR && (
        <div className="mt-4 flex justify-center p-4 bg-white rounded-2xl border border-gray-200">
          <QRCodeSVG value={url} size={200} level="H" />
        </div>
      )}
    </div>
  );
};

export default ShareLink;
