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
                {/* Header - LARGER */}
                <div className="flex items-center justify-between p-8 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Video Analytics</h2>
                            <p className="text-base text-gray-600 mt-1">Powered by 12 Labs Pegasus</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                    >
                        <X className="w-7 h-7 text-gray-600" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-xl text-gray-600 font-medium">Analyzing video with AI...</p>
                            <p className="text-base text-gray-500 mt-3">This may take 30-60 seconds</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex">
                        {/* Video Player - Left Side */}
                        <div className="w-1/3 bg-black p-6 flex flex-col">
                            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg mb-6">
                                <iframe
                                    src={videoUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="text-white">
                                <h3 className="font-semibold text-lg mb-3">{videoTitle}</h3>
                                <div className="grid grid-cols-2 gap-3 text-base">
                                    <div>
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="ml-2 font-medium">{analysis?.duration}s</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Scenes:</span>
                                        <span className="ml-2 font-medium">{analysis?.scenes?.total_scenes || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Resolution:</span>
                                        <span className="ml-2 font-medium">{analysis?.metadata?.resolution}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">FPS:</span>
                                        <span className="ml-2 font-medium">{analysis?.metadata?.fps}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Panel - Right Side */}
                        <div className="flex-1 flex flex-col">
                            {/* Tabs - LARGER */}
                            <div className="border-b bg-gray-50 px-6">
                                <div className="flex gap-2">
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
                                                className={`flex items-center gap-3 px-6 py-4 border-b-2 transition text-base ${activeTab === tab.id
                                                    ? 'border-purple-600 text-purple-600 bg-white'
                                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-semibold">{tab.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-8">
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

// Narrative Tab - LARGER FONTS
function NarrativeTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500 text-lg">No narrative data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
                <h3 className="font-bold text-2xl mb-4 flex items-center gap-3">
                    <Zap className="w-7 h-7 text-purple-600" />
                    Story Arc
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed">{data.story_arc}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-base font-semibold text-blue-900 mb-3">Hook</div>
                    <div className="text-sm text-blue-600 mb-3">{data.hook?.timestamp}</div>
                    <p className="text-base text-gray-700 leading-relaxed">{data.hook?.description}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="text-base font-semibold text-green-900 mb-3">Call to Action</div>
                    <div className="text-sm text-green-600 mb-3">{data.call_to_action?.timestamp}</div>
                    <p className="text-base text-gray-700 leading-relaxed">{data.call_to_action?.type}</p>
                    <span className={`inline-block mt-3 px-3 py-1.5 rounded text-sm font-medium ${data.call_to_action?.clarity === 'high' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                        {data.call_to_action?.clarity} clarity
                    </span>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border">
                <h4 className="font-semibold text-xl mb-4">Value Proposition</h4>
                <p className="text-gray-800 text-xl leading-relaxed">{data.value_proposition}</p>
            </div>

            <div className="bg-white rounded-xl p-8 border">
                <h4 className="font-semibold text-xl mb-5">Brand Recall Moments</h4>
                <div className="space-y-3">
                    {data.brand_recall_moments?.map((moment: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                            <span className="font-mono text-base text-purple-600 font-medium">{moment.timestamp}</span>
                            <span className="text-gray-700 text-base">{moment.element}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="text-base font-semibold text-yellow-900 mb-3">Messaging Consistency</div>
                <p className="text-gray-700 text-base leading-relaxed">{data.messaging_consistency}</p>
            </div>
        </div>
    );
}

// Emotions Tab - LARGER FONTS
function EmotionsTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500 text-lg">No emotion data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl">Overall Emotional Profile</h3>
                    <div className="px-6 py-3 bg-white rounded-full border border-purple-300">
                        <span className="font-bold text-purple-600 text-xl">{data.emotional_effectiveness}/100</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="text-base text-gray-600 mb-2">Overall Tone</div>
                        <div className="font-semibold text-gray-900 capitalize text-lg">{data.overall_tone}</div>
                    </div>
                    <div>
                        <div className="text-base text-gray-600 mb-2">Target Response</div>
                        <div className="font-semibold text-gray-900 text-lg">{data.target_emotional_response}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-xl">Emotion Timeline</h4>
                {data.emotion_timeline?.map((emotion: any, i: number) => (
                    <div key={i} className="bg-white border rounded-xl p-6 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-base text-blue-600 font-medium">{emotion.timestamp}</span>
                            <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-base font-medium capitalize">
                                {emotion.primary_emotion}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                        style={{ width: `${emotion.intensity}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-base font-semibold text-gray-700">{emotion.intensity}%</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {emotion.triggers?.map((trigger: string, j: number) => (
                                <span key={j} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm">
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

// Scenes Tab - LARGER FONTS
function ScenesTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500 text-lg">No scene data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold text-blue-600">{data.total_scenes}</div>
                        <div className="text-base text-gray-600 mt-1">Total Scenes</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600 capitalize">{data.scene_pacing}</div>
                        <div className="text-base text-gray-600 mt-1">Pacing</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600 capitalize">{data.visual_consistency}</div>
                        <div className="text-base text-gray-600 mt-1">Consistency</div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {data.scenes?.map((scene: any, i: number) => (
                    <div key={i} className="bg-white border rounded-xl p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="font-mono text-base text-purple-600 mb-2 font-medium">{scene.timestamp}</div>
                                <h4 className="font-semibold text-gray-900 text-lg">{scene.description}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-600 text-lg">{scene.effectiveness_score}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-base">
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

                        <div className="flex flex-wrap gap-2 mb-3">
                            {scene.visual_elements?.map((element: string, j: number) => (
                                <span key={j} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                    {element}
                                </span>
                            ))}
                        </div>

                        {scene.text_overlays && scene.text_overlays.length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="text-sm font-semibold text-yellow-900 mb-2">Text Overlays:</div>
                                {scene.text_overlays.map((text: string, j: number) => (
                                    <span key={j} className="inline-block px-3 py-1.5 bg-white rounded text-base mr-2 mb-2">
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

// Audio Tab - LARGER FONTS
function AudioTab({ data }: { data: any }) {
    if (!data) return <div className="text-gray-500 text-lg">No audio data available</div>;

    return (
        <div className="space-y-6">
            {data.voiceover?.present && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
                    <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                        <Music className="w-7 h-7 text-purple-600" />
                        Voiceover Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="text-base text-gray-600 mb-2">Tone</div>
                            <div className="font-semibold text-gray-900 capitalize text-lg">{data.voiceover.tone}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Gender</div>
                            <div className="font-semibold text-gray-900 capitalize text-lg">{data.voiceover.gender}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Language</div>
                            <div className="font-semibold text-gray-900 text-lg">{data.voiceover.language}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Clarity</div>
                            <span className={`inline-block px-4 py-2 rounded-full text-base font-medium ${data.voiceover.clarity === 'high' ? 'bg-green-100 text-green-700' :
                                data.voiceover.clarity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {data.voiceover.clarity}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-base text-gray-600 mb-3">Key Phrases:</div>
                        <div className="flex flex-wrap gap-2">
                            {data.voiceover.key_phrases?.map((phrase: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-white border rounded-full text-base">
                                    "{phrase}"
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {data.music?.present && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
                    <h3 className="font-bold text-2xl mb-6">Background Music</h3>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="text-base text-gray-600 mb-2">Genre</div>
                            <div className="font-semibold text-gray-900 capitalize text-lg">{data.music.genre}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Mood</div>
                            <div className="font-semibold text-gray-900 capitalize text-lg">{data.music.mood}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Volume Level</div>
                            <div className="font-semibold text-gray-900 capitalize text-lg">{data.music.volume_level}</div>
                        </div>
                        <div>
                            <div className="text-base text-gray-600 mb-2">Effectiveness</div>
                            <div className="font-bold text-blue-600 text-xl">{data.music.effectiveness}/100</div>
                        </div>
                    </div>
                </div>
            )}

            {data.sound_effects && data.sound_effects.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                    <h4 className="font-semibold text-xl mb-4">Sound Effects</h4>
                    <div className="flex flex-wrap gap-3">
                        {data.sound_effects.map((effect: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-white border border-green-300 rounded-lg text-base">
                                {effect}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-50 border rounded-xl p-8">
                <h4 className="font-semibold text-xl mb-5">Overall Audio Quality</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-base">
                        <span className="text-gray-600">Quality Level:</span>
                        <span className="font-semibold text-gray-900 capitalize text-lg">{data.audio_quality}</span>
                    </div>
                    <div>
                        <div className="text-base text-gray-600 mb-2">Brand Alignment:</div>
                        <p className="text-gray-800 text-base leading-relaxed">{data.audio_brand_alignment}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}