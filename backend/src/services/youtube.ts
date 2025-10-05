import axios from 'axios';

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    channelTitle: string;
}

export async function searchYouTube(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            console.warn('YouTube API key not found, returning mock data');
            return generateMockVideos(maxResults, query);
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query,
                maxResults,
                type: 'video',
                key: apiKey
            }
        });

        return response.data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            channelTitle: item.snippet.channelTitle
        }));

    } catch (error: any) {
        console.error('YouTube search failed:', error.message);
        return generateMockVideos(maxResults, query);
    }
}

function generateMockVideos(count: number, query: string): YouTubeVideo[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-video-${i}`,
        title: `${query} - Example Video ${i + 1}`,
        thumbnail: `https://picsum.photos/seed/${query}-${i}/480/360`,
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        channelTitle: 'Example Channel'
    }));
}