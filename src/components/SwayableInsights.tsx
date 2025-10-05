import React, { useState } from 'react';
import { Brain, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';

export function SwayableInsights({ onBack }: { onBack: () => void }) {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const analyzeDemo = async (demoType: string) => {
        setLoading(true);

        // Map demo types to YouTube videos
        const demoVideos: Record<string, string> = {
            iphone: 'https://www.youtube.com/watch?v=IPHONE_AD_URL',
            patagonia: 'https://www.youtube.com/watch?v=PATAGONIA_URL',
            samsung: 'https://www.youtube.com/watch?v=SAMSUNG_URL'
        };

        try {
            const response = await fetch('http://localhost:5000/api/swayable/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoUrl: demoVideos[demoType],
                    videoTitle: `${demoType} Campaign`,
                    quantData: {
                        brandFavorability: 62,
                        purchaseIntent: 48,
                        audienceSegments: [
                            { segment: '18-24', favorability: 72, intent: 65 },
                            { segment: '25-34', favorability: 58, intent: 42 },
                            { segment: '35-44', favorability: 45, intent: 38 }
                        ]
                    },
                    qualFeedback: [
                        "The opening was confusing",
                        "Loved the product demo at 0:15",
                        "Not clear what makes it different",
                        "Too fast-paced for older audiences"
                    ],
                    brandObjective: 'purchase_intent'
                })
            });

            const result = await response.json();
            setRecommendations(result.data.recommendations);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <button onClick={onBack} className="mb-6 text-gray-600">← Back</button>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Brain className="w-12 h-12" />
                        <div>
                            <h1 className="text-3xl font-bold">Creative Intelligence Lab</h1>
                            <p className="text-purple-100">Powered by 12 Labs Video Understanding</p>
                        </div>
                    </div>
                </div>

                {/* Demo Experiments */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {['iphone', 'patagonia', 'samsung'].map(demo => (
                        <button
                            key={demo}
                            onClick={() => analyzeDemo(demo)}
                            className="p-6 bg-white rounded-xl border-2 hover:border-blue-500 transition"
                        >
                            <h3 className="font-bold text-lg capitalize mb-2">{demo} Campaign</h3>
                            <p className="text-sm text-gray-600">Analyze with 12 Labs AI</p>
                        </button>
                    ))}
                </div>

                {/* Recommendations */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600">Analyzing video with 12 Labs...</p>
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-6">Creative Recommendations</h2>
                        {recommendations.map((rec, i) => (
                            <RecommendationCard key={i} recommendation={rec} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RecommendationCard({ recommendation, index }: any) {
    const priorityColors = {
        high: 'border-red-500 bg-red-50',
        medium: 'border-yellow-500 bg-yellow-50',
        low: 'border-green-500 bg-green-50'
    };

    return (
        <div className={`p-6 rounded-xl border-2 ${priorityColors[recommendation.priority]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{recommendation.element}</h3>
                        {recommendation.timestamp && (
                            <p className="text-sm text-gray-600">{recommendation.timestamp}</p>
                        )}
                    </div>
                </div>
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium capitalize">
                    {recommendation.priority} Priority
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="font-semibold text-sm text-gray-700 mb-1">Insight:</p>
                    <p className="text-gray-900">{recommendation.insight}</p>
                </div>

                <div>
                    <p className="font-semibold text-sm text-gray-700 mb-1">Recommendation:</p>
                    <p className="text-gray-900">{recommendation.recommendation}</p>
                </div>

                <div className="flex gap-6 text-sm">
                    <div>
                        <span className="font-semibold">Audience:</span> {recommendation.audienceSegment}
                    </div>
                    <div>
                        <span className="font-semibold">Mentioned by:</span> {recommendation.supportingData?.qualMention || 0} respondents
                    </div>
                </div>
            </div>
        </div>
    );
}