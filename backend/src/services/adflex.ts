import axios, { AxiosInstance } from 'axios';

interface AdFlexConfig {
    apiKey: string;
    baseUrl?: string;
}

interface AdSearchParams {
    platform: 'facebook' | 'meta' | 'native' | 'display' | 'pinterest' | 'reddit' | 'youtube' | 'x';
    page?: number;
    orderby?: string;
    keywords?: string;
}

interface AdFlexResponse {
    status: 'ok' | 'failed';
    meta: { code: number; message: string | null };
    data: any;
}

export class AdFlexService {
    private client: AxiosInstance;
    private apiKey: string;

    constructor(config: AdFlexConfig) {
        this.apiKey = config.apiKey;
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://api.adflex.io/v1',
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }

    async searchByKeywords(platform: string, keywords: string, maxResults: number = 20): Promise<any[]> {
        try {
            const response = await this.client.post(`/${platform}/ads/search`, {
                page: 1,
                orderby: 'updated_at',
                search_field: [{ type: 'text', text: keywords }]
            });

            if (response.data.status === 'ok' && response.data.data?.ads) {
                return response.data.data.ads.slice(0, maxResults);
            }
            return [];
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }

    async getTrendingAds(platforms: string[] = ['facebook', 'meta']): Promise<any[]> {
        const allAds: any[] = [];
        for (const platform of platforms) {
            try {
                const response = await this.client.post(`/${platform}/ads/search`, {
                    page: 1,
                    orderby: 'engagement'
                });
                if (response.data.status === 'ok' && response.data.data?.ads) {
                    allAds.push(...response.data.data.ads.map((ad: any) => ({ ...ad, platform })));
                }
            } catch (error) {
                console.error(`Failed to get trending ads for ${platform}`);
            }
        }
        return allAds.slice(0, 50);
    }
}

let adFlexInstance: AdFlexService | null = null;

export function getAdFlexClient(): AdFlexService {
    if (!adFlexInstance && process.env.ADFLEX_API_KEY) {
        adFlexInstance = new AdFlexService({ apiKey: process.env.ADFLEX_API_KEY });
    }
    if (!adFlexInstance) {
        throw new Error('AdFlex API key not configured');
    }
    return adFlexInstance;
}