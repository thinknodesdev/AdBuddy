import { TwelveLabs } from 'twelvelabs-js';
import { config } from 'dotenv';

config();

const client = new TwelveLabs({
    apiKey: process.env.TWELVELABS_API_KEY!
});

const INDEX_ID = '68e2450864ff05606e153cc9';

export async function analyzeVideoWith12Labs(videoUrl: string, title: string) {
    try {
        console.log(`Indexing video: ${title}`);

        // Step 1: Create indexing task
        const task = await client.task.create({
            index_id: INDEX_ID,
            url: videoUrl
        });

        console.log(`Task created: ${task.id}`);

        // Step 2: Wait for indexing
        await waitForIndexing(task.id);

        // Step 3: Get the indexed video
        const videos = await client.index.video.list(INDEX_ID);
        const video = videos.data.find((v: any) => v.metadata?.filename === title) || videos.data[0];

        if (!video) throw new Error('Video not found after indexing');

        // Step 4: Generate comprehensive analysis
        const analysis = await client.generate.text({
            video_id: video.id,
            prompt: `Analyze this advertising video in detail and provide a JSON response with:
{
  "topEmotion": "primary emotion (e.g., joy, aspiration, excitement)",
  "emotionalArc": "description of emotional progression",
  "brandMoments": [
    {"timestamp": "MM:SS", "element": "what happens", "impact": number 1-100}
  ],
  "narrative": {
    "hook": "0-3 second opening description",
    "buildUp": "3-15 second development",
    "climax": "15-25 second peak moment",
    "resolution": "final call-to-action"
  },
  "visualStyle": "description of visual aesthetics",
  "targetAudience": "who this appeals to",
  "keyMoments": ["list of impactful timestamps with descriptions"]
}

Provide only the JSON, no other text.`
        });

        const parsed = parseAnalysis(analysis.data);
        return {
            videoId: video.id,
            ...parsed
        };

    } catch (error: any) {
        console.error('12 Labs analysis failed:', error.message);
        throw error;
    }
}

async function waitForIndexing(taskId: string, maxWait = 180000) {
    const start = Date.now();

    while (Date.now() - start < maxWait) {
        const task = await client.task.retrieve(taskId);

        console.log(`Task status: ${task.status}`);

        if (task.status === 'ready') {
            console.log('Video indexed successfully');
            return;
        }

        if (task.status === 'failed') {
            throw new Error(`Indexing failed: ${task.error_message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Indexing timeout after 3 minutes');
}

function parseAnalysis(response: string): any {
    try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                topEmotion: data.topEmotion || 'Aspiration',
                emotionalArc: data.emotionalArc || 'Engaging throughout',
                brandMoments: data.brandMoments || [],
                narrative: data.narrative || {},
                visualStyle: data.visualStyle || 'Modern',
                targetAudience: data.targetAudience || 'General audience',
                keyMoments: data.keyMoments || []
            };
        }
    } catch (error) {
        console.error('Parse error, using fallback');
    }

    return {
        topEmotion: 'Aspiration',
        emotionalArc: 'Strong narrative progression',
        brandMoments: [],
        narrative: {},
        visualStyle: 'Professional',
        targetAudience: 'General audience',
        keyMoments: []
    };
}

export { client as twelveLabsClient };