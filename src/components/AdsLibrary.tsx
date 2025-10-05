import { VideoAnalyticsModal } from './VideoAnalyticsModal';
import React, { useState, useEffect } from 'react';
import { Search, Library, Heart, TrendingUp, Play, Sparkles, Brain } from 'lucide-react';

interface Ad {
    id: string;
    platform: string;
    title: string;
    description?: string;
    imageUrl?: string;
    advertiser: string;
    engagement: number;
    impressions: number;
    fetchedAt: string;
    aiScore?: number;
    hasAIInsights?: boolean;
    country?: string;
    language?: string;
    ctaType?: string;
    status?: string;
}

interface AdsLibraryProps {
    onBack: () => void;
}

export function AdsLibrary({ onBack }: AdsLibraryProps) {
    const [searchKeywords, setSearchKeywords] = useState('');
    const [activePlatform, setActivePlatform] = useState('all');
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(false);

    // FILTER STATE
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedCTAs, setSelectedCTAs] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const platforms = [
        { id: 'all', name: 'All Platforms', icon: '🌐' },
        { id: 'meta', name: 'Meta', icon: '📘' },
        { id: 'facebook', name: 'Facebook', icon: '👥' },
        { id: 'youtube', name: 'YouTube', icon: '▶️' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵' },
        { id: 'reddit', name: 'Reddit', icon: '🔴' },
        { id: 'pinterest', name: 'Pinterest', icon: '📌' }
    ];

    const countries = ['United States', 'United Kingdom', 'Canada', 'Australia'];
    const languages = ['English', 'Spanish', 'French', 'German'];
    const ctaTypes = ['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Watch Now'];

    useEffect(() => {
        loadTrendingAds();
    }, []);

    const loadTrendingAds = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/adflex/trending?limit=30');
            const result = await response.json();

            if (result.success) {
                setAds(result.data.ads || []);
            }
        } catch (error) {
            console.error('Failed to load ads');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchKeywords.trim()) {
            loadTrendingAds();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/adflex/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywords: searchKeywords,
                    platforms: [activePlatform],
                    limit: 30
                })
            });

            const result = await response.json();
            if (result.success) {
                setAds(result.data.ads || []);
            }
        } catch (error) {
            console.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    // WORKING FILTER LOGIC
    const filteredAds = ads.filter(ad => {
        // Platform filter
        if (activePlatform !== 'all' && ad.platform !== activePlatform) return false;

        // Country filter
        if (selectedCountries.length > 0 && !selectedCountries.includes(ad.country || '')) return false;

        // Language filter
        if (selectedLanguages.length > 0 && !selectedLanguages.includes(ad.language || '')) return false;

        // CTA filter
        if (selectedCTAs.length > 0 && !selectedCTAs.includes(ad.ctaType || '')) return false;

        // Status filter
        if (selectedStatus !== 'all' && ad.status !== selectedStatus) return false;

        return true;
    });

    const toggleFilter = (filterArray: string[], setFilter: Function, value: string) => {
        if (filterArray.includes(value)) {
            setFilter(filterArray.filter(item => item !== value));
        } else {
            setFilter([...filterArray, value]);
        }
    };

    const clearAllFilters = () => {
        setSelectedCountries([]);
        setSelectedLanguages([]);
        setSelectedCTAs([]);
        setSelectedStatus('all');
        setActivePlatform('all');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar - WORKING FILTERS */}
            <aside className="w-72 bg-white border-r overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Filters</h2>
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="space-y-6">
                        <FilterSection title="Countries">
                            {countries.map(country => (
                                <label key={country} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedCountries.includes(country)}
                                        onChange={() => toggleFilter(selectedCountries, setSelectedCountries, country)}
                                    />
                                    <span className="text-sm">{country}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Ad Language">
                            {languages.map(lang => (
                                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedLanguages.includes(lang)}
                                        onChange={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                                    />
                                    <span className="text-sm">{lang}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="CTA Type">
                            {ctaTypes.map(cta => (
                                <label key={cta} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedCTAs.includes(cta)}
                                        onChange={() => toggleFilter(selectedCTAs, setSelectedCTAs, cta)}
                                    />
                                    <span className="text-sm">{cta}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Ad Status">
                            {['all', 'Active', 'Inactive'].map(status => (
                                <label key={status} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={selectedStatus === status}
                                        onChange={() => setSelectedStatus(status)}
                                    />
                                    <span className="text-sm capitalize">{status}</span>
                                </label>
                            ))}
                        </FilterSection>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b p-6">
                    {/* Top Bar with 12 Labs Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">← Back</button>
                            <h1 className="text-2xl font-bold">Ads Library</h1>
                        </div>

                        {/* 12 Labs AI Badge */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-purple-900">Powered by 12 Labs</span>
                                <span className="text-xs text-purple-600">AI Analytics Active</span>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Platform Tabs */}
                    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                        {platforms.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatform(p.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activePlatform === p.id
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {p.icon} {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchKeywords}
                                onChange={(e) => setSearchKeywords(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Try: fitness, tech gadgets, skincare, coffee..."
                                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                        >
                            Search
                        </button>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-gray-600">
                        Found <strong>{filteredAds.length}</strong> ads
                        {searchKeywords && ` for "${searchKeywords}"`}
                        {(selectedCountries.length > 0 || selectedLanguages.length > 0 || selectedCTAs.length > 0) &&
                            ' (filtered)'}
                    </div>
                </header>

                {/* Ads Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600">Loading ads from YouTube...</p>
                        </div>
                    ) : filteredAds.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No ads match your filters. Try adjusting them.</p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            {filteredAds.map(ad => (
                                <AdCard key={ad.id} ad={ad} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b pb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full mb-3"
            >
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="text-gray-400">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="space-y-2">{children}</div>}
        </div>
    );
}

function AdCard({ ad }: { ad: Ad }) {
    const platformColors: Record<string, string> = {
        facebook: 'bg-blue-600',
        meta: 'bg-blue-500',
        youtube: 'bg-red-600',
        tiktok: 'bg-black',
        reddit: 'bg-orange-600',
        pinterest: 'bg-red-500'
    };

    return (
        <div className="bg-white rounded-xl border hover:shadow-xl transition-all cursor-pointer group">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {ad.advertiser?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{ad.advertiser}</h4>
                    <p className="text-xs text-gray-500">{new Date(ad.fetchedAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${ad.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {ad.status}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-sm mb-3 line-clamp-2 font-medium">{ad.title}</p>

                {/* Image/Video */}
                <div className="relative aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    {/* Platform Badge */}
                    <div className={`absolute top-2 right-2 ${platformColors[ad.platform] || 'bg-gray-700'} text-white px-2 py-1 rounded text-xs font-medium`}>
                        {ad.platform}
                    </div>

                    {/* AI Score Badge */}
                    {ad.hasAIInsights && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI {ad.aiScore}
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>📍 {ad.country}</div>
                    <div>🗣️ {ad.language}</div>
                    <div>🎯 {ad.ctaType}</div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {formatNumber(ad.engagement)}
                    </span>
                    <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> {formatNumber(ad.impressions)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}