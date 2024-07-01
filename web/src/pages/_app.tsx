import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import "~/styles/globals.css";
import { AuthContextProvider } from "~/contexts/authContext";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  // not share cache between request when single server serves more than 1 user
  const [queryClient] = useState(new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <main className={`font-sans ${inter.variable} text-white`}>
          <Component {...pageProps} />
        </main>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

export default MyApp;
