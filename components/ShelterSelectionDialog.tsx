'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Users, Building2 } from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';

interface GeoJSONFeature {
    type: 'Feature';
    properties: {
        類別: string;
        地址: string;
        村里別?: string;
        可容納人數?: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface ShelterData {
    類別: string;
    地址: string;
    村里別?: string;
    可容納人數?: string;
    coordinates: [number, number];
}

interface ShelterSelectionDialogProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    showNoShelterMessage?: boolean;
}

export function ShelterSelectionDialog({
    isOpen: externalIsOpen,
    onOpenChange: externalOnOpenChange,
    showNoShelterMessage = false
}: ShelterSelectionDialogProps = {}) {
    const { familyData, setCommonShelter } = useFamily();
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shelters, setShelters] = useState<ShelterData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalIsOpen;

    // Load shelter data only when dialog opens
    useEffect(() => {
        if (!isOpen || shelters.length > 0) return;

        const loadShelters = async () => {
            setIsLoading(true);
            try {
                const [newTaipeiResponse, taipeiResponse] = await Promise.all([
                    fetch('/json/新北市.json'),
                    fetch('/json/臺北市.json')
                ]);

                const newTaipeiData = await newTaipeiResponse.json();
                const taipeiData = await taipeiResponse.json();

                const allShelters = [...newTaipeiData.features, ...taipeiData.features].map(
                    (feature: GeoJSONFeature) => ({
                        類別: feature.properties.類別,
                        地址: feature.properties.地址,
                        村里別: feature.properties.村里別,
                        可容納人數: feature.properties.可容納人數,
                        coordinates: feature.geometry.coordinates
                    })
                );

                setShelters(allShelters);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load shelters:', error);
                setIsLoading(false);
            }
        };

        loadShelters();
    }, [isOpen, shelters.length]);

    // Filter shelters based on search query - limit results to 50 for performance
    const filteredShelters = useMemo(() => {
        if (!searchQuery.trim()) return shelters.slice(0, 100); // Show first 100 by default

        const query = searchQuery.toLowerCase();
        return shelters
            .filter(
                (shelter) =>
                    shelter.類別?.toLowerCase().includes(query) ||
                    shelter.地址?.toLowerCase().includes(query) ||
                    shelter.村里別?.toLowerCase().includes(query)
            )
            .slice(0, 50); // Limit to 50 results
    }, [shelters, searchQuery]);

    const handleSelectShelter = (shelter: ShelterData) => {
        setCommonShelter({
            address: shelter.地址,
            coordinates: shelter.coordinates,
            name: shelter.類別
        });
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="cursor-pointer border-2 border-secondary-500 py-0 transition-all hover:bg-secondary-50 dark:hover:bg-secondary-900/20">
                    <CardContent className="p-4">
                        <div className="flex w-full items-center gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-500">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 text-sm font-semibold text-muted-foreground">
                                    家庭集合避難所
                                </div>
                                {familyData.commonShelter ? (
                                    <div className="space-y-0.5">
                                        <div className="truncate text-base font-bold text-foreground">
                                            {familyData.commonShelter.name || '已設定避難所'}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {familyData.commonShelter.address}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        點擊設定家庭集合避難所
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                <div className="rounded-md bg-secondary-100 px-3 py-1.5 text-sm font-medium text-secondary-600 dark:bg-secondary-900/40">
                                    {familyData.commonShelter ? '變更' : '設定'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col p-0">
                <DialogHeader className="flex-shrink-0 px-4 pt-6 pb-4 sm:px-6">
                    <DialogTitle className="text-xl">選擇家庭集合避難所</DialogTitle>
                    <DialogDescription>選擇一個避難所作為家庭緊急集合地點</DialogDescription>
                </DialogHeader>

                {/* No Shelter Warning Message */}
                {showNoShelterMessage && !familyData.commonShelter && (
                    <div className="px-4 pb-2 sm:px-6">
                        <div className="rounded-lg border-2 border-secondary-500 bg-secondary-50 p-3 dark:bg-secondary-900/20">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-secondary-500">
                                    <svg
                                        className="h-3 w-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="mb-1 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                                        尚未設定家庭集合避難所
                                    </p>
                                    <p className="text-xs text-secondary-700 dark:text-secondary-300">
                                        請從下方列表選擇一個避難所作為家庭緊急集合地點
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="flex-shrink-0 space-y-2 px-4 pb-4 sm:px-6">
                    <div className="relative w-full">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="搜尋避難所名稱、地址或村里別..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10"
                        />
                    </div>
                    {!searchQuery && shelters.length > 100 && (
                        <p className="text-xs text-muted-foreground">
                            顯示前 100 個避難所，使用搜尋功能尋找特定避難所
                        </p>
                    )}
                </div>

                {/* Shelter List */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="px-4 pb-4 sm:px-6">
                        {isLoading ? (
                            <div className="flex h-32 items-center justify-center text-muted-foreground">
                                正在載入避難所資料...
                            </div>
                        ) : filteredShelters.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                                <Search className="mb-2 h-8 w-8 opacity-50" />
                                <div>找不到符合的避難所</div>
                            </div>
                        ) : (
                            <div className="w-full space-y-2">
                                {filteredShelters.map((shelter, index) => {
                                    const isSelected =
                                        familyData.commonShelter?.address === shelter.地址;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectShelter(shelter)}
                                            className={`w-full cursor-pointer rounded-lg border-2 p-3 text-left transition-all ${
                                                isSelected
                                                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                                                    : 'border-border hover:border-secondary-300 hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                                                        isSelected
                                                            ? 'bg-secondary-500'
                                                            : 'bg-primary-100 dark:bg-primary-900/30'
                                                    }`}
                                                >
                                                    <Building2
                                                        className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 truncate text-sm font-semibold">
                                                        {shelter.類別}
                                                    </div>
                                                    <div className="mb-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                                                        <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                        <span className="line-clamp-2">
                                                            {shelter.地址}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {shelter.村里別 && (
                                                            <span>{shelter.村里別}</span>
                                                        )}
                                                        {shelter.可容納人數 && (
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                <span>{shelter.可容納人數}人</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex-shrink-0">
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500">
                                                            <svg
                                                                className="h-3 w-3 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-shrink-0 items-center justify-between border-t px-4 py-4 sm:px-6">
                    <div className="text-sm text-muted-foreground">
                        共 {filteredShelters.length} 個避難所
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer"
                    >
                        關閉
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
