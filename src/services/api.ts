const API_URL = 'http://localhost:5000/api';

export interface Campaign {
    id: string;
    name: string;
    keywords: string;
}

export interface UploadResponse {
    success: boolean;
    uploaded: number;
}

export interface AnalysisResult {
    videos: Array<{
        id: string;
        title: string;
        thumbnail_url: string;
        video_id: string;
    }>;
    analysis: Array<{
        title: string;
        topics: string[];
        hashtags: string[];
    }>;
}

class ApiService {
    async createCampaign(name: string, keywords: string): Promise<Campaign> {
        const response = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, keywords })
        });
        const data = await response.json();
        return { id: data.campaignId, name, keywords };
    }

    async uploadFiles(campaignId: string, files: FileList, keywords: string): Promise<UploadResponse> {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));
        formData.append('keywords', keywords);

        const response = await fetch(`${API_URL}/upload/${campaignId}`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    }

    async startAnalysis(campaignId: string): Promise<void> {
        await fetch(`${API_URL}/analyze/${campaignId}`, {
            method: 'POST'
        });
    }

    async getResults(campaignId: string): Promise<AnalysisResult> {
        const response = await fetch(`${API_URL}/results/${campaignId}`);
        return response.json();
    }
}

export const api = new ApiService();