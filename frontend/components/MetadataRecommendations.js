import { Upload, FolderSearch, List, BrainCog, Smile, Frown, FileText } from "lucide-react";
import { useState, useEffect } from 'react';
import AILoader from "./AILoader";

const MetadataAndRecommendations = ({ metadata, blockchainData, onBackToUpload }) => {
  console.log("yeh hai meta data kaa object ",metadata)
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (metadata) {
      fetchAnalysis();
    }
  }, [metadata]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      console.log('📤 Sending metadata to backend:', metadata);
      const backendUrl = 'https://metatrace-backend.onrender.com';
      const response = await fetch(`${backendUrl}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      const data = await response.json();
      console.log('📥 Received response from backend:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis');
      }

      setAiResponse(data);
    } catch (error) {
      console.error('❌ Error fetching analysis:', error);
      // Show error in UI instead of just console
      setAiResponse({
        anomaly_detected: true,
        reason: `Error: ${error.message}`,
        recommendations: [],
        best_practices: [],
        metadata_summary: {
          brief_summary: { title: "File Properties Overview", content: [] },
          authenticity: { title: "Authenticity & Manipulation Analysis", content: [] },
          metadata_table: { title: "Metadata Analysis Table", headers: [], rows: [] },
          use_cases: { title: "Recommended Applications", content: [] }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg p-4 sm:p-6 w-full transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div className="flex items-start sm:items-center gap-2">
          <FolderSearch className="w-5 h-5 sm:w-6 sm:h-6 text-[#ef4d31ff] flex-shrink-0 mt-1 sm:mt-0" />
          <h3 className="text-lg sm:text-2xl font-bold text-[#1b1b1cff] dark:text-[#f7f7f7] epilogue break-words">
            File Analysis for <span className="text-[#ef4d31ff]">{metadata?.filename || "File"}</span>
          </h3>
        </div>
        <button
          onClick={onBackToUpload}
          className="p-2 sm:p-3 rounded-lg hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] bg-[#ef4d31ff] transition-colors flex items-center justify-center font-semibold epilogue text-xs sm:text-sm whitespace-nowrap"
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-[#000000]" />
          <span className='text-[#000000]'>Upload</span>
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {/* Security Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f7f7f7ff] dark:bg-[#333] p-4 rounded-lg transition-colors duration-300">
            <div className="flex items-center mb-4 gap-2">
              <List className="w-5 h-5 text-[#ef4d31ff]" />
              <h4 className="text-base sm:text-lg font-bold epilogue text-[#1a1a1a] dark:text-[#f7f7f7]">Metadata</h4>
            </div>
            <div className="overflow-y-auto max-h-80">
              <ul className="list-none text-xs sm:text-sm poppins space-y-2">
                {metadata ? (
                  Object.entries(metadata.metadata).map(([key, value]) => (
                    <li className="flex flex-col" key={key}>
                      <span className="font-medium capitalize text-xs sm:text-sm text-[#1a1a1a] dark:text-[#e0e0e0]">{key}:</span>
                      <span className="whitespace-pre-wrap break-words text-xs sm:text-sm text-gray-700 dark:text-[#aaa]">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-[#888] poppins text-xs sm:text-sm">No metadata available</li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-[#f7f7f7ff] dark:bg-[#333] p-4 rounded-lg transition-colors duration-300">
            <div className="flex items-center mb-4 gap-2">
              <BrainCog className="w-5 h-5 text-[#ef4d31ff]" />
              <h4 className="text-base sm:text-lg font-bold epilogue text-[#1a1a1a] dark:text-[#f7f7f7]">Anomaly Detection</h4>
            </div>
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <AILoader />
                </div>
              ) : aiResponse ? (
                <div className="flex flex-col items-center justify-center text-center">
                  {aiResponse.anomaly_detected ? (
                    <>
                      <Frown className="w-12 h-12 sm:w-16 sm:h-16 text-[#ef4d31ff] mb-4" />
                      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 p-3 sm:p-4 mb-4">
                        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 poppins">
                          <strong>Anomalies Detected:</strong><br />
                          {aiResponse.reason}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Smile className="w-12 h-12 sm:w-16 sm:h-16 text-[#4CBB17] mb-4" />
                      <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-600 p-3 sm:p-4 mb-4">
                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 poppins">
                          <strong>No Anomalies Found:</strong><br />
                          {aiResponse.reason}
                        </p>
                      </div>
                    </>
                  )}
                  {aiResponse.anomaly_detected ? (
                    <>
                      <p className="text-xs sm:text-sm text-[#000000] dark:text-[#e0e0e0] poppins mb-2">
                        <strong>Recommended Actions</strong>
                      </p>
                      <ul className="list-disc pl-4 text-left text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins space-y-1">
                        {(aiResponse.recommendations || []).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm text-[#000000] dark:text-[#e0e0e0] poppins mb-2">
                        <strong>Best Practices</strong>
                      </p>
                      <ul className="list-disc pl-4 text-left text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins space-y-1">
                        {(aiResponse.best_practices || []).map((practice, index) => (
                          <li key={index}>{practice}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins">No analysis available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Analysis Section */}
        <div className="bg-[#f7f7f7ff] dark:bg-[#333] p-4 rounded-lg transition-colors duration-300">
          <div className="flex items-center mb-4 gap-2">
            <FileText className="w-5 h-5 text-[#ef4d31ff]" />
            <h4 className="text-base sm:text-lg font-bold epilogue text-[#1a1a1a] dark:text-[#f7f7f7]">Metadata Analysis</h4>
          </div>
          <div className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg shadow-sm transition-colors duration-300">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <AILoader />
              </div>
            ) : aiResponse?.metadata_summary ? (
              <div className="space-y-6">
                {/* Brief Summary */}
                {aiResponse.metadata_summary.brief_summary && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2 text-sm sm:text-base">
                      {aiResponse.metadata_summary.brief_summary.title}
                    </h5>
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins space-y-1">
                      {aiResponse.metadata_summary.brief_summary.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authenticity Analysis */}
                {aiResponse.metadata_summary.authenticity && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2 text-sm sm:text-base">
                      {aiResponse.metadata_summary.authenticity.title}
                    </h5>
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins space-y-1">
                      {aiResponse.metadata_summary.authenticity.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Table */}
                {aiResponse.metadata_summary.metadata_table && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2 text-sm sm:text-base">
                      {aiResponse.metadata_summary.metadata_table.title}
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-[#3a3a3a] text-xs sm:text-sm">
                        <thead className="bg-gray-50 dark:bg-[#3a3a3a]">
                          <tr>
                            {aiResponse.metadata_summary.metadata_table.headers.map((header, index) => (
                              <th
                                key={index}
                                className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-[#999] uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#2a2a2a] divide-y divide-gray-200 dark:divide-[#3a3a3a]">
                          {aiResponse.metadata_summary.metadata_table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm poppins ${
                                    cellIndex === 2 
                                      ? cell === 'normal' 
                                        ? 'text-green-600 dark:text-green-400'
                                        : cell === 'suspicious'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-red-600 dark:text-red-400'
                                      : 'text-gray-700 dark:text-[#aaa]'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {aiResponse.metadata_summary.use_cases && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2 text-sm sm:text-base">
                      {aiResponse.metadata_summary.use_cases.title}
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins">
                      {aiResponse.metadata_summary.use_cases.content.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-700 dark:text-[#aaa] poppins">No metadata analysis available</p>
            )}
          </div>
        </div>

        {/* View Transaction Link */}
        {!loading && blockchainData?.txHash && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#3a3a3a] flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            <a
              href={`https://moonbase.moonscan.io/tx/${blockchainData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-[#ef4d31ff] hover:underline hover:text-[#D22B2B] dark:hover:text-[#ff6b35] transition-colors poppins text-center sm:text-right"
            >
              View transaction on block explorer →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataAndRecommendations;