import React, { useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { AdGenerator } from "./components/AdGenerator";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import LightRays from "./components/LightRays";
import { UploadPage } from "./components/UploadPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'upload'>('home');
  const [productName, setProductName] = useState('');

  const handleUploadComplete = (name: string) => {
    setProductName(name);
    setCurrentPage('home');
  };

  const handleGoToUpload = () => {
    setCurrentPage('upload');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleCreateCampaign = (campaignData: any) => {
    console.log('Campaign created:', campaignData);
    // Here you could store the campaign data and then navigate to upload page
    // For now, we'll just show a success message and navigate to upload
    setCurrentPage('upload');
  };

  if (currentPage === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
        {/* LightRays Background */}
        <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#00ffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Toaster />
          <UploadPage onBack={handleBackToHome} onUploadComplete={handleUploadComplete} />
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* LightRays Background */}
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 pointer-events-auto">
        <Toaster />
        <Hero onTryNow={handleGoToUpload} />
        <Features onGoToStudio={handleGoToUpload} onCreateCampaign={handleCreateCampaign} />
        <AdGenerator onTryNow={handleGoToUpload} />
        <Footer />
      </div>
    </div>
  );
}