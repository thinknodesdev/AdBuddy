import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAdFlexClient } from '../services/adflex';

const router = Router();

router.post('/search', async (req, res) => {
    try {
        const { keywords, platforms = ['facebook', 'meta'], limit = 20 } = req.body;

        if (!keywords) {
            return res.status(400).json({ success: false, error: 'Keywords required' });
        }

        console.log(`Searching AdFlex for: ${keywords}`);
        const adFlexClient = getAdFlexClient();
        const results: any[] = [];

        for (const platform of platforms) {
            try {
                const ads = await adFlexClient.searchByKeywords(platform, keywords, limit);
                for (const ad of ads) {
                    results.push({
                        id: uuidv4(),
                        platform,
                        adId: ad.id || ad.ad_id,
                        title: ad.title || ad.headline,
                        description: ad.description || ad.body,
                        imageUrl: ad.image_url || ad.thumbnail,
                        advertiser: ad.advertiser_name || ad.page_name,
                        engagement: ad.engagement || 0,
                        impressions: ad.impressions || 0,
                        fetchedAt: new Date().toISOString()
                    });
                }
            } catch (error: any) {
                console.error(`Error searching ${platform}:`, error.message);
            }
        }

        res.json({ success: true, data: { ads: results, count: results.length, keywords } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/trending', async (req, res) => {
    try {
        const { platforms = ['facebook', 'meta'], limit = 50 } = req.query;
        const adFlexClient = getAdFlexClient();
        const platformsArray = Array.isArray(platforms) ? platforms : [platforms];
        const ads = await adFlexClient.getTrendingAds(platformsArray as string[]);

        res.json({ success: true, data: { ads: ads.slice(0, Number(limit)), count: ads.length } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;