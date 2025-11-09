"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Users, Building2 } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";


interface GeoJSONFeature {
  type: "Feature";
  properties: {
    類別: string;
    地址: string;
    村里別?: string;
    可容納人數?: string;
  };
  geometry: {
    type: "Point";
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
  showNoShelterMessage = false,
}: ShelterSelectionDialogProps = {}) {
  const { familyData, setCommonShelter } = useFamily();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen =
    externalOnOpenChange !== undefined
      ? externalOnOpenChange
      : setInternalIsOpen;

  // Load shelter data only when dialog opens
  useEffect(() => {
    if (!isOpen || shelters.length > 0) return;

    const loadShelters = async () => {
      setIsLoading(true);
      try {
        const [newTaipeiResponse, taipeiResponse] = await Promise.all([
          fetch("/json/新北市.json"),
          fetch("/json/臺北市.json"),
        ]);

        const newTaipeiData = await newTaipeiResponse.json();
        const taipeiData = await taipeiResponse.json();

        const allShelters = [
          ...newTaipeiData.features,
          ...taipeiData.features,
        ].map((feature: GeoJSONFeature) => ({
          類別: feature.properties.類別,
          地址: feature.properties.地址,
          村里別: feature.properties.村里別,
          可容納人數: feature.properties.可容納人數,
          coordinates: feature.geometry.coordinates,
        }));

        setShelters(allShelters);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load shelters:", error);
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
          shelter.村里別?.toLowerCase().includes(query),
      )
      .slice(0, 50); // Limit to 50 results
  }, [shelters, searchQuery]);

  const handleSelectShelter = (shelter: ShelterData) => {
    setCommonShelter({
      address: shelter.地址,
      coordinates: shelter.coordinates,
      name: shelter.類別,
    });
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-2 border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-all cursor-pointer py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-muted-foreground mb-0.5">
                  家庭集合避難所
                </div>
                {familyData.commonShelter ? (
                  <div className="space-y-0.5">
                    <div className="font-bold text-base text-foreground truncate">
                      {familyData.commonShelter.name || "已設定避難所"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
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
                <div className="text-sm font-medium text-secondary-600 px-3 py-1.5 rounded-md bg-secondary-100 dark:bg-secondary-900/40">
                  {familyData.commonShelter ? "變更" : "設定"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl">選擇家庭集合避難所</DialogTitle>
          <DialogDescription>
            選擇一個避難所作為家庭緊急集合地點
          </DialogDescription>
        </DialogHeader>

        {/* No Shelter Warning Message */}
        {showNoShelterMessage && !familyData.commonShelter && (
          <div className="px-4 sm:px-6 pb-2">
            <div className="bg-secondary-50 dark:bg-secondary-900/20 border-2 border-secondary-500 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-3 h-3 text-white"
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
                  <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
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
        <div className="px-4 sm:px-6 pb-4 space-y-2 flex-shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜尋避難所名稱、地址或村里別..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {!searchQuery && shelters.length > 100 && (
            <p className="text-xs text-muted-foreground">
              顯示前 100 個避難所，使用搜尋功能尋找特定避難所
            </p>
          )}
        </div>

        {/* Shelter List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-4 sm:px-6 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  正在載入避難所資料...
                </div>
              ) : filteredShelters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <div>找不到符合的避難所</div>
                </div>
              ) : (
                <div className="space-y-2 w-full">
                  {filteredShelters.map((shelter, index) => {
                    const isSelected =
                      familyData.commonShelter?.address === shelter.地址;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectShelter(shelter)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? "border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20"
                            : "border-border hover:border-secondary-300 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-secondary-500"
                                : "bg-primary-100 dark:bg-primary-900/30"
                            }`}
                          >
                            <Building2
                              className={`w-4 h-4 ${isSelected ? "text-white" : "text-primary-600 dark:text-primary-400"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1 truncate">
                              {shelter.類別}
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                              <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {shelter.地址}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {shelter.村里別 && <span>{shelter.村里別}</span>}
                              {shelter.可容納人數 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{shelter.可容納人數}人</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
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

        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-t flex-shrink-0">
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
