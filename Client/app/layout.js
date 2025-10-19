import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/compoenent/nav";
import Footer from "@/compoenent/footer";
import AuthGuard from "@/component/AuthGuide";
import WhatsAppLink from "@/component/groupIcon";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Datanest gh | Data Marketplace",
  description: "The leading platform for data resellers in Ghana to buy and sell client data securely and efficiently.",
  keywords: "data marketplace, Ghana, data resellers, buy data, sell data, client data, Ghana data market",
  verification: {
    google: "Ef-n9jMB8qrIion-ddD_qPQpqd1syAOgKmuvhaBu_2o",
  },
  openGraph: {
    title: " | Ghana's Premier Data Marketplace",
    description: "Connect with data resellers across Ghana. Buy and sell client data securely on our trusted platform.",
    url: "https://www.datanestgh.com",
    siteName: "DATAHUSTLE", 
    images: [
      {
        url: "/component/datamart-logo.svg",
        width: 1200,
        height: 630,
        alt: "DataHistle - Ghana's Data Marketplace",
      },
    ],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DATA hustle | Ghana's Premier Data Marketplace",
    description: "Connect with data resellers across Ghana. Buy and sell client data securely on our trusted platform.",
    images: ["/images/datamart-twitter.jpg"],
  },
  alternates: {
    canonical: "https://www.datanestgh.shop/",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.datanestgh.shop"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
       
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
          <WhatsAppLink/>
        </main>
        <Footer />
      </body>
    </html>
  );
}