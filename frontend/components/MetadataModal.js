import { X, Copy, Trash2, Download } from 'lucide-react';

const EXPLORER_TX_BASE = 'https://moonbase.moonscan.io/tx';

const pickTxHash = (fileMetadata) => {
  if (!fileMetadata) return null;
  const candidates = [
    fileMetadata.txHash,
    fileMetadata.transactionHash,
    fileMetadata?.blockchain?.txHash,
    fileMetadata?.blockchain?.transactionHash,
    fileMetadata?.metadata?.txHash,
    fileMetadata?.metadata?.transactionHash,
    fileMetadata?.metadata?.blockchain?.txHash,
    fileMetadata?.metadata?.blockchain?.transactionHash,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const MetadataModal = ({ isOpen, fileMetadata, onClose, onDelete }) => {
  if (!isOpen) return null;

  const txHash = pickTxHash(fileMetadata);
  const txExplorerUrl = txHash ? `${EXPLORER_TX_BASE}/${txHash}` : null;

  const handleDownload = (fileMetadata) => {
    const dataStr = JSON.stringify(fileMetadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileMetadata.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = (fileMetadata) => {
    if (!fileMetadata) return;

    // Format the metadata as plain text
    const metadataText = `
      File Name: ${fileMetadata.filename}
      Upload Date: ${new Date(fileMetadata.uploadDate).toLocaleDateString()}
      ${fileMetadata.metadata ? Object.entries(fileMetadata.metadata).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`).join('\n') : 'No metadata available'}
          `.trim();

    // Copy the text to the clipboard
    navigator.clipboard.writeText(metadataText)
      .then(() => {
        alert('Metadata copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy metadata:', error);
        alert('Failed to copy metadata. Please try again.');
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f4f4f4] dark:bg-[#2a2a2a] rounded-lg shadow-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-[#5e5e5eff] dark:text-[#aaa] hover:text-[#1a1a1aff] dark:hover:text-[#e0e0e0] transition"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base sm:text-lg text-[#1a1a1aff] dark:text-[#f7f7f7] epilogue font-bold mb-2">
          Metadata of <span className="text-[#f74b25ff] truncate">{fileMetadata?.filename || 'N/A'}</span>
        </h3>
        {/* Wallet and anomaly summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div className="text-xs sm:text-sm text-gray-700 dark:text-[#aaa]">
            {fileMetadata?.walletAddress ? (
              <>Wallet: <span className="font-mono text-xs sm:text-sm">{fileMetadata.walletAddress.slice(0,6)}...{fileMetadata.walletAddress.slice(-4)}</span></>
            ) : (
              <span className="text-gray-400 dark:text-[#666]">No wallet connected</span>
            )}
            {txExplorerUrl && (
              <div className="mt-1">
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ef4d31ff] hover:underline"
                >
                  View transaction on blockchain explorer →
                </a>
              </div>
            )}
            {!txExplorerUrl && (
              <div className="mt-1 text-gray-500 dark:text-[#777]">
                Transaction link unavailable for this record.
              </div>
            )}
          </div>
          <div>
            {fileMetadata?.metadata?.tamper_report && (() => {
              const tr = fileMetadata.metadata.tamper_report;
              const score = tr.anomaly_score ?? tr.integrity_score ?? (tr.summary && tr.summary.score_estimate_out_of_100);
              const detected = tr.anomaly_detected !== undefined ? tr.anomaly_detected : (score !== undefined ? (score <= 90) : false);
              const statusClass = detected ? 'bg-red-500' : 'bg-green-500';
              const statusText = detected ? 'ANOMALY' : 'NORMAL';
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-2 py-0.5 text-white rounded-full text-xs sm:text-sm ${statusClass}`}>{statusText}</span>
                  {score !== undefined && <span className="text-xs sm:text-sm text-gray-600 dark:text-[#aaa]">Score: {score}/100</span>}
                </div>
              );
            })()}
          </div>
        </div>
        <div className="overflow-y-auto max-h-96">
          <ul className="list-none text-xs sm:text-sm poppins text-[#1a1a1a] dark:text-[#e0e0e0]">
            {fileMetadata ? (
              <>
                <li className="mb-2">
                  <span className="font-medium capitalize">Name:</span> <span className="break-all">{fileMetadata.filename}</span>
                </li>
                <li className="mb-2">
                  <span className="font-medium capitalize">Upload Date:</span> {new Date(fileMetadata.uploadDate).toLocaleDateString()}
                </li>
                {fileMetadata.metadata ? (
                  Object.entries(fileMetadata.metadata).map(([key, value]) => (
                    <li className="mb-2 flex flex-col sm:flex-row" key={key}>
                      <span className="font-medium capitalize mr-2 text-xs sm:text-sm">{key}:</span>
                      <span className="whitespace-pre-wrap break-words text-xs sm:text-sm">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="mb-2 text-gray-500 dark:text-[#888] poppins">No metadata available</li>
                )}
              </>
            ) : (
              <li className="text-gray-500 dark:text-[#888] poppins">No file selected</li>
            )}
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end mt-4">
          <button
            className="p-2 bg-[#4CBB17] dark:bg-[#357a1c] text-white rounded hover:bg-[#2E8B57] dark:hover:bg-[#2d6b1a] transition text-sm font-semibold"
            onClick={() => handleCopy(fileMetadata)}
          >
            <Copy className="w-4 h-4 inline mr-2" /> Copy
          </button>
          <button
            className="p-2 bg-[#FF4433] dark:bg-[#cc3322] text-white rounded hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] transition text-sm font-semibold"
            onClick={() => onDelete(fileMetadata)}
          >
            <Trash2 className="w-4 h-4 inline mr-2" /> Delete
          </button>
          <button
            className="p-2 bg-[#4169E1] dark:bg-[#2d4a9e] text-white rounded hover:bg-[#0F52BA] dark:hover:bg-[#1e3878] transition text-sm font-semibold"
            onClick={() => handleDownload(fileMetadata)}
          >
            <Download className="w-4 h-4 inline mr-2" /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;