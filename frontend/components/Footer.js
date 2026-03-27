const Footer = () => (
  <footer className="bg-[#1c1c1cff] dark:bg-[#0a0a0a] text-[#f7f7f7ff] dark:text-[#e0e0e0] py-6 md:py-8 px-4 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6">
        {/* Brand */}
        <div className="text-center md:text-left">
          <h4 className="font-black epilogue text-lg dark:text-[#f7f7f7] mb-2">MetaTrace</h4>
          <p className="text-[#b7b7b7] dark:text-[#888] poppins text-xs md:text-sm">Secure file authentication and metadata analysis</p>
        </div>

        {/* Links */}
        <div className="text-center">
          <h4 className="font-bold epilogue text-sm dark:text-[#f7f7f7] mb-3">Quick Links</h4>
          <ul className="space-y-2 poppins text-xs md:text-sm">
            <li><a href="/login" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Login</a></li>
            <li><a href="/signup" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Sign Up</a></li>
            <li><a href="#" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Documentation</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="text-center md:text-right">
          <h4 className="font-bold epilogue text-sm dark:text-[#f7f7f7] mb-3">Support</h4>
          <ul className="space-y-2 poppins text-xs md:text-sm">
            <li><a href="#" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Privacy Policy</a></li>
            <li><a href="#" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Terms of Service</a></li>
            <li><a href="#" className="text-[#b7b7b7] dark:text-[#888] hover:text-[#ef4d31ff] dark:hover:text-[#ff6b35] transition">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#333] dark:border-[#2a2a2a] mb-4"></div>

      {/* Copyright */}
      <div className="text-center">
        <p className="text-xs md:text-sm epilogue text-[#b7b7b7] dark:text-[#888]">
          Developed with ❤️ by <strong className="text-[#ef4d31ff] dark:text-[#ff6b35] poppins">Team MetaTrace</strong>
        </p>
        <p className="text-xs text-[#666] dark:text-[#444] mt-2">© 2026 MetaTrace. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
  