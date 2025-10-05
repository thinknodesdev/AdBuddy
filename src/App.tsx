import React, { useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import LightRays from "./components/LightRays";
import { StudioDashboard } from "./components/StudioDashboard";
import { AnalyticsView } from "./components/AnalyticsView";
import { AdsLibrary } from "./components/AdsLibrary";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'studio' | 'analytics' | 'ads-library'>('home');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleGoToStudio = () => setCurrentPage('studio');
  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedVideo(null);
  };
  const handleAnalyzeVideo = (videoData: any) => {
    setSelectedVideo(videoData);
    setCurrentPage('analytics');
  };
  const handleGoToAdsLibrary = () => setCurrentPage('ads-library');

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
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
        <div className="relative z-10 pointer-events-auto">
          <Toaster />
          <Hero onTryNow={handleGoToStudio} />
          <Features onGoToStudio={handleGoToStudio} onCreateCampaign={handleGoToStudio} />
          <Footer />
        </div>
      </div>
    );
  }

  if (currentPage === 'studio') {
    return (
      <>
        <Toaster />
        <StudioDashboard
          onBack={handleBackToHome}
          onAnalyze={handleAnalyzeVideo}
          onGoToAdsLibrary={handleGoToAdsLibrary}
        />
      </>
    );
  }

  if (currentPage === 'ads-library') {
    return (
      <>
        <Toaster />
        <AdsLibrary onBack={() => setCurrentPage('studio')} />
      </>
    );
  }

  if (currentPage === 'analytics') {
    return (
      <>
        <Toaster />
        <AnalyticsView videoData={selectedVideo} onBack={() => setCurrentPage('studio')} />
      </>
    );
  }

  return null;
}