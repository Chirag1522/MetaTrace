import { useState, useEffect } from "react";
import { UserPen, Wallet } from "lucide-react";

export default function ProfileCard({ name, email, password, onSave, walletAddress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ name, email, password });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [wallet, setWallet] = useState(walletAddress);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const isDarkMode = typeof document !== 'undefined' && 
        document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Check on mount
    checkDarkMode();

    // Create a MutationObserver to watch for class changes
    const observer = new MutationObserver(checkDarkMode);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true });
    }

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const connectWallet = async () => {
    try {
      setWalletLoading(true);
      if (!window.ethereum) {
        alert('MetaMask not detected. Please install MetaMask extension.');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        setWallet(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        alert('Wallet connected successfully!');
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
      alert('Failed to connect wallet: ' + err.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnectWallet = () => {
    const confirm = window.confirm('Are you sure you want to disconnect your wallet?');
    if (confirm) {
      setWallet(null);
      localStorage.removeItem('walletAddress');
      alert('Wallet disconnected!');
    }
  };

  const handleSave = async () => {
    const confirmUpdate = window.confirm("Are you sure you want to update your details?");
    if (!confirmUpdate) return;

    if (newPassword && newPassword !== confirmPassword) {
      window.alert("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      window.alert("Profile updated successfully!");
      onSave(userData);
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      window.alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? "bg-[#1a1a1a] text-[#e0e0e0]" : "bg-white text-[#1c1c1c]"} min-h-screen transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className={`text-xl sm:text-2xl font-bold epilogue ${isDark ? "text-[#f7f7f7ff]" : "text-[#1b1b1cff]"}`}>
          Profile <span className="text-[#ef4d31ff]">Information</span>
        </h2>
        <button
          className={`flex items-center space-x-2 font-semibold transition text-sm sm:text-base ${isDark ? "text-[#ff6b35] hover:text-[#ff8555]" : "text-[#ef4d31ff] hover:text-[#bf3e27]"}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          <UserPen className="text-lg sm:text-xl" />
          <span className="epilogue">Edit</span>
        </button>
      </div>

      <div className={`rounded-xl shadow-md p-4 sm:p-6 ${isDark ? "bg-[#2a2a2a]" : "bg-[#fefefa]"}`}>
        <div className="space-y-4 poppins">
          {/* Wallet Section */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b ${isDark ? "border-[#3a3a3a]" : ""}`}>
            <span className={`font-semibold text-base sm:text-lg flex items-center gap-2 ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>
              <Wallet size={20} />
              Wallet
            </span>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className={`font-medium text-sm sm:text-base break-all sm:break-normal ${isDark ? "text-[#e0e0e0ff]" : "text-[#1c1c1cff]"}`}>
                {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Not connected'}
              </span>
              {!wallet ? (
                <button
                  onClick={connectWallet}
                  disabled={walletLoading}
                  className={`px-3 py-1 text-white rounded-lg text-xs sm:text-sm transition disabled:opacity-50 whitespace-nowrap ${isDark ? "bg-[#0d7c3c] hover:bg-[#0a5220]" : "bg-[#0b6623] hover:bg-[#0a5220]"}`}
                >
                  {walletLoading ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <button
                  onClick={disconnectWallet}
                  className={`px-3 py-1 text-white rounded-lg text-xs sm:text-sm transition whitespace-nowrap ${isDark ? "bg-[#c43c3c] hover:bg-[#a03333]" : "bg-red-600 hover:bg-red-700"}`}
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className={`font-semibold text-base sm:text-lg ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>Name</span>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className={`border rounded px-2 py-1 font-medium text-sm sm:text-base w-full sm:w-auto ${isDark ? "bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0ff]" : "border-gray-300 text-[#1c1c1cff]"}`}
              />
            ) : (
              <span className={`font-medium text-sm sm:text-base break-all ${isDark ? "text-[#e0e0e0ff]" : "text-[#1c1c1cff]"}`}>{userData.name}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className={`font-semibold text-base sm:text-lg ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>Email</span>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className={`border rounded px-2 py-1 font-medium text-sm sm:text-base w-full sm:w-auto ${isDark ? "bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0ff]" : "border-gray-300 text-[#1c1c1cff]"}`}
              />
            ) : (
              <span className={`font-medium text-sm sm:text-base break-all ${isDark ? "text-[#e0e0e0ff]" : "text-[#1c1c1cff]"}`}>{userData.email}</span>
            )}
          </div>

          {/* Password Fields - Only show when editing */}
          {isEditing && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className={`font-semibold text-base sm:text-lg ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`border rounded px-2 py-1 font-medium text-sm sm:text-base w-full sm:w-auto ${isDark ? "bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0ff]" : "border-gray-300 text-[#1c1c1cff]"}`}
                  placeholder="Enter current password"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className={`font-semibold text-base sm:text-lg ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`border rounded px-2 py-1 font-medium text-sm sm:text-base w-full sm:w-auto ${isDark ? "bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0ff]" : "border-gray-300 text-[#1c1c1cff]"}`}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className={`font-semibold text-base sm:text-lg ${isDark ? "text-[#b0b0b0ff]" : "text-[#5e5e5eff]"}`}>Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`border rounded px-2 py-1 font-medium text-sm sm:text-base w-full sm:w-auto ${isDark ? "bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0ff]" : "border-gray-300 text-[#1c1c1cff]"}`}
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className={`mt-6 text-[#f7f7f7ff] px-4 py-2 rounded-lg shadow font-semibold poppins transition text-sm sm:text-base disabled:opacity-50 w-full sm:w-auto ${isDark ? "bg-[#ff6b35] hover:bg-[#ff8555]" : "bg-[#ef4d31ff] hover:bg-[#bf3e27]"}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}