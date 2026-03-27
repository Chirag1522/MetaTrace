import { Info, Trash2, Download, FileImage, FileText, FileVideo, FileMusic, FileArchive, File, Upload } from 'lucide-react';
import { useRouter } from 'next/router';

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

export default function FileList({ files, onDelete, onMetadataClick, onAllDelete }) {
  const router = useRouter();

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
          onDelete(upload); // Call onDelete to update UI
        } else {
          console.error("Failed to delete the file");
        }
      } catch (error) {
        console.error("Error deleting the file:", error);
      }
    }
  };

  const handleDownloadAll = () => {
    const dataStr = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_files.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all files?");
    if (confirmDelete) {
      try {
        const response = await fetch('/api/deleteAllFiles', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileIds: files.map((file) => file._id) }),
        });

        if (response.ok) {
          onAllDelete(null); // Clear the files state
        } else {
          console.error("Failed to delete all files");
        }
      } catch (error) {
        console.error("Error deleting all files:", error);
      }
    }
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  const noFiles = !files || files.length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[#f7f7f7] epilogue">
          File <span className="text-[#ef4d31ff]">History</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-semibold epilogue text-sm md:text-base ${
              noFiles ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#0F52BA] dark:hover:text-[#4189f4]'
            }`}
            onClick={handleDownloadAll}
            disabled={noFiles}
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-[#4169E1]" />
            <span className='text-[#4169E1] hidden sm:inline'>Download All</span>
            <span className='text-[#4169E1] sm:hidden'>Download</span>
          </button>
          <button
            className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-semibold epilogue text-sm md:text-base ${
              noFiles ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#D22B2B] dark:hover:text-[#ff6b5b]'
            }`}
            onClick={handleDeleteAll}
            disabled={noFiles}
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-[#FF4433]" />
            <span className='text-[#FF4433] hidden sm:inline'>Delete All</span>
            <span className='text-[#FF4433] sm:hidden'>Delete</span>
          </button>
          <button
            className="px-3 py-2 rounded-lg hover:text-[#2E8B57] dark:hover:text-[#5fd77f] transition-colors flex items-center justify-center font-semibold epilogue text-sm md:text-base"
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-[#4CBB17]" />
            <span className='text-[#4CBB17]'>Upload</span>
          </button>
        </div>
      </div>

      <div className="bg-[#fefefa] dark:bg-[#2a2a2a] rounded-xl shadow-md p-4 md:p-6 transition-colors duration-300">
        {noFiles ? (
          <div className="flex items-center justify-center h-48 md:h-64">
            <p className="text-gray-500 dark:text-[#aaa] text-base md:text-lg poppins text-center px-4">No files found. Upload a file to get started!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-[#3a3a3a]">
                    <th className="py-3 px-4 text-sm md:text-base font-semibold text-gray-800 dark:text-[#e0e0e0] poppins">File Name</th>
                    <th className="py-3 px-4 text-sm md:text-base font-semibold text-gray-800 dark:text-[#e0e0e0] poppins">Upload Date</th>
                    <th className="py-3 px-4 text-sm md:text-base font-semibold text-gray-800 dark:text-[#e0e0e0] poppins">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file._id} className="border-b dark:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="text-gray-700 dark:text-[#e0e0e0] font-medium epilogue text-sm md:text-base break-all">{file.filename}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-[#aaa] poppins text-sm md:text-base">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 flex items-center justify-start gap-2 md:gap-3">
                        <button
                          className="p-2 bg-[#4CBB17] dark:bg-[#357a1c] text-white rounded-lg hover:bg-[#2E8B57] dark:hover:bg-[#2d6b1a] transition-colors"
                          aria-label="View Metadata"
                          onClick={() => onMetadataClick(file)}
                        >
                          <Info className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          className="p-2 bg-[#FF4433] dark:bg-[#cc3322] text-white rounded-lg hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] transition-colors"
                          aria-label="Delete File"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          className="p-2 bg-[#4169E1] dark:bg-[#2d4a9e] text-white rounded-lg hover:bg-[#0F52BA] dark:hover:bg-[#1e3878] transition-colors"
                          aria-label="Download File"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {files.map((file) => (
                <div key={file._id} className="border border-gray-200 dark:border-[#3a3a3a] rounded-lg p-4 hover:shadow-md dark:shadow-none dark:hover:shadow-[0_0_0_1px_#3a3a3a] transition-shadow bg-white dark:bg-[#2a2a2a]">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-gray-700 dark:text-[#e0e0e0] font-medium epilogue text-sm break-all">{file.filename}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 dark:text-[#aaa] poppins text-xs">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="flex-1 p-2 bg-[#4CBB17] dark:bg-[#357a1c] text-white rounded-lg hover:bg-[#2E8B57] dark:hover:bg-[#2d6b1a] transition-colors text-xs font-semibold"
                      onClick={() => onMetadataClick(file)}
                    >
                      View
                    </button>
                    <button
                      className="flex-1 p-2 bg-[#FF4433] dark:bg-[#cc3322] text-white rounded-lg hover:bg-[#D22B2B] dark:hover:bg-[#b82d2d] transition-colors text-xs font-semibold"
                      onClick={() => handleDelete(file)}
                    >
                      Delete
                    </button>
                    <button
                      className="flex-1 p-2 bg-[#4169E1] dark:bg-[#2d4a9e] text-white rounded-lg hover:bg-[#0F52BA] dark:hover:bg-[#1e3878] transition-colors text-xs font-semibold"
                      onClick={() => handleDownload(file)}
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
    </div>
  );
}