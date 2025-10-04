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
  return null;
}