import React, { useState } from 'react';
import { ArrowLeft, Play, Brain, Heart, Zap, Video, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
    videoData: any;
    onBack: () => void;
}

export function AnalyticsView({ videoData, onBack }: AnalyticsViewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!videoData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No analysis data</p>
                    <button onClick={onBack} className="px-6 py-3 bg-blue-600 text-white rounded-xl">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { adTitles, narrative, videoReferences, sceneBreakdown, insights } = videoData;

    const tabs = [
        { id: 'overview', name: 'Overview' },
        { id: 'narrative', name: 'Narrative' },
        { id: 'scenes', name: 'Scenes' },
        { id: 'titles', name: 'Titles' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b p-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Studio
                </button>

                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-lg font-medium ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-6">
                            <MetricCard icon={Heart} label="Top Emotion" value={insights?.topEmotion || 'Joy'} />
                            <MetricCard icon={Zap} label="Brand Moments" value={insights?.brandMoments || 8} />
                            <MetricCard icon={Video} label="Video Refs" value={videoReferences?.length || 3} />
                            <MetricCard icon={Sparkles} label="Recommendations" value={3} />
                        </div>

                        <div className="bg-white rounded-2xl p-8">
                            <h2 className="text-xl font-bold mb-4">Emotional Arc</h2>
                            <p className="text-gray-700 text-lg">
                                {insights?.emotionalArc || 'Strong opening → Sustained engagement → Clear resolution'}
                            </p>
                        </div>

                        {videoReferences && (
                            <div className="bg-white rounded-2xl p-8">
                                <h2 className="text-xl font-bold mb-6">Reference Videos</h2>
                                {videoReferences.map((v: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                                        <img src={v.thumbnail} alt={v.title} className="w-48 h-28 object-cover rounded" />
                                        <div>
                                            <h4 className="font-semibold mb-2">{v.title}</h4>
                                            <p className="text-sm text-gray-600">{v.why}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'narrative' && narrative && (
                    <div className="bg-white rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-8">Narrative Structure</h2>
                        {Object.entries(narrative).map(([key, value], i) => (
                            <div key={key} className="p-6 bg-blue-50 rounded-xl mb-4">
                                <h4 className="font-bold mb-2 capitalize">{key}</h4>
                                <p className="text-gray-700">{value as string}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'scenes' && sceneBreakdown && (
                    <div className="bg-white rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-8">Scene Breakdown</h2>
                        {sceneBreakdown.map((scene: any, i: number) => (
                            <div key={i} className="p-6 bg-gray-50 rounded-xl mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-mono text-blue-600">{scene.timestamp}</span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {scene.emotion}
                                    </span>
                                </div>
                                <p className="font-semibold mb-2">{scene.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'titles' && adTitles && (
                    <div className="bg-white rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-8">AI-Generated Titles</h2>
                        {adTitles.map((item: any, i: number) => (
                            <div key={i} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
                                        {item.score}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-white rounded-2xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}