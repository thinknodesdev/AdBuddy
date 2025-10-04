import React from "react";
import { motion } from "motion/react";
import { Upload, Search, Sparkles, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CampaignCreation } from "./CampaignCreation";

const features = [
  {
    icon: Upload,
    title: "Upload Your Product",
    description:
      "Whether it's food, tech, fashion, or anything in between, just drop in your product images or details.",
    delay: 0,
  },
  {
    icon: Search,
    title: "Smart Search Engine Kicks In",
    description:
      "AdBudd automatically analyzes your product and searches for relevant themes, styles, and market data to inspire your ad.",
    delay: 0.1,
  },
  {
    icon: Sparkles,
    title: "AI-Generated Ad Mockups",
    description:
      "Within moments, you'll receive a ready-to-review video ad tailored to your product's niche and vibe.",
    delay: 0.2,
  },
  {
    icon: MessageSquare,
    title: "Edit with Prompts, Not Software",
    description:
      "Want a different tone, background, voiceover, or style? Just tell AdBudd what you want — no editing skills needed.",
    delay: 0.3,
  },
  {
    icon: CheckCircle,
    title: "Refine Until Perfect",
    description:
      "Keep tweaking with natural language prompts until your ad looks and feels just right.",
    delay: 0.4,
  },
];

interface FeaturesProps {
  onGoToStudio?: () => void;
  onCreateCampaign?: (campaignData: any) => void;
}

export function Features({ onGoToStudio, onCreateCampaign }: FeaturesProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="mb-4">
          How It Works
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Five simple steps from product to polished video ad
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: feature.delay }}
          >
            <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue text-white flex-shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full" />
                <span className="text-xs text-gray-400">Step {index + 1}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Campaign Creation Section */}
      <div className="mt-32">
        <CampaignCreation onCreateCampaign={onCreateCampaign} />
      </div>
    </div>
  );
}