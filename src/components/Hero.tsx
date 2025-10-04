import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";
import Lottie from "lottie-react";
import adbudAnimation from "../../public/images/adbud1.json";

interface HeroProps {
  onTryNow?: () => void;
}

export function Hero({ onTryNow }: HeroProps) {
  const scrollToGenerator = () => {
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col items-center text-center">
          {/* AI-Powered Ad Creation badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">AI-Powered Ad Creation</span>
          </motion.div>

          {/* Lottie Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="w-80 h-80 lg:w-96 lg:h-96">
              <Lottie
                animationData={adbudAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <span 
              className="block font-bold tracking-tight text-gray-900" 
              style={{ 
                fontFamily: 'Gravitas One, cursive',
                fontSize: 'clamp(1.75rem, 3.5vw, 4rem)',
                lineHeight: '0.9'
              }}
            >
              Generate Stunning Video Ads
            </span>
            <span 
              className="block font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" 
              style={{ 
                fontFamily: 'Gravitas One, cursive',
                fontSize: 'clamp(1.75rem, 3.5vw, 4rem)',
                lineHeight: '0.9'
              }}
            >
              in Minutes, Not Hours.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto mb-8 text-gray-600"
          >
            Think of AdBuddy as your AI-powered creative partner — speeding up ad production
            and helping you go from concept to compelling video in minutes. No editing skills needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-blue hover:bg-blue/90 text-blue-foreground px-8"
              onClick={onTryNow || scrollToGenerator}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try AdBuddy Now
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}