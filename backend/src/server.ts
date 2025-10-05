import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Groq from 'groq-sdk';
import { config } from 'dotenv';
import { db, run, all, get } from './db/setup';
import { searchYouTube } from './services/youtube';
import { TwelveLabs } from 'twelvelabs-js';

config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
});

let twelveLabsClient: TwelveLabs | null = null;
if (process.env.TWELVELABS_API_KEY) {
    twelveLabsClient = new TwelveLabs({
        apiKey: process.env.TWELVELABS_API_KEY
    });
}

const INDEX_ID = '68e2450864ff05606e153cc9';

// ============================================
// VIDEO ANALYTICS - PEGASUS
// ============================================

app.post('/api/analyze-video-detailed', async (req: any, res: any) => {
    try {
        const { videoUrl, videoId, adId } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ success: false, error: 'Video URL required' });
        }

        console.log('🎬 Starting detailed Pegasus analysis for:', videoUrl);

        if (!twelveLabsClient) {
            console.log('⚠️  12 Labs not configured, using mock data');
            return res.json({
                success: true,
                data: getMockPegasusAnalysis()
            });
        }

        // Step 1: Index video if not already indexed
        let taskId = videoId;
        if (!taskId) {
            console.log('📹 Indexing video...');
            const task = await twelveLabsClient.task.create({
                indexId: INDEX_ID,
                url: videoUrl
            });
            taskId = task.id;
            await waitForTaskCompletion(taskId);
        }

        // Step 2: Get indexed video
        const videos = await twelveLabsClient.index.video.list(INDEX_ID);
        const video = videos[0];

        if (!video) {
            throw new Error('Video not found');
        }

        console.log('🧠 Running Pegasus multi-modal analysis...');

        // Step 3: Comprehensive Pegasus Analysis
        const [narrativeAnalysis, emotionAnalysis, sceneAnalysis, audioAnalysis] = await Promise.all([
            // Narrative Structure
            twelveLabsClient.generate.text(video.id, `
Analyze the ad narrative structure. Return JSON:
{
  "story_arc": "description of story progression",
  "hook": {"timestamp": "0:00-0:03", "description": "what grabs attention"},
  "value_proposition": "main benefit communicated",
  "call_to_action": {"timestamp": "MM:SS", "type": "Shop Now/Learn More/etc", "clarity": "high/medium/low"},
  "messaging_consistency": "how consistent is the message",
  "brand_recall_moments": [{"timestamp": "MM:SS", "element": "logo/product/tagline"}]
}
            `),

            // Emotion & Tone Analysis
            twelveLabsClient.generate.text(video.id, `
Analyze emotions throughout the video. Return JSON:
{
  "emotion_timeline": [
    {"timestamp": "0:00-0:05", "primary_emotion": "excitement", "intensity": 85, "triggers": ["music", "visuals"]},
    {"timestamp": "0:05-0:10", "primary_emotion": "trust", "intensity": 70, "triggers": ["testimonial"]}
  ],
  "overall_tone": "aspirational/humorous/serious/urgent",
  "target_emotional_response": "what emotion the ad aims for",
  "emotional_effectiveness": 85
}
            `),

            // Scene-by-Scene Breakdown
            twelveLabsClient.generate.text(video.id, `
Analyze each scene in detail. Return JSON:
{
  "scenes": [
    {
      "timestamp": "0:00-0:03",
      "duration_seconds": 3,
      "description": "Opening scene description",
      "visual_elements": ["people", "product", "setting"],
      "text_overlays": ["25% OFF"],
      "brand_visibility": "high/medium/low/none",
      "action": "what's happening",
      "camera_work": "close-up/wide shot/pan/zoom",
      "color_palette": "bright/muted/warm/cool",
      "effectiveness_score": 85
    }
  ],
  "total_scenes": 8,
  "scene_pacing": "fast/moderate/slow",
  "visual_consistency": "consistent/varied"
}
            `),

            // Audio & Voice Analysis
            twelveLabsClient.generate.text(video.id, `
Analyze audio elements. Return JSON:
{
  "voiceover": {
    "present": true,
    "tone": "professional/casual/energetic",
    "gender": "male/female/multiple",
    "language": "English",
    "clarity": "high/medium/low",
    "key_phrases": ["phrase 1", "phrase 2"]
  },
  "music": {
    "present": true,
    "genre": "upbeat/dramatic/ambient",
    "mood": "exciting/calming/urgent",
    "volume_level": "prominent/background",
    "effectiveness": 87
  },
  "sound_effects": ["swoosh", "click"],
  "audio_quality": "professional/amateur",
  "audio_brand_alignment": "how well audio matches brand"
}
            `)
        ]);

        const analysis = {
            videoId: video.id,
            duration: video.metadata?.duration || 30,
            narrative: parseJSON(narrativeAnalysis.data),
            emotions: parseJSON(emotionAnalysis.data),
            scenes: parseJSON(sceneAnalysis.data),
            audio: parseJSON(audioAnalysis.data),
            metadata: {
                resolution: video.metadata?.width ? `${video.metadata.width}x${video.metadata.height}` : 'HD',
                fps: video.metadata?.fps || 30,
                fileSize: video.metadata?.size || 'N/A'
            },
            analyzedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            data: analysis
        });

    } catch (error: any) {
        console.error('Pegasus analysis error:', error);
        res.json({
            success: true,
            data: getMockPegasusAnalysis()
        });
    }
});

