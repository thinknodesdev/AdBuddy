import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, Image, FileText, X, CheckCircle, AlertCircle, Sparkles, Zap, Star,
  ArrowRight, ArrowLeft, Package, Tag, DollarSign, Globe, Users, Target,
  Camera, Palette, TrendingUp, Award, Shield, Clock, MapPin, Phone
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface UploadSectionProps {
  onUploadComplete: (productName: string) => void;
}

interface ProductData {
  // Step 1: Basic Info
  productName: string;
  category: string;
  brand: string;
  
  // Step 2: Product Details
  description: string;
  price: string;
  currency: string;
  features: string[];
  
  // Step 3: Target Audience
  targetAudience: string;
  ageRange: string;
  interests: string[];
  location: string;
  
  // Step 4: Marketing Goals
  campaignGoal: string;
  budget: string;
  timeline: string;
  callToAction: string;
  
  // Step 5: Media
  images: string[];
  videos: string[];
  logo: string;
  
  // Step 6: Additional Info
  website: string;
  socialMedia: string[];
  contactInfo: string;
  specialOffers: string;
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: Package, description: "Product name, category & brand" },
  { id: 2, title: "Product Details", icon: FileText, description: "Description, price & features" },
  { id: 3, title: "Target Audience", icon: Users, description: "Who you're targeting" },
  { id: 4, title: "Marketing Goals", icon: Target, description: "Campaign objectives" },
  { id: 5, title: "Media Assets", icon: Camera, description: "Images, videos & logo" },
  { id: 6, title: "Additional Info", icon: Globe, description: "Website & contact details" }
];

