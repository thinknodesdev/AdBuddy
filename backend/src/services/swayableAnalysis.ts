import { TwelveLabs } from 'twelvelabs-js';
import Groq from 'groq-sdk';

interface SwayableExperiment {
    videoUrl: string;
    videoTitle: string;
    quantData: {
        brandFavorability: number;
        purchaseIntent: number;
        audienceSegments: Array<{
            segment: string;
            favorability: number;
            intent: number;
        }>;
    };
    qualFeedback: string[]; // Open-ended responses
    brandObjective: 'favorability' | 'purchase_intent' | 'awareness';
}

interface CreativeRecommendation {
    element: string;
    timestamp: string;
    insight: string;
    recommendation: string;
    audienceSegment: string;
    priority: 'high' | 'medium' | 'low';
    supportingData: {
        videoInsight: string;
        qualMention: number; // How many people mentioned it
        quantImpact: number; // Score impact
    };
}

export class SwayableAnalysisEngine {
    private twelveLabsClient: TwelveLabs;
    private groq: Groq;

    constructor(twelveLabsKey: string, groqKey: string) {
        this.twelveLabsClient = new TwelveLabs({ apiKey: twelveLabsKey });
        this.groq = new Groq({ apiKey: groqKey });
    }

    async analyzeExperiment(experiment: SwayableExperiment): Promise<CreativeRecommendation[]> {
        console.log('🎬 Step 1: Deep video analysis with 12 Labs');
        const videoInsights = await this.analyze12Labs(experiment.videoUrl);

        console.log('💬 Step 2: Analyze qualitative feedback patterns');
        const qualPatterns = await this.analyzeQualFeedback(experiment.qualFeedback);

        console.log('📊 Step 3: Map quant metrics to creative elements');
        const quantMapping = this.mapQuantToElements(experiment.quantData, videoInsights);

        console.log('🧠 Step 4: Generate integrated recommendations');
        const recommendations = await this.generateRecommendations({
            videoInsights,
            qualPatterns,
            quantMapping,
            brandObjective: experiment.brandObjective
        });

        return recommendations;
    }

    private async analyze12Labs(videoUrl: string) {
        // Index video
        const task = await this.twelveLabsClient.task.create({
            indexId: process.env.TWELVELABS_INDEX_ID!,
            url: videoUrl
        });

        await this.waitForIndexing(task.id);

        const videos = await this.twelveLabsClient.index.video.list(
            process.env.TWELVELABS_INDEX_ID!
        );
        const video = videos[0];

        // Multi-prompt analysis for comprehensive insights
        const analyses = await Promise.all([
            // 1. Scene-by-scene breakdown
            this.twelveLabsClient.generate.text(video.id, `
                Analyze this ad frame-by-frame. For each major scene:
                - Timestamp
                - Visual elements (people, products, settings)
                - Emotional tone
                - Brand elements visible
                - Call-to-action moments
                Return as JSON array.
            `),

            // 2. Audience appeal analysis
            this.twelveLabsClient.generate.text(video.id, `
                Identify which audience segments this ad targets:
                - Age groups shown
                - Gender representation
                - Lifestyle indicators
                - Cultural references
                - Pain points addressed
                Return as JSON.
            `),

            // 3. Persuasion techniques
            this.twelveLabsClient.generate.text(video.id, `
                Identify persuasion techniques used:
                - Social proof elements
                - Scarcity/urgency
                - Emotional appeals (which emotions?)
                - Product demonstrations
                - Testimonials or endorsements
                - Problem-solution framing
                Return as JSON.
            `),

            // 4. Brand messaging
            this.twelveLabsClient.generate.text(video.id, `
                Analyze brand messaging:
                - Key value propositions
                - Brand personality conveyed
                - Consistency of messaging
                - Memorable moments
                - Brand recall elements
                Return as JSON.
            `)
        ]);

        return {
            scenes: JSON.parse(this.extractJSON(analyses[0].data)),
            audience: JSON.parse(this.extractJSON(analyses[1].data)),
            persuasion: JSON.parse(this.extractJSON(analyses[2].data)),
            branding: JSON.parse(this.extractJSON(analyses[3].data))
        };
    }

    private async analyzeQualFeedback(feedback: string[]) {
        // Use Groq to find patterns in open-ended responses
        const prompt = `
Analyze these survey responses about an ad campaign. Find:
1. Most mentioned positive elements (with count)
2. Most mentioned negative elements (with count)
3. Confused/unclear messaging (with count)
4. Emotional reactions expressed
5. Suggestions for improvement

Responses:
${feedback.join('\n---\n')}

Return as JSON with counts for each pattern.
        `;

        const completion = await this.groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
            temperature: 0.3
        });

        return JSON.parse(this.extractJSON(completion.choices[0].message.content || '{}'));
    }

    private mapQuantToElements(quantData: any, videoInsights: any) {
        // Map low-performing segments to video elements
        const lowPerformingSegments = quantData.audienceSegments
            .filter((s: any) => s.favorability < 50)
            .map((s: any) => s.segment);

        return {
            lowPerformingSegments,
            overallScore: quantData.brandFavorability,
            purchaseIntent: quantData.purchaseIntent
        };
    }

    private async generateRecommendations(data: any): Promise<CreativeRecommendation[]> {
        const prompt = `
You are an expert creative strategist. Generate specific, actionable recommendations to improve this ad.

VIDEO INSIGHTS:
${JSON.stringify(data.videoInsights, null, 2)}

QUALITATIVE FEEDBACK PATTERNS:
${JSON.stringify(data.qualPatterns, null, 2)}

QUANTITATIVE PERFORMANCE:
${JSON.stringify(data.quantMapping, null, 2)}

BRAND OBJECTIVE: ${data.brandObjective}

Generate 5-8 specific creative recommendations. For each:
1. What element to change (with timestamp if applicable)
2. Why it's not working (cite video + qual + quant evidence)
3. Specific recommendation for improvement
4. Which audience segment this helps
5. Priority level (high/medium/low)

Return as JSON array.
        `;

        const completion = await this.groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 2000
        });

        return JSON.parse(this.extractJSON(completion.choices[0].message.content || '[]'));
    }

    private extractJSON(text: string): string {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? match[0] : '{}';
    }

    private async waitForIndexing(taskId: string) {
        while (true) {
            const task = await this.twelveLabsClient.task.retrieve(taskId);
            if (task.status === 'ready') return;
            if (task.status === 'failed') throw new Error('Indexing failed');
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}