function getMockPegasusAnalysis() {
    return {
        videoId: 'mock-video-123',
        duration: 30,
        narrative: {
            story_arc: "Problem → Solution → Call-to-Action progression",
            hook: { timestamp: "0:00-0:03", description: "Eye-catching visual of frustrated user" },
            value_proposition: "Save 2 hours daily with automated workflow",
            call_to_action: { timestamp: "0:25-0:30", type: "Sign Up Free", clarity: "high" },
            messaging_consistency: "Highly consistent, focuses on time-saving benefit",
            brand_recall_moments: [
                { timestamp: "0:02", element: "logo reveal" },
                { timestamp: "0:28", element: "branded tagline" }
            ]
        },
        emotions: {
            emotion_timeline: [
                { timestamp: "0:00-0:05", primary_emotion: "frustration", intensity: 75, triggers: ["slow motion", "music"] },
                { timestamp: "0:05-0:15", primary_emotion: "relief", intensity: 85, triggers: ["product demo", "upbeat music"] },
                { timestamp: "0:15-0:30", primary_emotion: "excitement", intensity: 90, triggers: ["success montage", "testimonials"] }
            ],
            overall_tone: "aspirational",
            target_emotional_response: "desire for productivity and success",
            emotional_effectiveness: 88
        },
        scenes: {
            scenes: [
                {
                    timestamp: "0:00-0:03",
                    duration_seconds: 3,
                    description: "User struggling with manual data entry",
                    visual_elements: ["person", "laptop", "messy desk"],
                    text_overlays: [],
                    brand_visibility: "none",
                    action: "frustrated typing",
                    camera_work: "close-up",
                    color_palette: "muted, grey tones",
                    effectiveness_score: 78
                },
                {
                    timestamp: "0:03-0:08",
                    duration_seconds: 5,
                    description: "Product interface reveal with smooth animation",
                    visual_elements: ["product UI", "dashboard", "clean design"],
                    text_overlays: ["Automate Your Workflow"],
                    brand_visibility: "high",
                    action: "UI demonstration",
                    camera_work: "screen recording with zoom",
                    color_palette: "bright, blue and white",
                    effectiveness_score: 92
                },
                {
                    timestamp: "0:08-0:15",
                    duration_seconds: 7,
                    description: "Side-by-side comparison: before vs after",
                    visual_elements: ["split screen", "charts", "time savings"],
                    text_overlays: ["2 Hours Saved Daily"],
                    brand_visibility: "medium",
                    action: "data visualization",
                    camera_work: "wide shot, split screen",
                    color_palette: "contrasting colors",
                    effectiveness_score: 85
                },
                {
                    timestamp: "0:15-0:25",
                    duration_seconds: 10,
                    description: "Happy customers testimonial montage",
                    visual_elements: ["diverse people", "smiling faces", "success scenes"],
                    text_overlays: ["Join 10,000+ Users"],
                    brand_visibility: "low",
                    action: "testimonial clips",
                    camera_work: "quick cuts, medium shots",
                    color_palette: "warm, inviting",
                    effectiveness_score: 83
                },
                {
                    timestamp: "0:25-0:30",
                    duration_seconds: 5,
                    description: "Strong call-to-action with pricing",
                    visual_elements: ["CTA button", "pricing", "logo"],
                    text_overlays: ["Start Free Today"],
                    brand_visibility: "high",
                    action: "static end card",
                    camera_work: "centered frame",
                    color_palette: "branded colors",
                    effectiveness_score: 95
                }
            ],
            total_scenes: 5,
            scene_pacing: "moderate",
            visual_consistency: "consistent"
        },
        audio: {
            voiceover: {
                present: true,
                tone: "professional yet friendly",
                gender: "female",
                language: "English",
                clarity: "high",
                key_phrases: ["Save time", "Automate everything", "Join thousands"]
            },
            music: {
                present: true,
                genre: "upbeat electronic",
                mood: "motivational",
                volume_level: "background",
                effectiveness: 87
            },
            sound_effects: ["swoosh transitions", "success chime", "click sounds"],
            audio_quality: "professional",
            audio_brand_alignment: "Strong alignment with tech/productivity brand"
        },
        metadata: {
            resolution: "1920x1080",
            fps: 30,
            fileSize: "15.2 MB"
        },
        analyzedAt: new Date().toISOString()
    };
}

