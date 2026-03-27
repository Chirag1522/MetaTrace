// frontend/pages/_app.js
import "../app/globals.css";
import { Poppins, Epilogue } from "next/font/google";
import dynamic from "next/dynamic";

const WalletProvider = dynamic(() => import("@/components/WalletProvider").then((mod) => ({ default: mod.WalletProvider })), {
  ssr: false,
  loading: () => <div />,
});

const poppins_init = Poppins({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  variable: '--font-poppins',
});

const epilogue_init = Epilogue({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  variable: '--font-epilogue',
});

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <div className={`${epilogue_init.variable} ${poppins_init.variable} antialiased`}>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </WalletProvider>
  );
}

export default MyApp;
