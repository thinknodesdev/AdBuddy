import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Palette, Target, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { VideoPreview } from "./VideoPreview";

interface GenerateSectionProps {
  productName: string;
  onGenerateComplete: () => void;
}

const analysisSteps = [
  {
    icon: Target,
    label: "Analyzing product category",
    duration: 1000,
  },
  {
    icon: TrendingUp,
    label: "Researching market trends",
    duration: 1500,
  },
  {
    icon: Palette,
    label: "Selecting visual themes",
    duration: 1200,
  },
  {
    icon: Sparkles,
    label: "Generating video ad",
    duration: 2000,
  },
];

export function GenerateSection({
  productName,
  onGenerateComplete,
}: GenerateSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startGeneration = () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setProgress(0);
    setIsComplete(false);
  };

  useEffect(() => {
    if (!isGenerating) return;

    if (currentStep >= analysisSteps.length) {
      setProgress(100);
      setTimeout(() => {
        setIsComplete(true);
        onGenerateComplete();
      }, 500);
      return;
    }

    const stepDuration = analysisSteps[currentStep].duration;
    const progressIncrement = 100 / analysisSteps.length / (stepDuration / 50);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + progressIncrement;
        return Math.min(newProgress, ((currentStep + 1) / analysisSteps.length) * 100);
      });
    }, 50);

    const stepTimeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [isGenerating, currentStep, onGenerateComplete]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="mb-2">Your Ad is Ready!</h3>
          <p className="text-gray-600">
            We've generated a stunning video ad for {productName}
          </p>
        </div>

        <VideoPreview />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Move to the Edit & Refine tab to customize your ad with prompts
          </p>
        </div>
      </motion.div>
    );
  }

  if (isGenerating) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center">
          <h3 className="mb-2">Generating Your Video Ad</h3>
          <p className="text-gray-600">
            AI is creating a perfect ad for {productName}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              className="flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                    ? "bg-blue animate-pulse"
                    : "bg-gray-200"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <step.icon className={`w-6 h-6 ${index === currentStep ? "text-white" : "text-gray-400"}`} />
                )}
              </div>
              <div className="flex-1">
                <p className={index <= currentStep ? "" : "text-gray-400"}>
                  {step.label}
                </p>
              </div>
            </motion.div>
          ))}

          <div className="pt-4">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-center mt-3 text-gray-600">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h3 className="mb-3">Ready to Generate Your Ad</h3>
        <p className="text-gray-600 mb-8">
          Our AI will analyze {productName} and create a stunning video ad tailored to
          your product's niche. This will take just a few moments.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {analysisSteps.map((step, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-blue-50 border border-blue-200"
            >
              <step.icon className="w-6 h-6 text-blue mx-auto mb-2" />
              <p className="text-xs text-gray-700">{step.label}</p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="bg-blue hover:bg-blue/90 text-blue-foreground px-12"
          onClick={startGeneration}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Video Ad
        </Button>
      </div>
    </div>
  );
}