import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UploadPage } from "./UploadPage";
import { GenerateSection } from "./GenerateSection";
import { EditSection } from "./EditSection";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface AdGeneratorProps {
  onTryNow?: () => void;
}

export function AdGenerator({ onTryNow }: AdGeneratorProps) {
  return (
    <div id="generator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Card className="p-8 bg-white/90 backdrop-blur-sm border-2 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}