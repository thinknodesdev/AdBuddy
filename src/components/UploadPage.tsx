import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, Image, FileText, X, CheckCircle, AlertCircle, Sparkles, Zap, Star,
  ArrowRight, ArrowLeft, Package, Tag, DollarSign, Globe, Users, Target,
  Camera, Palette, TrendingUp, Award, Shield, Clock, MapPin, Phone,
  Home, ArrowLeft as BackArrow
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface UploadPageProps {
  onBack: () => void;
  onUploadComplete: (productName: string) => void;
}

interface ProductData {
  // Step 1: Campaign Info
  campaignName: string;
  campaignDescription: string;
  
  // Step 2: Raw Video
  rawVideo: string;
  
  // Step 3: Images
  images: string[];
  
  // Step 4: Additional Videos
  videos: string[];
  
  // Step 5: Reference Links
  referenceLinks: string[];
}

const STEPS = [
  { id: 1, title: "Campaign", icon: Target, description: "Campaign name & description" },
  { id: 2, title: "Raw Video", icon: Upload, description: "Upload raw video content" },
  { id: 3, title: "Images", icon: Image, description: "Upload product images" },
  { id: 4, title: "Videos", icon: Camera, description: "Upload additional videos" },
  { id: 5, title: "References", icon: Globe, description: "Add reference links" },
  { id: 6, title: "Submit", icon: CheckCircle, description: "Review & submit" }
];

