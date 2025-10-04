import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Wand2, Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { VideoPreview } from "./VideoPreview";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const suggestions = [
  "Make the background more vibrant",
  "Add upbeat background music",
  "Change the tone to more professional",
  "Add a call-to-action at the end",
  "Make it more minimalist",
  "Add product specifications",
];

const editHistory = [
  {
    prompt: "Make the background more cinematic",
    timestamp: "2 min ago",
  },
  {
    prompt: "Add dynamic text animations",
    timestamp: "5 min ago",
  },
];

export function EditSection() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    toast.loading("Processing your request...");

    setTimeout(() => {
      setIsProcessing(false);
      toast.dismiss();
      toast.success("Ad updated successfully!");
      setPrompt("");
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleDownload = () => {
    toast.success("Downloading your video ad...");
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard!");
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center mb-6">
        <h3 className="mb-2">Edit & Refine Your Ad</h3>
        <p className="text-gray-600">
          Use natural language to customize your video ad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Preview */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPreview />

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-blue hover:bg-blue/90 text-blue-foreground"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Video
            </Button>
            <Button size="lg" variant="outline" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Edit Panel */}
        <div className="space-y-6">
          {/* Prompt input */}
          <Card className="p-4">
            <div className="mb-4">
              <label className="block mb-2 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" />
                Tell us what to change
              </label>
              <Textarea
                placeholder="e.g., Make the background darker and add energetic music..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSendPrompt();
                  }
                }}
              />
            </div>
            <Button
              className="w-full bg-blue hover:bg-blue/90 text-blue-foreground"
              onClick={handleSendPrompt}
              disabled={isProcessing || !prompt.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Apply Changes"}
            </Button>
          </Card>

          {/* Quick suggestions */}
          <Card className="p-4">
            <h4 className="mb-3">Quick Suggestions</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Edit history */}
          <Card className="p-4">
            <h4 className="mb-3">Recent Changes</h4>
            <div className="space-y-3">
              {editHistory.map((edit, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <p className="text-sm mb-1">{edit.prompt}</p>
                  <p className="text-xs text-gray-500">{edit.timestamp}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}