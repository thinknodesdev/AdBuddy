import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";

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
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">AI-Powered Ad Creation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            AdBudd: Instantly Generate High-Quality Video Ads for Your Product
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-8 text-gray-600"
          >
            Think of AdBudd as your AI-powered creative partner — speeding up ad production
            and helping you go from concept to compelling video in minutes. No editing skills needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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