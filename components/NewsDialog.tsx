'use client';

import { Info, Newspaper, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

interface NewsItem {
    id: number;
    title: string;
    category: string;
    content: string;
    timestamp: string;
    priority: 'high' | 'medium' | 'low';
    source: string;
}

export function NewsDialog({
    isOpen,
    onOpenChange,
    news
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    news: NewsItem[];
}) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'low':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-12 w-full justify-start">
                    <Info className="mr-3 h-5 w-5" />
                    <span className="text-base">最新資訊</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[600px] flex-col p-0 sm:max-w-md">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5" />
                        最新資訊
                    </DialogTitle>
                    <DialogDescription>緊急災害通知與最新消息</DialogDescription>
                </DialogHeader>

                {/* News List */}
                <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                    {news.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-lg border p-4 transition-colors hover:bg-accent/50"
                        >
                            <div className="mb-2 flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span
                                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(
                                                item.priority
                                            )}`}
                                        >
                                            {item.category}
                                        </span>
                                        {item.priority === 'high' && (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                                </div>
                            </div>

                            <p className="mb-3 text-sm text-muted-foreground">{item.content}</p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Newspaper className="h-3 w-3" />
                                    <span>{item.source}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimestamp(item.timestamp)}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {news.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                            <Newspaper className="mb-2 h-12 w-12 opacity-20" />
                            <p>目前沒有最新消息</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export type { NewsItem };