export function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    productName: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    currency: "USD",
    features: [],
    targetAudience: "",
    ageRange: "",
    interests: [],
    location: "",
    campaignGoal: "",
    budget: "",
    timeline: "",
    callToAction: "",
    images: [],
    videos: [],
    logo: "",
    website: "",
    socialMedia: [],
    contactInfo: "",
    specialOffers: ""
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
    let processedFiles = 0;

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
          newImages.push(e.target?.result as string);
          processedFiles++;
          
          if (processedFiles === files.length) {
            setTimeout(() => {
              setProductData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
              }));
              setUploadProgress(100);
              setIsUploading(false);
              setShowSuccess(true);
              toast.success(`${files.length} image(s) uploaded successfully!`);
              setTimeout(() => setShowSuccess(false), 2000);
            }, 1000);
          }
      };
      reader.readAsDataURL(file);
      }
    });
  };

  const updateProductData = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    const newFeature = prompt("Enter a product feature:");
    if (newFeature && newFeature.trim()) {
      updateProductData('features', [...productData.features, newFeature.trim()]);
    }
  };

  const removeFeature = (index: number) => {
    updateProductData('features', productData.features.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    const newInterest = prompt("Enter an interest:");
    if (newInterest && newInterest.trim()) {
      updateProductData('interests', [...productData.interests, newInterest.trim()]);
    }
  };

  const removeInterest = (index: number) => {
    updateProductData('interests', productData.interests.filter((_, i) => i !== index));
  };

  const addSocialMedia = () => {
    const newSocial = prompt("Enter social media platform:");
    if (newSocial && newSocial.trim()) {
      updateProductData('socialMedia', [...productData.socialMedia, newSocial.trim()]);
    }
  };

  const removeSocialMedia = (index: number) => {
    updateProductData('socialMedia', productData.socialMedia.filter((_, i) => i !== index));
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
    if (!productData.productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    toast.success("Product uploaded successfully!");
      localStorage.removeItem('adbuddy-product-data');
      onUploadComplete(productData.productName);
    }, 1500);
  };

  const clearAll = () => {
    setProductData({
      productName: "",
      category: "",
      brand: "",
      description: "",
      price: "",
      currency: "USD",
      features: [],
      targetAudience: "",
      ageRange: "",
      interests: [],
      location: "",
      campaignGoal: "",
      budget: "",
      timeline: "",
      callToAction: "",
      images: [],
      videos: [],
      logo: "",
      website: "",
      socialMedia: [],
      contactInfo: "",
      specialOffers: ""
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
            className="space-y-6"
          >
            <div>
              <Label htmlFor="productName" className="mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Name *
              </Label>
              <Input
                id="productName"
                placeholder="e.g., Wireless Headphones Pro"
                value={productData.productName}
                onChange={(e) => updateProductData('productName', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div>
              <Label htmlFor="category" className="mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category *
              </Label>
              <Input
                id="category"
                placeholder="e.g., Electronics, Fashion, Food"
                value={productData.category}
                onChange={(e) => updateProductData('category', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div>
              <Label htmlFor="brand" className="mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="e.g., Apple, Nike, Coca-Cola"
                value={productData.brand}
                onChange={(e) => updateProductData('brand', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="description" className="mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Product Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your product's key features and benefits..."
                value={productData.description}
                onChange={(e) => updateProductData('description', e.target.value)}
                rows={4}
                className="bg-white resize-none transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price
                </Label>
                <Input
                  id="price"
                  placeholder="99.99"
                  value={productData.price}
                  onChange={(e) => updateProductData('price', e.target.value)}
                  className="bg-white transition-all duration-200 focus:scale-[1.01]"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="mb-3">
                  Currency
                </Label>
                <select
                  id="currency"
                  value={productData.currency}
                  onChange={(e) => updateProductData('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Key Features
              </Label>
              <div className="space-y-2">
                {productData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1 justify-start">
                      {feature}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  + Add Feature
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
  return (
    <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="targetAudience" className="mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Audience *
              </Label>
              <Textarea
                id="targetAudience"
                placeholder="Describe your ideal customer..."
                value={productData.targetAudience}
                onChange={(e) => updateProductData('targetAudience', e.target.value)}
                rows={3}
                className="bg-white resize-none transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div>
              <Label htmlFor="ageRange" className="mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Age Range
              </Label>
              <Input
                id="ageRange"
                placeholder="e.g., 25-45, 18-35"
                value={productData.ageRange}
                onChange={(e) => updateProductData('ageRange', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div>
              <Label htmlFor="location" className="mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Primary Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., United States, Europe, Global"
                value={productData.location}
                onChange={(e) => updateProductData('location', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div>
              <Label className="mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Interests & Hobbies
              </Label>
              <div className="space-y-2">
                {productData.interests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1 justify-start">
                      {interest}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInterest(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addInterest}
                  className="w-full"
                >
                  + Add Interest
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
      <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="campaignGoal" className="mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Campaign Goal *
              </Label>
              <select
                id="campaignGoal"
                value={productData.campaignGoal}
                onChange={(e) => updateProductData('campaignGoal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a goal</option>
                <option value="brand-awareness">Brand Awareness</option>
                <option value="lead-generation">Lead Generation</option>
                <option value="sales">Sales</option>
                <option value="engagement">Engagement</option>
                <option value="app-installs">App Installs</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget" className="mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </Label>
                <Input
                  id="budget"
                  placeholder="1000"
                  value={productData.budget}
                  onChange={(e) => updateProductData('budget', e.target.value)}
                  className="bg-white transition-all duration-200 focus:scale-[1.01]"
                />
              </div>
              <div>
                <Label htmlFor="timeline" className="mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </Label>
                <select
                  id="timeline"
                  value={productData.timeline}
                  onChange={(e) => updateProductData('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="3-months">3 Months</option>
                  <option value="6-months">6 Months</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="callToAction" className="mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Call to Action
              </Label>
              <Input
                id="callToAction"
                placeholder="e.g., Shop Now, Learn More, Get Started"
                value={productData.callToAction}
                onChange={(e) => updateProductData('callToAction', e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.01]"
              />
            </div>
      </motion.div>
        );

      case 5:
        return (
      <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
        <Label className="mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Product Images *
        </Label>
        <motion.div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${
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

                <AnimatePresence>
                  {isUploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="w-8 h-8 text-white" />
                      </motion.div>
                      <p className="text-sm font-medium mb-2">Uploading...</p>
                      <Progress value={uploadProgress} className="w-48 mb-2" />
                      <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                      animate={isDragging ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                      <p className="mb-1 font-medium">
                        {isDragging ? "Drop your images here!" : "Drag and drop product images here"}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports JPG, PNG, GIF up to 10MB each
                      </p>
              </div>
            </motion.div>
          )}
        </motion.div>
            </div>
      </motion.div>
        );

      case 6:
        return (
      <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
      >
        <div>
              <Label htmlFor="website" className="mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL
          </Label>
          <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={productData.website}
                onChange={(e) => updateProductData('website', e.target.value)}
            className="bg-white transition-all duration-200 focus:scale-[1.01]"
          />
        </div>

        <div>
              <Label htmlFor="contactInfo" className="mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
          </Label>
          <Input
                id="contactInfo"
                placeholder="email@company.com or phone number"
                value={productData.contactInfo}
                onChange={(e) => updateProductData('contactInfo', e.target.value)}
            className="bg-white transition-all duration-200 focus:scale-[1.01]"
          />
        </div>

            <div>
              <Label className="mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Social Media Platforms
              </Label>
              <div className="space-y-2">
                {productData.socialMedia.map((social, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1 justify-start">
                      {social}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addSocialMedia}
                  className="w-full"
                >
                  + Add Social Media
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="specialOffers" className="mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Special Offers or Promotions
              </Label>
              <Textarea
                id="specialOffers"
                placeholder="Any special offers, discounts, or promotions..."
                value={productData.specialOffers}
                onChange={(e) => updateProductData('specialOffers', e.target.value)}
                rows={3}
                className="bg-white resize-none transition-all duration-200 focus:scale-[1.01]"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-8"
      >
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Product Information
          </h3>
          <Zap className="w-6 h-6 text-purple-500" />
        </motion.div>
        <p className="text-sm text-gray-600">
          Tell us about your product to create amazing video ads
        </p>
        <motion.div
          className="flex justify-center gap-2 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Auto-Save
          </Badge>
        </motion.div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mt-6 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="w-full" />
      </motion.div>

      {/* Step Content */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </Card>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-between items-center pt-4"
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
              disabled={isValidating || !productData.productName.trim()}
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
                  Validating...
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
    </motion.div>
  );
}