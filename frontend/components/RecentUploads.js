import { Info, Trash2, Download, ArrowRight, FileImage, FileText, FileVideo, FileMusic, FileArchive, File } from 'lucide-react';
import Link from 'next/link';
import RecLoader from './RecLoader';

const getFileIcon = (fileType) => {
    if (fileType.startsWith('image')) {
      return <FileImage className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType === 'application/pdf' || fileType.includes('word') || fileType === 'text/plain' || fileType.includes('excel')) {
      return <FileText className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType.startsWith('video')) {
      return <FileVideo className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType.startsWith('audio')) {
      return <FileMusic className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType === 'application/zip' || fileType.includes('tar')) {
      return <FileArchive className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else {
      return <File className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    }
  };

  const handleDownload = (upload) => {
    const dataStr = JSON.stringify(upload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${upload.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


const RecentUploads = ({ uploads, onMetadataClick, onDelete, loading}) => {
  const handleDelete = async (upload) => {
    if (!onDelete) {
      console.error("onDelete function is not defined.");
      return;
    }
  
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/deleteFile?id=${upload._id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          onDelete(upload);
        } else {
          console.error("Failed to delete the file");
        }
      } catch (error) {
        console.error("Error deleting the file:", error);
      }
    }
  };

  const noFiles = uploads.length === 0;
  
  return (
    <div className="mt-8">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 epilogue flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-[#1a1a1a] dark:text-[#f7f7f7]">
        <span>
          Your Recent <span className="text-[#f74b25ff]">Uploads</span>
        </span>
        <Link href="/profile" passHref>
          <button className="flex items-center text-[#1b1b1c] dark:text-[#e0e0e0] text-sm font-semibold hover:text-[#f74b25ff] dark:hover:text-[#ff6b35] self-start sm:self-auto transition">
            View More
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </Link>
      </h3>
      {loading ? ( <div className="flex justify-center align-center items-center h-full">
        <RecLoader /> 
      </div>) : (
        <> 
          <div className="space-y-4 w-full">
            {noFiles ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <p className="text-gray-500 dark:text-[#888] text-base sm:text-lg poppins text-center px-4">No files found. Upload a file to get started!</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block">
                  {uploads.map((upload, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#eceaea] dark:bg-[#2a2a2a] shadow-lg rounded w-full mb-4 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-4 w-1/3">
                        {getFileIcon(upload.type)}
                        <div className="w-64">
                          <h4 className="font-semibold truncate epilogue text-sm md:text-base text-[#1a1a1a] dark:text-[#f7f7f7]">{upload.filename}</h4>
                          <div className="text-xs mt-1 flex items-center space-x-2">
                            {upload.metadata && upload.metadata.tamper_report && (
                              (() => {
                                const tr = upload.metadata.tamper_report;
                                const score = tr.anomaly_score ?? tr.integrity_score ?? (tr.summary && tr.summary.score_estimate_out_of_100);
                                const detected = tr.anomaly_detected !== undefined ? tr.anomaly_detected : (score !== undefined ? (score <= 90) : false);
                                const statusColor = detected ? 'bg-red-500' : 'bg-green-500';
                                return (
                                  <>
                                    <span className={`inline-block px-2 py-0.5 text-white rounded-full ${statusColor}`}>{detected ? 'ANOMALY' : 'NORMAL'}</span>
                                    {upload.walletAddress && <span className="text-gray-600 dark:text-[#aaa]">{upload.walletAddress.slice(0,6)}...{upload.walletAddress.slice(-4)}</span>}
                                  </>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-center w-1/3">
                        <p className="text-sm text-gray-500 dark:text-[#aaa] poppins">
                          <span className="font-medium">Uploaded on:</span> {new Date(upload.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 justify-end w-1/3">
                        <button
                          className="p-2 bg-[#4CBB17] dark:bg-[#357a1c] text-white rounded hover:bg-[#2E8B57] dark:hover:bg-[#2d6b1a] transition"
                          aria-label="View Metadata"
                          onClick={() => onMetadataClick(upload)}
                        >
                          <Info className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-[#FF4433] dark:bg-[#cc3322] text-white rounded hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] transition"
                          aria-label="Delete File"
                          onClick={() => handleDelete(upload)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 bg-[#4169E1] dark:bg-[#2d4a9e] text-white rounded hover:bg-[#0F52BA] dark:hover:bg-[#1e3878] transition"
                          aria-label="Download File"
                          onClick={() => handleDownload(upload)}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile/Tablet View */}
                <div className="md:hidden space-y-4">
                  {uploads.map((upload, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#eceaea] dark:bg-[#2a2a2a] shadow-lg rounded w-full transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getFileIcon(upload.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate epilogue text-sm text-[#1a1a1a] dark:text-[#f7f7f7]">{upload.filename}</h4>
                          <div className="text-xs mt-1 flex items-center flex-wrap gap-2">
                            {upload.metadata && upload.metadata.tamper_report && (
                              (() => {
                                const tr = upload.metadata.tamper_report;
                                const score = tr.anomaly_score ?? tr.integrity_score ?? (tr.summary && tr.summary.score_estimate_out_of_100);
                                const detected = tr.anomaly_detected !== undefined ? tr.anomaly_detected : (score !== undefined ? (score <= 90) : false);
                                const statusColor = detected ? 'bg-red-500' : 'bg-green-500';
                                return (
                                  <>
                                    <span className={`inline-block px-2 py-0.5 text-white rounded-full text-xs ${statusColor}`}>{detected ? 'ANOMALY' : 'NORMAL'}</span>
                                    {upload.walletAddress && <span className="text-gray-600 dark:text-[#aaa] text-xs">{upload.walletAddress.slice(0,6)}...{upload.walletAddress.slice(-4)}</span>}
                                  </>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-[#aaa] poppins">
                          <span className="font-medium">Uploaded:</span> {new Date(upload.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex-1 p-2 bg-[#4CBB17] dark:bg-[#357a1c] text-white rounded hover:bg-[#2E8B57] dark:hover:bg-[#2d6b1a] transition text-xs font-semibold"
                          onClick={() => onMetadataClick(upload)}
                        >
                          View
                        </button>
                        <button
                          className="flex-1 p-2 bg-[#FF4433] dark:bg-[#cc3322] text-white rounded hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] transition text-xs font-semibold"
                          onClick={() => handleDelete(upload)}
                        >
                          Delete
                        </button>
                        <button
                          className="flex-1 p-2 bg-[#4169E1] dark:bg-[#2d4a9e] text-white rounded hover:bg-[#0F52BA] dark:hover:bg-[#1e3878] transition text-xs font-semibold"
                          onClick={() => handleDownload(upload)}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentUploads;
