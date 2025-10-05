import React, { useState } from 'react';
import { Upload, Video, Brain, Home, Folder, BarChart3, Settings, Library, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface StudioDashboardProps {
    onBack: () => void;
    onAnalyze: (data: any) => void;
    onGoToAdsLibrary?: () => void;
}

export function StudioDashboard({ onBack, onAnalyze, onGoToAdsLibrary }: StudioDashboardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{
        video: File | null;
        images: File[];
        audio: File | null;
    }>({
        video: null,
        images: [],
        audio: null
    });
    const [campaignDescription, setCampaignDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        files.forEach(file => {
            if (file.type.startsWith('video/')) {
                setUploadedFiles(prev => ({ ...prev, video: file }));
            } else if (file.type.startsWith('image/')) {
                setUploadedFiles(prev => ({ ...prev, images: [...prev.images, file] }));
            } else if (file.type.startsWith('audio/')) {
                setUploadedFiles(prev => ({ ...prev, audio: file }));
            }
        });
    };

    const handleAnalyze = async () => {
        if (!campaignDescription.trim()) {
            alert('Please enter a campaign description');
            return;
        }

        setIsAnalyzing(true);

        const formData = new FormData();
        if (uploadedFiles.video) formData.append('video', uploadedFiles.video);
        uploadedFiles.images.forEach(img => formData.append('images', img));
        if (uploadedFiles.audio) formData.append('audio', uploadedFiles.audio);
        formData.append('campaignDescription', campaignDescription);

        try {
            const response = await fetch('http://localhost:5000/api/analyze-campaign', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                onAnalyze(result.data);
            } else {
                alert('Analysis failed: ' + result.error);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to connect to server');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <aside className="w-20 bg-white border-r flex flex-col items-center py-6 space-y-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                </div>

                <nav className="flex-1 flex flex-col items-center space-y-6">
                    <button className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Home className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 rounded-xl text-gray-400 hover:bg-gray-100 flex items-center justify-center">
                        <Video className="w-6 h-6" />
                    </button>

                    {onGoToAdsLibrary && (
                        <button
                            onClick={onGoToAdsLibrary}
                            className="w-12 h-12 rounded-xl text-gray-400 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center transition-colors"
                        >
                            <Library className="w-6 h-6" />
                        </button>
                    )}

                    <button className="w-12 h-12 rounded-xl text-gray-400 hover:bg-gray-100 flex items-center justify-center">
                        <Folder className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 rounded-xl text-gray-400 hover:bg-gray-100 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </button>
                </nav>

                <button
                    onClick={onBack}
                    className="w-12 h-12 rounded-xl text-gray-400 hover:bg-gray-100 flex items-center justify-center"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {/* Header */}
                <header className="bg-white px-8 py-6 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="text-xl font-bold text-gray-800">Logo</div>
                            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {onGoToAdsLibrary && (
                                <button
                                    onClick={onGoToAdsLibrary}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Library className="w-4 h-4" />
                                    Browse Ads
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🇺🇸</span>
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* AI Agent Greeting + Upload Section */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* AI Agent Card - LEFT */}
                        <div className="col-span-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden">
                            {/* Decorative blob */}
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                            Hello, Alex!
                                        </h2>
                                        <p className="text-sm text-blue-600 font-medium">Have a nice day!</p>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/50">
                                    <p className="text-gray-800 text-base leading-relaxed mb-3">
                                        <span className="font-semibold">This month is sales peak for Fashion! 📈</span>
                                    </p>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Based on your campaign history, I recommend focusing on:
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            Seasonal Trends
                                        </span>
                                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            Instagram Reels
                                        </span>
                                        <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                                            UGC Content
                                        </span>
                                    </div>
                                </div>

                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    Read more →
                                </button>
                            </div>
                        </div>

                        {/* New Video Upload - RIGHT */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">New Video Upload</h3>
                                    <p className="text-xs text-gray-500">Drop your video file here</p>
                                </div>
                            </div>

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 font-medium mb-1">Browse</p>
                                <p className="text-xs text-gray-400">Video, Image, Audio</p>
                            </div>
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                accept="video/*,image/*,audio/*"
                                onChange={handleFileInput}
                                className="hidden"
                            />

                            <div className="text-xs text-gray-500 mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span>Video Title</span>
                                    <span className="text-gray-400">Duration</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Train_Ya_Giant_Pit</span>
                                    <span className="text-gray-400">00:10:35</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 flex items-center justify-between">
                                <span>Date Uploaded</span>
                                <span className="text-gray-700">05/10/2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Description */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Campaign Description
                        </label>
                        <textarea
                            value={campaignDescription}
                            onChange={(e) => setCampaignDescription(e.target.value)}
                            placeholder="Describe your campaign goals, target audience, and what you'd like to test..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={!campaignDescription || isAnalyzing}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-2">Time Saved</div>
                            <div className="text-3xl font-bold text-pink-600">42 hrs/week</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-2">Videos Analyzed</div>
                            <div className="text-3xl font-bold text-blue-600">128</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-2">Top Emotion</div>
                            <div className="text-3xl font-bold text-orange-500">Joy</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-2">Brand Impact Score</div>
                            <div className="text-3xl font-bold text-green-600">+23%</div>
                        </div>
                    </div>

                    {/* POST AN AD WIDGET - Bottom Left Corner */}
                    <div className="fixed bottom-8 left-28 z-50">
                        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl p-6 shadow-2xl border-4 border-white max-w-xs transform hover:scale-105 transition-transform cursor-pointer">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Post an Ad</h3>
                                    <p className="text-xs text-white/90">Using AI</p>
                                </div>
                            </div>
                            <p className="text-white text-sm mb-4">
                                Create high-converting ads in seconds with AI-powered recommendations
                            </p>
                            <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                                <Zap className="w-5 h-5" />
                                Create Now
                            </button>
                        </div>
                    </div>

                    {/* Latest Uploaded Video Section */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Latest Uploaded Video</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                Analyze →
                            </button>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700 mb-1">Train_Ya_Giant_Pit</div>
                                <div className="text-xs text-gray-500">Duration: 00:10:35 • Uploaded: 05/10/2025</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}