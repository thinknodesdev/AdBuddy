import React, { useState } from "react";
import { motion } from "motion/react";
import { Play, Pause, Volume2, Maximize } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function VideoPreview() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
    >
      {/* Mock video preview */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=675&fit=crop"
          alt="Video ad preview"
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Mock ad text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-white drop-shadow-lg">
              Experience Premium Sound
            </h2>
            <p className="text-lg mb-6 text-white/90 drop-shadow-lg">
              Wireless. Powerful. Unstoppable.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Video controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          {/* Progress bar */}
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: isPlaying ? "100%" : "30%" }}
              transition={{ duration: isPlaying ? 15 : 0 }}
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Volume2 className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Duration badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
        15s
      </div>
    </motion.div>
  );
}