import Navbar from '@/components/Navbar';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { CloudUpload } from 'lucide-react';
import Footer from '@/components/Footer';
import RecentUploads from '@/components/RecentUploads';
import MetadataModal from '@/components/MetadataModal';
import { useRouter } from 'next/router';
import MetadataAndRecommendations from '@/components/MetadataRecommendations';
import UploadLoader from '@/components/UploadLoader';
import WalletConnectModal from '@/components/WalletConnectModal';

const Upload = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileEnter, setFileEnter] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileMetadata, setSelectedFileMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [recentUploadMetadata, setRecentUploadMetadata] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark class to html element
    if (typeof document !== 'undefined') {
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUserEmail();
    }
  }, [mounted]);

  useEffect(() => {
    if (userEmail) {
      fetchUploadedFiles();
      // Show wallet modal if wallet hasn't been connected or skipped
      const walletAddress = localStorage.getItem('walletAddress');
      const walletSkipped = localStorage.getItem('walletSkipped');
      if (!walletAddress && !walletSkipped && process.env.NEXT_PUBLIC_ENABLE_WALLET === 'true') {
        setShowWalletModal(true);
      }
    }
  }, [userEmail]);

  const fetchUserEmail = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
  
      const userData = await response.json();
      setUserEmail(userData.email);
    } catch (error) {
      router.push('/login');
    }
  };

  const validateFileType = (file) => {
    if (!file) return false;
  
    const allowedFileTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      // Compressed Files
      'application/zip',
      'application/x-tar',
      'application/gzip',
    ];
  
    // File extensions fallback for browsers that may not provide file.type correctly
    const validExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf', '.doc', '.docx', '.txt',
      '.xls', '.xlsx', '.csv', '.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg',
      '.zip', '.tar', '.gz','.webp'
    ];
  
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
  
    return allowedFileTypes.includes(file.type) || validExtensions.includes(fileExtension);
  };
  

  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/upload?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (response.ok) {
        const sortedFiles = data.files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const top5Files = sortedFiles.slice(0, 5);
        
        setRecentUploads(top5Files || []);
      } else {
        console.error("❌ Fetch error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (!validateFileType(uploadedFile)) {
        alert("Unsupported file type. Please upload a valid file.");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", uploadedFile);
      // include user email and optional connected wallet address
      formData.append("email", userEmail);
      try {
        const walletAddr = localStorage.getItem('walletAddress');
        if (walletAddr) {
          formData.append('walletAddress', walletAddr);
        }
      } catch (e) {
        // ignore localStorage errors
      }
  
      setUploading(true);
  
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
  
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        setSelectedFileMetadata({
          ...data.metadata,
          filename: uploadedFile.name,
        });
        setBlockchainData(data.blockchain);
        setShowMetadata(true);
        fetchUploadedFiles();
        setFile(uploadedFile);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFileEnter(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!validateFileType(droppedFile)) {
        alert('Unsupported file type. Please upload a valid file.');
        return;
      }
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleMetadataClick = (upload) => {
    setRecentUploadMetadata(upload);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDelete = (deletedUpload) => {
    setRecentUploads((prevUploads) => prevUploads.filter((upload) => upload._id !== deletedUpload._id));
  };

  const handleModDelete = async (deletedUpload) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/deleteFile?id=${deletedUpload._id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error('Failed to delete the file');
        }
        setRecentUploads((prevUploads) => prevUploads.filter((upload) => upload._id !== deletedUpload._id));
        handleModalClose();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('❌ Failed to delete file. Please try again.');
      }
    }
  };

  return (
    <>
    <Head>
      <title>Upload your File | MetaTrace</title>
    </Head>
    <div className="min-h-screen bg-[#f7f7f7ff] dark:bg-[#1a1a1a] flex flex-col transition-colors duration-300">
      <Navbar />
      <div className="px-4 sm:px-6 md:px-9 flex flex-col py-6 md:py-8 justify-center flex-1">
        {showMetadata ? (
          <MetadataAndRecommendations
            metadata={selectedFileMetadata}
            blockchainData={blockchainData}
            onBackToUpload={() => setShowMetadata(false)}
          />
        ) : uploading ? (
          <div className="flex items-center justify-center h-full">
            <UploadLoader />
          </div>
        ) : (
          <div className="upload-container">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 epilogue text-center text-[#1a1a1a] dark:text-[#f7f7f7]">
              Upload Your <span className="text-[#f74b25ff]">File</span>
            </h2>
            <p className="text-[#5e5e5eff] dark:text-[#bcbcbc] poppins mb-6 md:mb-8 text-base sm:text-lg text-center">
              Securely upload and manage your files in one place.
            </p>
            <div
              onClick={() => document.getElementById('file-upload').click()}
              onDragOver={(e) => {
                e.preventDefault();
                setFileEnter(true);
              }}
              onDragLeave={() => setFileEnter(false)}
              onDrop={handleFileDrop}
              className={`${
                fileEnter
                  ? 'border-[#1b1b1cff] bg-[#fbb3a3] dark:bg-[#ff7a5c] scale-105'
                  : 'border-[#1b1b1cff] dark:border-[#bcbcbc] bg-[#fbb3a3] dark:bg-[#2a2a2a]'
              } border-dashed border-2 rounded-lg p-6 sm:p-8 md:p-10 w-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200`}
            >
              <CloudUpload className="w-12 h-12 sm:w-16 sm:h-16 text-[#1c1c1cff] dark:text-[#e0e0e0] mb-4" />
              <p className="text-[#1c1c1cff] dark:text-[#e0e0e0] font-semibold poppins text-sm sm:text-base text-center px-2">
                Drag & drop your files here or click to upload
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
            </div>
          </div>
        )}
        <RecentUploads
          uploads={recentUploads}
          onMetadataClick={handleMetadataClick}
          onDelete={handleDelete}
          loading={loading}
        />
        <MetadataModal
          isOpen={isModalOpen}
          fileMetadata={recentUploadMetadata}
          onClose={handleModalClose}
          onDelete={handleModDelete}
        />
      </div>
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          localStorage.setItem('walletSkipped', 'true');
        }}
        onConnect={(address) => {
          setShowWalletModal(false);
        }}
      />
    </div>
    <Footer />
  </>
    );
};

export default Upload;