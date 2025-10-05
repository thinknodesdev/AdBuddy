import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from './db/setup';
import { searchYouTube, downloadVideo } from './services/youtube';
import { analyzeVideo } from './services/twelvelabs';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await all('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json({ success: true, campaigns });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/campaigns', async (req, res) => {
    try {
        const { name, keywords } = req.body;
        const id = uuidv4();
        await run('INSERT INTO campaigns (id, name, keywords) VALUES (?, ?, ?)', [id, name, keywords]);
        res.json({ success: true, campaignId: id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload/:campaignId', upload.array('files'), async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { keywords } = req.body;
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
            const id = uuidv4();
            await run('INSERT INTO user_uploads (id, campaign_id, file_path, keywords) VALUES (?, ?, ?, ?)', [id, campaignId, file.path, keywords]);
        }
        res.json({ success: true, uploaded: files.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await get('SELECT keywords FROM campaigns WHERE id = ?', [campaignId]);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        processAnalysis(campaignId, campaign.keywords);
        res.json({ success: true, message: 'Analysis started', campaignId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

async function processAnalysis(campaignId: string, keywords: string) {
    try {
        console.log('Starting analysis for:', campaignId);
        const videos = await searchYouTube(keywords, 3);
        console.log(`Found ${videos.length} videos`);

        for (const video of videos) {
            console.log(`Processing: ${video.title}`);
            const videoId = uuidv4();

            // Save video metadata
            await run(
                `INSERT INTO youtube_videos (id, campaign_id, video_id, title, thumbnail_url, local_path) VALUES (?, ?, ?, ?, ?, ?)`,
                [videoId, campaignId, video.id, video.title, video.thumbnail, video.url]
            );
        }

        const allVideos = await all('SELECT * FROM youtube_videos WHERE campaign_id = ?', [campaignId]);
        const analysisResults: any[] = [];

        for (const video of allVideos) {
            try {
                console.log(`Analyzing: ${video.title}`);
                // Pass YouTube URL directly to TwelveLabs
                const youtubeUrl = `https://youtube.com/watch?v=${video.video_id}`;
                const analysis = await analyzeVideo(youtubeUrl, video.title);
                analysisResults.push({
                    video_id: video.video_id,
                    title: video.title,
                    analysis: analysis.data
                });
            } catch (error: any) {
                console.error(`Failed to analyze ${video.title}:`, error.message);
                analysisResults.push({
                    video_id: video.video_id,
                    title: video.title,
                    error: error.message
                });
            }
        }

        const analysisId = uuidv4();
        await run(
            'INSERT INTO analysis_results (id, campaign_id, analysis_data) VALUES (?, ?, ?)',
            [analysisId, campaignId, JSON.stringify(analysisResults)]
        );

        console.log('Analysis complete for:', campaignId);

    } catch (error) {
        console.error('Analysis error:', error);
    }
}

app.get('/api/results/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const videos = await all('SELECT * FROM youtube_videos WHERE campaign_id = ?', [campaignId]);
        const analysis = await get('SELECT * FROM analysis_results WHERE campaign_id = ?', [campaignId]);
        res.json({ success: true, videos, analysis: analysis ? JSON.parse(analysis.analysis_data) : null });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});