export function UploadPage({ onBack, onUploadComplete }: UploadPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    campaignName: "",
    campaignDescription: "",
    rawVideo: "",
    images: [],
    videos: [],
    referenceLinks: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('adbuddy-product-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setProductData(prev => ({ ...prev, ...data }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adbuddy-product-data', JSON.stringify(productData));
  }, [productData]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const newImages: string[] = [];
    const newVideos: string[] = [];
    let processedFiles = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith("image/")) {
          newImages.push(e.target?.result as string);
        } else if (file.type.startsWith("video/")) {
          newVideos.push(e.target?.result as string);
        }
        processedFiles++;

        if (processedFiles === files.length) {
          setTimeout(() => {
            setProductData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages],
              videos: [...prev.videos, ...newVideos],
              rawVideo: newVideos.length > 0 ? newVideos[0] : prev.rawVideo
            }));
            setUploadProgress(100);
            setIsUploading(false);
            setShowSuccess(true);
            toast.success(`${files.length} file(s) uploaded successfully!`);
            setTimeout(() => setShowSuccess(false), 2000);
          }, 1000);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updateProductData = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };


  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!productData.campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      toast.success("Campaign submitted successfully!");
      localStorage.removeItem('adbuddy-product-data');
      onUploadComplete(productData.campaignName);
    }, 1500);
  };

  const clearAll = () => {
    setProductData({
      campaignName: "",
      campaignDescription: "",
      rawVideo: "",
      images: [],
      videos: [],
      referenceLinks: []
    });
    setCurrentStep(1);
    localStorage.removeItem('adbuddy-product-data');
    toast.info("Form cleared");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
             <div className="space-y-6">
               <Label htmlFor="campaignName" className="text-xl font-semibold flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                   <Target className="w-4 h-4 text-white" />
                 </div>
                 Campaign Name *
               </Label>
               <Input
                 id="campaignName"
                 placeholder="e.g., Summer Collection 2024, Black Friday Sale"
                 value={productData.campaignName}
                 onChange={(e) => updateProductData('campaignName', e.target.value)}
                 className="bg-white text-lg py-4 px-4 transition-all duration-200 focus:scale-[1.01]"
               />
             </div>

             <div className="space-y-6">
               <Label htmlFor="campaignDescription" className="text-xl font-semibold flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                   <FileText className="w-4 h-4 text-white" />
                 </div>
                 Campaign Description *
               </Label>
               <Textarea
                 id="campaignDescription"
                 placeholder="Describe your campaign goals, target audience, key messages, and what you want to achieve..."
                 value={productData.campaignDescription}
                 onChange={(e) => updateProductData('campaignDescription', e.target.value)}
                 rows={6}
                 className="bg-white text-lg py-4 px-4 resize-none transition-all duration-200 focus:scale-[1.01]"
               />
             </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
             <div className="space-y-8">
               <Label className="text-2xl font-bold flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                   <Upload className="w-6 h-6 text-white" />
                 </div>
                 Upload Raw Video Content
               </Label>
               <motion.div
                 className={`relative border-2 border-dashed rounded-xl p-20 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${
                   isDragging
                     ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                     : productData.rawVideo
                     ? "border-green-500 bg-green-50"
                     : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50"
                 }`}
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.99 }}
                 transition={{ duration: 0.2 }}
               >
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="video/*"
                   onChange={handleFileSelect}
                   className="hidden"
                   disabled={isUploading}
                 />

                 {productData.rawVideo ? (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.3 }}
                     className="space-y-8"
                   >
                     <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                       <CheckCircle className="w-12 h-12 text-white" />
                     </div>
                     <div className="space-y-3">
                       <p className="text-2xl font-semibold text-green-600">Raw video uploaded successfully!</p>
                       <p className="text-lg text-gray-500">Click to replace</p>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.3 }}
                     className="space-y-8"
                   >
                     <motion.div
                       className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                       animate={isDragging ? {
                         scale: [1, 1.1, 1],
                         rotate: [0, 5, -5, 0]
                       } : {}}
                       transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                     >
                       <Upload className="w-16 h-16 text-white" />
                     </motion.div>
                     <div className="space-y-4">
                       <p className="text-2xl font-semibold">
                         {isDragging ? "Drop your video here!" : "Drag and drop raw video content here"}
                       </p>
                       <p className="text-xl text-gray-500">or click to browse</p>
                       <p className="text-lg text-gray-400">
                         Supports MP4, MOV, AVI up to 100MB
                       </p>
                     </div>
                   </motion.div>
                 )}
               </motion.div>
             </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
            <div>
              <Label className="mb-3 flex items-center gap-2 text-base font-semibold">
                <Image className="w-4 h-4" />
                Upload Product Images
              </Label>
              <motion.div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                    : productData.images.length > 0
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                {productData.images.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {productData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateProductData('images', productData.images.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                      animate={isDragging ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                    >
                      <Image className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {isDragging ? "Drop your images here!" : "Drag and drop product images here"}
                      </p>
                      <p className="text-gray-500">or click to browse</p>
                      <p className="text-sm text-gray-400">
                        Supports JPG, PNG, GIF up to 10MB each
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
            <div>
              <Label className="mb-3 flex items-center gap-2 text-base font-semibold">
                <Camera className="w-4 h-4" />
                Upload Additional Videos
              </Label>
              <motion.div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                    : productData.videos.length > 0
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                {productData.videos.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">{productData.videos.length} video(s) uploaded</p>
                      <p className="text-sm text-gray-500">Click to add more</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                      animate={isDragging ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                    >
                      <Camera className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {isDragging ? "Drop your videos here!" : "Drag and drop additional videos here"}
                      </p>
                      <p className="text-gray-500">or click to browse</p>
                      <p className="text-sm text-gray-400">
                        Supports MP4, MOV, AVI up to 100MB each
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Reference Links to Similar Ads
              </Label>
              <div className="space-y-2">
                {productData.referenceLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...productData.referenceLinks];
                        newLinks[index] = e.target.value;
                        updateProductData('referenceLinks', newLinks);
                      }}
                      placeholder="https://example.com/similar-ad"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newLinks = productData.referenceLinks.filter((_, i) => i !== index);
                        updateProductData('referenceLinks', newLinks);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLinks = [...productData.referenceLinks, ""];
                    updateProductData('referenceLinks', newLinks);
                  }}
                  className="w-full"
                >
                  + Add Reference Link
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-16"
          >
            <div className="text-center mb-12">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to Submit Your Campaign!</h3>
              <p className="text-lg text-gray-600">Review your campaign details and submit for AI processing</p>
            </div>

            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Campaign Name</Label>
                  <p className="text-lg font-semibold">{productData.campaignName || "Not specified"}</p>
                </div>
                
                {productData.campaignDescription && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Campaign Description</Label>
                    <p className="text-gray-700">{productData.campaignDescription}</p>
                  </div>
                )}

                {productData.rawVideo && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Raw Video</Label>
                    <p className="text-gray-700">✓ Uploaded</p>
                  </div>
                )}

                {productData.images.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Images</Label>
                    <p className="text-gray-700">{productData.images.length} image(s) uploaded</p>
                  </div>
                )}

                {productData.videos.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Additional Videos</Label>
                    <p className="text-gray-700">{productData.videos.length} video(s) uploaded</p>
                  </div>
                )}

                {productData.referenceLinks.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reference Links</Label>
                    <p className="text-gray-700">{productData.referenceLinks.length} reference(s) added</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* LightRays Background */}
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div className="w-full h-full bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-20"
        >
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-1 text-sm"
                >
                  <BackArrow className="w-3 h-3" />
                  Back to Home
                </Button>
                <div className="h-4 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Try AdBuddy Now
                  </h1>
                  <p className="text-xs text-gray-600">Experience the power of AI-driven ad creation</p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-16">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-12">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </motion.div>
                    <div className="mt-4 text-center">
                      <p className={`text-lg font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {step.description}
                      </p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-10 h-0.5 mt-6 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={(currentStep / STEPS.length) * 100} className="w-full h-1" />
          </motion.div>

          {/* Step Content */}
          <Card className="p-12 mb-16">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </Card>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <Button
              variant="outline"
              onClick={clearAll}
              className="transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  onClick={nextStep}
                  className="bg-blue hover:bg-blue/90 text-blue-foreground px-8"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                       <Button
                         size="lg"
                         className="bg-blue hover:bg-blue/90 text-blue-foreground px-8"
                         onClick={handleSubmit}
                         disabled={isValidating || !productData.campaignName.trim()}
                       >
                  {isValidating ? (
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
                      Generating...
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Video Ad
                    </motion.div>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
