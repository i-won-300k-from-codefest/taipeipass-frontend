'use client';

import { useState, useRef } from 'react';
import ContactDrawer from '@/components/contactDrawer';
import HamburgerMenu from '@/components/hamburgerMenu';
import { ShelterMap, type ShelterMapRef } from '@/components/map';
import { NewsBanner } from '@/components/NewsBanner';
import { NewsDialog } from '@/components/NewsDialog';
import type { NewsItem } from '@/components/NewsDialog';
import { FamilyProvider, useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { ShelterSelectionDialog } from '@/components/ShelterSelectionDialog';

// Mock news data - replace with actual data source
const mockNews: NewsItem[] = [
    {
        id: 1,
        title: '台北市發布地震警報',
        category: '緊急通知',
        content:
            '今日上午10:21發生規模6.2地震，震央位於台北市南方15公里處，震源深度10公里。請民眾保持警戒，注意餘震。',
        timestamp: '2024-01-15T10:25:00',
        priority: 'high',
        source: '中央氣象署'
    },
    {
        id: 2,
        title: '捷運系統暫停營運檢查',
        category: '交通資訊',
        content:
            '受地震影響，台北捷運全線暫停營運進行安全檢查，預計30分鐘內恢復正常。請搭乘捷運的民眾耐心等候。',
        timestamp: '2024-01-15T10:30:00',
        priority: 'medium',
        source: '台北捷運公司'
    }
];

function HomeContent() {
    const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
    const [isShelterDialogOpen, setIsShelterDialogOpen] = useState(false);
    const mapRef = useRef<ShelterMapRef>(null);
    const { familyData } = useFamily();

    const handleNavigateToShelter = () => {
        if (familyData.commonShelter) {
            // If shelter is set, fly to it
            mapRef.current?.flyToCommonShelter();
        } else {
            // If no shelter is set, open the selection dialog
            setIsShelterDialogOpen(true);
        }
    };

    return (
        <>
            <div className="flex h-full w-full place-items-center justify-center bg-grey-200">
                <ShelterMap ref={mapRef} />
            </div>

            {/* News Banner */}
            <NewsBanner news={mockNews} />

            {/* News Dialog */}
            <NewsDialog
                isOpen={isNewsDialogOpen}
                onOpenChange={setIsNewsDialogOpen}
                news={mockNews}
            />

            {/* Shelter Selection Dialog - triggered from navigation button */}
            <ShelterSelectionDialog
                isOpen={isShelterDialogOpen}
                onOpenChange={setIsShelterDialogOpen}
                showNoShelterMessage={!familyData.commonShelter}
            />

            {/* Navigate to Common Shelter Button */}
            <div className="absolute right-8 bottom-28 z-10">
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleNavigateToShelter}
                    className="h-12 w-12 shadow-lg"
                    aria-label={familyData.commonShelter ? '前往集合避難所' : '設定家庭集合避難所'}
                >
                    <Navigation className="h-5 w-5" />
                </Button>
            </div>

            <div className="absolute bottom-10 left-0 w-screen">
                <div className="w-full px-8">
                    <ContactDrawer />
                </div>
            </div>
            <HamburgerMenu />
        </>
    );
}

export default function Home() {
    return (
        <FamilyProvider>
            <HomeContent />
        </FamilyProvider>
    );
}
