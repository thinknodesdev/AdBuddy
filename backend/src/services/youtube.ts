import axios from 'axios';

export async function searchYouTube(query: string, maxResults: number = 5) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not configured');

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: { part: 'snippet', q: query, type: 'video', maxResults, key: YOUTUBE_API_KEY }
    });

    return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        url: `https://youtube.com/watch?v=${item.id.videoId}`
    }));
}

export async function downloadVideo(videoId: string, campaignId: string): Promise<string> {
    console.log(`Skipping download for demo: ${videoId}`);
    return `placeholder-${videoId}.mp4`;
}