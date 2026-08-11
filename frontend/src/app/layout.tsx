import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/auth/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Public Product Website",
  description: "Public Product Website through Next.js and Strapi CMS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        <Providers>
          <Header />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 bg-white dark:bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-600 dark:text-slate-500 bg-white dark:bg-[#060910] transition-colors duration-300">
            &copy; Built with Next.js, ESLint, and Strapi CMS.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
