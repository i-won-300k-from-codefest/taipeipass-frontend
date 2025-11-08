"use client";

import { useState } from "react";
import ContactDrawer from "@/components/contactDrawer";
import HamburgerMenu from "@/components/hamburgerMenu";
import { ShelterMap } from "@/components/map";
import { NewsBanner } from "@/components/NewsBanner";
import { NewsDialog } from "@/components/NewsDialog";
import type { NewsItem } from "@/components/NewsDialog";

// Mock news data - replace with actual data source
const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "颱風警報：康芮颱風逼近台北市",
    category: "緊急警報",
    content: "預計今晚8點發布陸上颱風警報，請民眾做好防颱準備。",
    timestamp: new Date().toISOString(),
    priority: "high",
    source: "中央氣象署",
  },
  {
    id: 2,
    title: "捷運系統正常營運",
    category: "交通資訊",
    content: "台北捷運各線路運行正常，請安心搭乘。",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    priority: "low",
    source: "台北捷運",
  },
];

export default function Home() {
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);

  return (
    <>
      <div className="w-full flex place-items-center justify-center h-full bg-grey-200">
        <ShelterMap />
      </div>

      {/* News Banner */}
      <NewsBanner
        news={mockNews}
        onNewsClick={() => setIsNewsDialogOpen(true)}
      />

      {/* News Dialog */}
      <NewsDialog
        isOpen={isNewsDialogOpen}
        onOpenChange={setIsNewsDialogOpen}
        news={mockNews}
      />

      <div className="absolute bottom-4 w-screen left-0">
        <div className="w-full px-8">
          <ContactDrawer />
        </div>
      </div>
      <HamburgerMenu />
    </>
  );
}