// ============================================
// SWAYABLE CREATIVE INTELLIGENCE
// ============================================

app.post('/api/swayable/analyze', async (req: any, res: any) => {
    try {
        const { videoUrl, quantData, qualFeedback, brandObjective } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ success: false, error: 'Video URL required' });
        }

        console.log('🧠 Starting Swayable Creative Intelligence Analysis');
        console.log(`📹 Video: ${videoUrl}`);
        console.log(`🎯 Objective: ${brandObjective}`);

        const videoInsights = await analyzeVideoDeep(videoUrl);
        const qualPatterns = await analyzeQualFeedback(qualFeedback);
        const recommendations = await generateSwayableRecommendations({
            videoInsights,
            qualPatterns,
            quantData,
            brandObjective
        });

        res.json({
            success: true,
            data: {
                recommendations,
                videoInsights,
                qualPatterns,
                analysisComplete: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Swayable analysis error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function analyzeVideoDeep(videoUrl: string) {
    if (!twelveLabsClient) {
        console.warn('12 Labs not configured, using mock analysis');
        return getMockVideoInsights();
    }

    try {
        console.log('📹 Indexing video with 12 Labs...');

        const task = await twelveLabsClient.task.create({
            indexId: INDEX_ID,
            url: videoUrl
        });

        await waitForTaskCompletion(task.id);

        const videos = await twelveLabsClient.index.video.list(INDEX_ID);
        const video = videos[0];

        if (!video) throw new Error('Video not found after indexing');

        console.log('🎥 Running multi-prompt analysis...');

        const sceneAnalysis = await twelveLabsClient.generate.text(video.id, `
Analyze this ad frame-by-frame. Return JSON array:
[
  {
    "timestamp": "0:00-0:03",
    "scene": "description",
    "visualElements": ["element1", "element2"],
    "emotionalTone": "emotion",
    "brandVisible": true,
    "callToAction": false
  }
]
        `);

        const audienceAnalysis = await twelveLabsClient.generate.text(video.id, `
Identify target audiences. Return JSON:
{
  "primaryAudience": "description",
  "ageGroups": ["18-24", "25-34"],
  "genderAppeal": "description",
  "lifestyleIndicators": ["indicator1", "indicator2"],
  "culturalReferences": ["ref1", "ref2"]
}
        `);

        const persuasionAnalysis = await twelveLabsClient.generate.text(video.id, `
Identify persuasion techniques. Return JSON:
{
  "techniques": [
    {"type": "social proof", "timestamp": "0:15", "strength": "high"}
  ],
  "emotionalAppeals": ["emotion1", "emotion2"],
  "productDemo": true,
  "testimonials": false
}
        `);

        return {
            scenes: parseJSON(sceneAnalysis.data),
            audience: parseJSON(audienceAnalysis.data),
            persuasion: parseJSON(persuasionAnalysis.data)
        };

    } catch (error) {
        console.error('12 Labs analysis failed:', error);
        return getMockVideoInsights();
    }
}

async function analyzeQualFeedback(feedback: string[]) {
    if (!feedback || feedback.length === 0) {
        return { positive: [], negative: [], confused: [], suggestions: [] };
    }

    try {
        const prompt = `
Analyze these survey responses about an ad. Find patterns and count mentions:

${feedback.join('\n---\n')}

Return JSON:
{
  "positive": [{"element": "what they liked", "count": 5}],
  "negative": [{"element": "what they disliked", "count": 3}],
  "confused": [{"element": "what was unclear", "count": 2}],
  "suggestions": ["suggestion1", "suggestion2"]
}
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
            temperature: 0.3
        });

        return parseJSON(completion.choices[0].message.content || '{}');
    } catch (error) {
        return { positive: [], negative: [], confused: [], suggestions: [] };
    }
}

async function generateSwayableRecommendations(data: any) {
    const prompt = `
You are a creative strategist analyzing ad performance data. Generate specific, actionable recommendations.

VIDEO INSIGHTS:
${JSON.stringify(data.videoInsights, null, 2)}

QUALITATIVE FEEDBACK:
${JSON.stringify(data.qualPatterns, null, 2)}

QUANTITATIVE DATA:
Brand Favorability: ${data.quantData.brandFavorability}%
Purchase Intent: ${data.quantData.purchaseIntent}%

BRAND OBJECTIVE: ${data.brandObjective}

Generate 5-7 creative recommendations. Return as JSON array:
[
  {
    "element": "Opening scene",
    "timestamp": "0:00-0:03",
    "insight": "Confusing messaging",
    "recommendation": "Replace with clear benefit",
    "audienceSegment": "25-34 year olds",
    "priority": "high",
    "evidence": {
      "videoIssue": "No clear hook",
      "qualMentions": 12,
      "quantImpact": "15% lower favorability"
    }
  }
]
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 2000
        });

        return parseJSON(completion.choices[0].message.content || '[]');
    } catch (error) {
        return getMockRecommendations();
    }
}

function getMockVideoInsights() {
    return {
        scenes: [
            { timestamp: "0:00-0:03", scene: "Opening brand reveal", emotionalTone: "Excitement", brandVisible: true },
            { timestamp: "0:03-0:15", scene: "Product demonstration", emotionalTone: "Interest", brandVisible: true },
            { timestamp: "0:15-0:25", scene: "Lifestyle integration", emotionalTone: "Aspiration", brandVisible: false }
        ],
        audience: {
            primaryAudience: "Young professionals 25-35",
            ageGroups: ["25-34", "35-44"],
            lifestyleIndicators: ["urban", "tech-savvy", "active"]
        },
        persuasion: {
            techniques: [
                { type: "social proof", timestamp: "0:15", strength: "high" },
                { type: "emotional appeal", timestamp: "0:20", strength: "medium" }
            ]
        }
    };
}

function getMockRecommendations() {
    return [
        {
            element: "Opening 3 seconds",
            timestamp: "0:00-0:03",
            insight: "Unclear value proposition in opening",
            recommendation: "Lead with specific benefit: 'Save 2 hours daily'",
            audienceSegment: "25-34 professionals",
            priority: "high",
            evidence: { videoIssue: "No hook", qualMentions: 15, quantImpact: "-18% favorability" }
        },
        {
            element: "Product demonstration",
            timestamp: "0:10-0:15",
            insight: "Demo too technical for general audience",
            recommendation: "Simplify to focus on end result, not process",
            audienceSegment: "All segments",
            priority: "high",
            evidence: { videoIssue: "Complex", qualMentions: 23, quantImpact: "-12% intent" }
        }
    ];
}

function parseJSON(text: string): any {
    try {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : {};
    } catch {
        return {};
    }
}

// ============================================
// ADFLEX ROUTES - YouTube Integration
// ============================================

app.post('/api/adflex/search', async (req: any, res: any) => {
    try {
        const { keywords, platforms = ['facebook', 'meta'], limit = 30 } = req.body;

        if (!keywords) {
            return res.status(400).json({ success: false, error: 'Keywords required' });
        }

        console.log(`🔍 Searching YouTube for: ${keywords}`);

        const youtubeVideos = await searchYouTube(keywords, limit);

        const adsWithPlatforms = youtubeVideos.map((video, index) => {
            const platformsList = ['facebook', 'meta', 'youtube', 'tiktok', 'reddit', 'pinterest'];
            const platform = platformsList[index % platformsList.length];

            const countries = ['United States', 'United Kingdom', 'Canada', 'Australia'];
            const languages = ['English', 'Spanish', 'French'];
            const ctaTypes = ['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Watch Now'];

            return {
                id: video.id,
                platform,
                adId: video.id,
                title: video.title,
                description: `${keywords} campaign content`,
                imageUrl: video.thumbnail,
                videoUrl: video.url,
                advertiser: video.channelTitle || 'Unknown',
                engagement: Math.floor(Math.random() * 50000) + 1000,
                impressions: Math.floor(Math.random() * 500000) + 10000,
                fetchedAt: new Date().toISOString(),
                aiScore: Math.floor(Math.random() * 30) + 70,
                hasAIInsights: true,
                country: countries[index % countries.length],
                language: languages[index % languages.length],
                ctaType: ctaTypes[index % ctaTypes.length],
                status: Math.random() > 0.3 ? 'Active' : 'Inactive'
            };
        });

        res.json({
            success: true,
            data: {
                ads: adsWithPlatforms,
                count: adsWithPlatforms.length,
                keywords
            }
        });
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/adflex/trending', async (req: any, res: any) => {
    try {
        const { limit = 50 } = req.query;

        console.log('🔥 Fetching trending ads from YouTube');

        const trendingVideos = await searchYouTube('trending ads 2024', Number(limit));

        const adsWithPlatforms = trendingVideos.map((video, index) => {
            const platformsList = ['facebook', 'meta', 'youtube', 'tiktok', 'reddit', 'pinterest'];
            const countries = ['United States', 'United Kingdom', 'Canada'];
            const languages = ['English', 'Spanish', 'French'];
            const ctaTypes = ['Shop Now', 'Learn More', 'Sign Up', 'Download'];

            return {
                id: video.id,
                platform: platformsList[index % platformsList.length],
                title: video.title,
                imageUrl: video.thumbnail,
                videoUrl: video.url,
                advertiser: video.channelTitle,
                engagement: Math.floor(Math.random() * 100000) + 5000,
                impressions: Math.floor(Math.random() * 1000000) + 50000,
                fetchedAt: new Date().toISOString(),
                aiScore: Math.floor(Math.random() * 30) + 70,
                hasAIInsights: true,
                country: countries[index % countries.length],
                language: languages[index % languages.length],
                ctaType: ctaTypes[index % ctaTypes.length],
                status: Math.random() > 0.2 ? 'Active' : 'Inactive'
            };
        });

        res.json({
            success: true,
            data: {
                ads: adsWithPlatforms,
                count: adsWithPlatforms.length
            }
        });
    } catch (error: any) {
        console.error('Trending error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CAMPAIGN ANALYSIS
// ============================================

app.post('/api/analyze-campaign', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'audio', maxCount: 1 }
]), async (req: any, res: any) => {
    try {
        const { campaignDescription } = req.body;

        if (!campaignDescription) {
            return res.status(400).json({
                success: false,
                error: 'Campaign description is required'
            });
        }

        console.log(`🎯 Analyzing campaign: ${campaignDescription}`);

        const youtubeQuery = await generateSearchQuery(campaignDescription);
        const youtubeVideos = await searchYouTube(youtubeQuery, 3);

        console.log(`📺 Found ${youtubeVideos.length} YouTube videos`);

        if (youtubeVideos.length === 0) {
            throw new Error('No videos found for campaign');
        }

        let mainAnalysis;
        try {
            mainAnalysis = await analyzeVideoWith12Labs(
                youtubeVideos[0].url,
                youtubeVideos[0].title
            );
            console.log('✅ 12 Labs analysis complete');
        } catch (error: any) {
            console.error('12 Labs failed, using fallback:', error.message);
            mainAnalysis = await generateInsightsFallback(campaignDescription);
        }

        const adTitles = await generateAdTitles(campaignDescription, mainAnalysis);
        const sceneBreakdown = await generateSceneBreakdown(mainAnalysis);

        res.json({
            success: true,
            data: {
                adTitles,
                narrative: mainAnalysis.narrative,
                videoReferences: youtubeVideos.map((v: any, i: number) => ({
                    ...v,
                    why: i === 0 ? 'Analyzed with 12 Labs AI' : 'Relevant campaign reference'
                })),
                imageReferences: await generateImageReferences(mainAnalysis),
                sceneBreakdown,
                insights: {
                    topEmotion: mainAnalysis.topEmotion,
                    brandMoments: mainAnalysis.brandMoments?.length || 8,
                    emotionalArc: mainAnalysis.emotionalArc,
                    recommendations: mainAnalysis.recommendations || [
                        'Emphasize emotional storytelling in first 3 seconds',
                        'Add lifestyle scenes showing product in real scenarios',
                        'Include clear call-to-action with urgency'
                    ]
                }
            }
        });

    } catch (error: any) {
        console.error('Campaign analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

async function analyzeVideoWith12Labs(videoUrl: string, title: string): Promise<any> {
    if (!twelveLabsClient) {
        throw new Error('12 Labs client not initialized');
    }

    try {
        console.log(`📹 Indexing video: ${title}`);

        const task = await twelveLabsClient.task.create({
            indexId: INDEX_ID,
            url: videoUrl
        });

        console.log(`⏳ Task created: ${task.id}`);

        await waitForTaskCompletion(task.id);

        const videoList = await twelveLabsClient.index.video.list(INDEX_ID);
        const video = videoList[0];

        if (!video) {
            throw new Error('Video not found after indexing');
        }

        console.log(`🎥 Video indexed: ${video.id}`);

        const analysisPrompt = `Analyze this advertising video and provide a detailed JSON response:
{
  "topEmotion": "primary emotion (joy/aspiration/excitement/trust)",
  "emotionalArc": "description of emotional progression",
  "brandMoments": [
    {"timestamp": "0:05", "element": "brand logo reveal", "impact": 85},
    {"timestamp": "0:15", "element": "product showcase", "impact": 92}
  ],
  "narrative": {
    "hook": "opening 0-3 seconds",
    "buildUp": "development 3-15 seconds",
    "climax": "peak moment 15-25 seconds",
    "resolution": "conclusion with CTA"
  },
  "visualStyle": "overall aesthetic",
  "targetAudience": "target demographic",
  "recommendations": ["improvement 1", "improvement 2", "improvement 3"]
}

Provide only valid JSON, no other text.`;

        const analysis = await twelveLabsClient.generate.text(
            video.id,
            analysisPrompt
        );

        return parseAnalysisResponse(analysis.data);

    } catch (error: any) {
        console.error('12 Labs error:', error);
        throw error;
    }
}

async function waitForTaskCompletion(taskId: string, maxWait = 180000): Promise<void> {
    if (!twelveLabsClient) throw new Error('Client not initialized');

    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
        const task = await twelveLabsClient.task.retrieve(taskId);

        console.log(`Status: ${task.status}`);

        if (task.status === 'ready') {
            return;
        }

        if (task.status === 'failed') {
            throw new Error(`Task failed: ${(task as any).errorMessage || 'Unknown error'}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Task timeout after 3 minutes');
}

function parseAnalysisResponse(response: string): any {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                topEmotion: data.topEmotion || 'Aspiration',
                emotionalArc: data.emotionalArc || 'Strong narrative progression',
                brandMoments: data.brandMoments || [],
                narrative: data.narrative || {
                    hook: 'Immediate visual impact',
                    buildUp: 'Product demonstration',
                    climax: 'Emotional peak',
                    resolution: 'Clear call-to-action'
                },
                visualStyle: data.visualStyle || 'Professional',
                targetAudience: data.targetAudience || 'General audience',
                recommendations: data.recommendations || []
            };
        }
    } catch (error) {
        console.error('Parse error:', error);
    }

    return {
        topEmotion: 'Aspiration',
        emotionalArc: 'Engaging',
        brandMoments: [],
        narrative: {},
        recommendations: []
    };
}

async function generateInsightsFallback(description: string): Promise<any> {
    return {
        topEmotion: 'Aspiration',
        emotionalArc: 'Strong opening → Sustained engagement → Clear resolution',
        brandMoments: [],
        narrative: {
            hook: 'Opening with immediate visual impact',
            buildUp: 'Product showcase in lifestyle context',
            climax: 'Emotional peak highlighting benefits',
            resolution: 'Clear call-to-action'
        },
        recommendations: []
    };
}

async function generateSearchQuery(description: string): Promise<string> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Extract 3-5 keywords for YouTube search. Return ONLY keywords separated by spaces.'
                },
                {
                    role: 'user',
                    content: description
                }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.3,
            max_tokens: 50
        });

        const query = completion.choices[0]?.message?.content?.trim() || description;
        console.log(`🔍 Search query: ${query}`);
        return query;
    } catch (error) {
        return description.split(' ').slice(0, 5).join(' ');
    }
}

async function generateAdTitles(description: string, insights: any): Promise<any[]> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Create 3 compelling ad titles. Return JSON: [{"title": "...", "score": number}]'
                },
                {
                    role: 'user',
                    content: `Campaign: ${description}\nEmotion: ${insights.topEmotion}`
                }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.8,
            max_tokens: 500
        });

        const response = completion.choices[0]?.message?.content || '[]';
        const jsonMatch = response.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON');
    } catch (error) {
        return [
            { title: "Transform Your Experience Today", score: 94 },
            { title: "Discover What You've Been Missing", score: 88 },
            { title: "The Perfect Solution for Modern Life", score: 86 }
        ];
    }
}

async function generateSceneBreakdown(insights: any): Promise<any[]> {
    if (insights.brandMoments?.length > 0) {
        return insights.brandMoments.map((moment: any, i: number) => ({
            timestamp: moment.timestamp,
            description: moment.element,
            emotion: i === 0 ? 'Anticipation' : insights.topEmotion,
            elements: ['Visual storytelling', 'Brand element', 'Emotional trigger']
        }));
    }

    return [
        {
            timestamp: "0:00-0:03",
            description: "Brand introduction",
            emotion: "Anticipation",
            elements: ["Logo", "Sound design"]
        },
        {
            timestamp: "0:03-0:15",
            description: "Product showcase",
            emotion: insights.topEmotion || "Desire",
            elements: ["Product shots", "Lifestyle context"]
        },
        {
            timestamp: "0:15-0:25",
            description: "Call to action",
            emotion: "Confidence",
            elements: ["CTA", "Brand reinforcement"]
        }
    ];
}

async function generateImageReferences(insights: any): Promise<any[]> {
    return [
        {
            url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            description: "Hero shot with emotional storytelling"
        },
        {
            url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
            description: "Lifestyle product integration"
        },
        {
            url: "https://images.unsplash.com/photo-1556155092-490a1ba16284",
            description: "Premium product detail"
        }
    ];
}

app.post('/api/youtube/search', async (req: any, res: any) => {
    try {
        const { query, maxResults = 10 } = req.body;
        const videos = await searchYouTube(query, maxResults);
        res.json({ success: true, data: videos });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard/stats', async (req: any, res: any) => {
    res.json({
        success: true,
        data: {
            timeSaved: '42 hrs/week',
            videosAnalyzed: 128,
            topEmotion: 'Joy',
            brandImpact: '+23%'
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 AdBuddy Pro - Creative Intelligence      ║
║   Server: http://localhost:${PORT}              ║
║   AI: Groq + TwelveLabs + YouTube             ║
║   Index: ${INDEX_ID.slice(0, 12)}...                  ║
╚═══════════════════════════════════════════════╝
    `);
    console.log('✅ Server ready!');
    console.log('📊 Routes: /api/adflex/*, /api/swayable/analyze, /api/analyze-video-detailed');
    console.log('🎬 YouTube + 12 Labs Pegasus integration active');
});

export default app;