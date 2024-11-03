import React, { useState } from 'react';

const EmbedPopup = ({ onClose, embedCode }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Embed This!</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            {/* Close icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <div className="bg-purple-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              {embedCode}
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className="w-full bg-[#837FFC] text-white py-2.5 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
          >
            {copied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </span>
            ) : (
              'Copy Code'
            )}
          </button>

          {/* Instructions */}
          <div className="text-sm text-gray-600">
            <p>Add this code to any HTML page where you want the chat widget to appear.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedPopup;