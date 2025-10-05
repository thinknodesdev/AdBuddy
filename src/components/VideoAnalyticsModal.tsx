import React, { useState, useEffect } from 'react';
import { X, Play, Brain, Heart, Film, Music, TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface VideoAnalyticsModalProps {
    videoUrl: string;
    videoTitle: string;
    videoId?: string;
    onClose: () => void;
}

export function VideoAnalyticsModal({ videoUrl, videoTitle, videoId, onClose }: VideoAnalyticsModalProps) {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'narrative' | 'emotions' | 'scenes' | 'audio'>('narrative');

    useEffect(() => {
        analyzeVideo();
    }, [videoUrl]);

    const analyzeVideo = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/analyze-video-detailed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl, videoId })
            });

            const result = await response.json();
            setAnalysis(result.success ? result.data : result.fallback);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Video Analytics</h2>
                            <p className="text-sm text-gray-600">Powered by 12 Labs Pegasus</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Analyzing video with AI...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex">
                        {/* Video Player - Left Side */}
                        <div className="w-1/3 bg-black p-6 flex flex-col">
                            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg mb-4">
                                <iframe
                                    src={videoUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="text-white">
                                <h3 className="font-semibold mb-2">{videoTitle}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="ml-2">{analysis?.duration}s</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Scenes:</span>
                                        <span className="ml-2">{analysis?.scenes?.total_scenes || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Resolution:</span>
                                        <span className="ml-2">{analysis?.metadata?.resolution}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">FPS:</span>
                                        <span className="ml-2">{analysis?.metadata?.fps}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Panel - Right Side */}
                        <div className="flex-1 flex flex-col">
                            {/* Tabs */}
                            <div className="border-b bg-gray-50 px-6">
                                <div className="flex gap-1">
                                    {[
                                        { id: 'narrative', name: 'Narrative', icon: Film },
                                        { id: 'emotions', name: 'Emotions', icon: Heart },
                                        { id: 'scenes', name: 'Scenes', icon: Target },
                                        { id: 'audio', name: 'Audio', icon: Music }
                                    ].map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${activeTab === tab.id
                                                        ? 'border-purple-600 text-purple-600 bg-white'
                                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="font-medium">{tab.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'narrative' && <NarrativeTab data={analysis?.narrative} />}
                                {activeTab === 'emotions' && <EmotionsTab data={analysis?.emotions} />}
                                {activeTab === 'scenes' && <ScenesTab data={analysis?.scenes} />}
                                {activeTab === 'audio' && <AudioTab data={analysis?.audio} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Narrative Tab Component
function NarrativeTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500">No narrative data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Story Arc
                </h3>
                <p className="text-gray-800">{data.story_arc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Hook</div>
                    <div className="text-xs text-blue-600 mb-2">{data.hook?.timestamp}</div>
                    <p className="text-sm text-gray-700">{data.hook?.description}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="text-sm font-semibold text-green-900 mb-2">Call to Action</div>
                    <div className="text-xs text-green-600 mb-2">{data.call_to_action?.timestamp}</div>
                    <p className="text-sm text-gray-700">{data.call_to_action?.type}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${data.call_to_action?.clarity === 'high' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                        {data.call_to_action?.clarity} clarity
                    </span>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
                <h4 className="font-semibold mb-3">Value Proposition</h4>
                <p className="text-gray-800 text-lg">{data.value_proposition}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border">
                <h4 className="font-semibold mb-4">Brand Recall Moments</h4>
                <div className="space-y-2">
                    {data.brand_recall_moments?.map((moment: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="font-mono text-sm text-purple-600">{moment.timestamp}</span>
                            <span className="text-gray-700">{moment.element}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-yellow-900 mb-2">Messaging Consistency</div>
                <p className="text-gray-700">{data.messaging_consistency}</p>
            </div>
        </div>
    );
}

// Emotions Tab Component
function EmotionsTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500">No emotion data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Overall Emotional Profile</h3>
                    <div className="px-4 py-2 bg-white rounded-full border border-purple-300">
                        <span className="font-bold text-purple-600">{data.emotional_effectiveness}/100</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Overall Tone</div>
                        <div className="font-semibold text-gray-900 capitalize">{data.overall_tone}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Target Response</div>
                        <div className="font-semibold text-gray-900">{data.target_emotional_response}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="font-semibold">Emotion Timeline</h4>
                {data.emotion_timeline?.map((emotion: any, i: number) => (
                    <div key={i} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-sm text-blue-600">{emotion.timestamp}</span>
                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium capitalize">
                                {emotion.primary_emotion}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                        style={{ width: `${emotion.intensity}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{emotion.intensity}%</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {emotion.triggers?.map((trigger: string, j: number) => (
                                <span key={j} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {trigger}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Scenes Tab Component
function ScenesTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500">No scene data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{data.total_scenes}</div>
                        <div className="text-sm text-gray-600">Total Scenes</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600 capitalize">{data.scene_pacing}</div>
                        <div className="text-sm text-gray-600">Pacing</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600 capitalize">{data.visual_consistency}</div>
                        <div className="text-sm text-gray-600">Consistency</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {data.scenes?.map((scene: any, i: number) => (
                    <div key={i} className="bg-white border rounded-xl p-5 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="font-mono text-sm text-purple-600 mb-1">{scene.timestamp}</div>
                                <h4 className="font-semibold text-gray-900">{scene.description}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-green-600">{scene.effectiveness_score}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div>
                                <span className="text-gray-500">Duration:</span>
                                <span className="ml-2 font-medium">{scene.duration_seconds}s</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Camera:</span>
                                <span className="ml-2 font-medium">{scene.camera_work}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Brand Visibility:</span>
                                <span className={`ml-2 font-medium capitalize ${scene.brand_visibility === 'high' ? 'text-green-600' :
                                        scene.brand_visibility === 'medium' ? 'text-yellow-600' : 'text-gray-500'
                                    }`}>
                                    {scene.brand_visibility}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Color:</span>
                                <span className="ml-2 font-medium">{scene.color_palette}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {scene.visual_elements?.map((element: string, j: number) => (
                                <span key={j} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {element}
                                </span>
                            ))}
                        </div>

                        {scene.text_overlays && scene.text_overlays.length > 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="text-xs font-semibold text-yellow-900 mb-1">Text Overlays:</div>
                                {scene.text_overlays.map((text: string, j: number) => (
                                    <span key={j} className="inline-block px-2 py-1 bg-white rounded text-sm mr-2">
                                        "{text}"
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Audio Tab Component
function AudioTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500">No audio data available</div>;

    return (
        <div className="space-y-6">
            {data.voiceover?.present && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-600" />
                        Voiceover Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Tone</div>
                            <div className="font-semibold text-gray-900 capitalize">{data.voiceover.tone}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Gender</div>
                            <div className="font-semibold text-gray-900 capitalize">{data.voiceover.gender}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Language</div>
                            <div className="font-semibold text-gray-900">{data.voiceover.language}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Clarity</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${data.voiceover.clarity === 'high' ? 'bg-green-100 text-green-700' :
                                    data.voiceover.clarity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {data.voiceover.clarity}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-2">Key Phrases:</div>
                        <div className="flex flex-wrap gap-2">
                            {data.voiceover.key_phrases?.map((phrase: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm">
                                    "{phrase}"
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {data.music?.present && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4">Background Music</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Genre</div>
                            <div className="font-semibold text-gray-900 capitalize">{data.music.genre}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Mood</div>
                            <div className="font-semibold text-gray-900 capitalize">{data.music.mood}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Volume Level</div>
                            <div className="font-semibold text-gray-900 capitalize">{data.music.volume_level}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Effectiveness</div>
                            <div className="font-bold text-blue-600">{data.music.effectiveness}/100</div>
                        </div>
                    </div>
                </div>
            )}

            {data.sound_effects && data.sound_effects.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Sound Effects</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.sound_effects.map((effect: string, i: number) => (
                            <span key={i} className="px-3 py-2 bg-white border border-green-300 rounded-lg text-sm">
                                {effect}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-50 border rounded-xl p-6">
                <h4 className="font-semibold mb-3">Overall Audio Quality</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quality Level:</span>
                        <span className="font-semibold text-gray-900 capitalize">{data.audio_quality}</span>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-2">Brand Alignment:</div>
                        <p className="text-gray-800">{data.audio_brand_alignment}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}