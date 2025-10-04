import React, { useState } from "react";
import { motion } from "motion/react";
import { Calendar, User, Globe, Target, ArrowRight, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface CampaignCreationProps {
  onCreateCampaign?: (campaignData: CampaignData) => void;
}

interface CampaignData {
  campaignName: string;
  channel: string;
  startDate: string;
  owner: string;
  distributor: string;
  goLiveDate: string;
}

const initialCampaignData: CampaignData = {
  campaignName: "",
  channel: "",
  startDate: "",
  owner: "",
  distributor: "",
  goLiveDate: "",
};

export function CampaignCreation({ onCreateCampaign }: CampaignCreationProps) {
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCampaignData(prev => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (!campaignData.campaignName.trim()) {
      toast.error("Campaign Name is required.");
      return false;
    }
    if (!campaignData.channel.trim()) {
      toast.error("Channel is required.");
      return false;
    }
    if (!campaignData.startDate) {
      toast.error("Start Date is required.");
      return false;
    }
    if (!campaignData.owner.trim()) {
      toast.error("Owner is required.");
      return false;
    }
    if (!campaignData.distributor.trim()) {
      toast.error("Distributor is required.");
      return false;
    }
    if (!campaignData.goLiveDate) {
      toast.error("Go Live Date is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Campaign created successfully!");
      if (onCreateCampaign) {
        onCreateCampaign(campaignData);
      }
      // Reset form
      setCampaignData(initialCampaignData);
    }, 2000);
  };

  const channels = [
    "Facebook",
    "Instagram", 
    "TikTok",
    "YouTube",
    "Twitter",
    "LinkedIn",
    "Snapchat",
    "Pinterest"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mt-8"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          Create Your Campaign
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto text-sm">
          Set up your campaign metadata before uploading your product details
        </p>
      </div>

      <Card className="p-6 bg-white/90 backdrop-blur-sm border-2 shadow-xl max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Name */}
          <div className="md:col-span-2">
            <Label htmlFor="campaignName" className="mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Campaign Name *
            </Label>
            <Input
              id="campaignName"
              placeholder="e.g., Summer Collection 2024"
              value={campaignData.campaignName}
              onChange={handleInputChange}
            />
          </div>

          {/* Channel */}
          <div>
            <Label htmlFor="channel" className="mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Channel *
            </Label>
            <select
              id="channel"
              value={campaignData.channel}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Channel</option>
              {channels.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <Label htmlFor="owner" className="mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Owner *
            </Label>
            <Input
              id="owner"
              placeholder="e.g., John Smith"
              value={campaignData.owner}
              onChange={handleInputChange}
            />
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate" className="mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={campaignData.startDate}
              onChange={handleInputChange}
            />
          </div>

          {/* Go Live Date */}
          <div>
            <Label htmlFor="goLiveDate" className="mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Go Live Date *
            </Label>
            <Input
              id="goLiveDate"
              type="date"
              value={campaignData.goLiveDate}
              onChange={handleInputChange}
            />
          </div>

          {/* Distributor */}
          <div className="md:col-span-2">
            <Label htmlFor="distributor" className="mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Distributor *
            </Label>
            <Input
              id="distributor"
              placeholder="e.g., Company Name, Agency Name"
              value={campaignData.distributor}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <Button
            size="lg"
            className="bg-blue hover:bg-blue/90 text-blue-foreground px-8"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Creating Campaign...
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <Plus className="w-5 h-5" />
                Create Campaign
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
