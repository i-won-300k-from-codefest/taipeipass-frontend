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
        title: '颱風警報：康芮颱風逼近台北市',
        category: '緊急警報',
        content: '預計今晚8點發布陸上颱風警報，請民眾做好防颱準備。',
        timestamp: new Date().toISOString(),
        priority: 'high',
        source: '中央氣象署'
    },
    {
        id: 2,
        title: '捷運系統正常營運',
        category: '交通資訊',
        content: '台北捷運各線路運行正常，請安心搭乘。',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        priority: 'low',
        source: '台北捷運'
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
            <NewsBanner news={mockNews} onNewsClick={() => setIsNewsDialogOpen(true)} />

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
            <div className="absolute right-8 bottom-24 z-10">
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

            <div className="absolute bottom-4 left-0 w-screen">
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
