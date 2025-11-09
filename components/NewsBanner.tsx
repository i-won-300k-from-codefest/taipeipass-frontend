'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, X, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NewsItem } from './NewsDialog';

interface NewsBannerProps {
    news: NewsItem[];
    onNewsClick?: () => void;
}

export function NewsBanner({ news, onNewsClick }: NewsBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

    // Auto-rotate news items
    useEffect(() => {
        if (news.length <= 1) return;

        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % news.length);
        }, 5000); // Change news every 5 seconds

        return () => clearInterval(interval);
    }, [news.length]);

    if (!isVisible || news.length === 0) return null;

    const currentNews = news[currentIndex];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-600';
            case 'medium':
                return 'bg-orange-600';
            case 'low':
                return 'bg-blue-600';
            default:
                return 'bg-gray-600';
        }
    };

    const getBannerBgColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-50 border-red-200';
            case 'medium':
                return 'bg-orange-50 border-orange-200';
            case 'low':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="fixed top-20 right-4 left-4 z-40">
            <div
                className={`rounded-lg border shadow-lg ${getBannerBgColor(
                    currentNews.priority
                )} overflow-hidden backdrop-blur-sm`}
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="flex items-center gap-3 p-3"
                    >
                        {/* Priority Indicator */}
                        <div
                            className={`h-12 w-1 flex-shrink-0 rounded-full ${getPriorityColor(
                                currentNews.priority
                            )}`}
                        />

                        {/* Icon */}
                        <div className="flex-shrink-0">
                            {currentNews.priority === 'high' ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                                <Newspaper className="h-5 w-5 text-gray-600" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                        currentNews.priority
                                    )} text-white`}
                                >
                                    {currentNews.category}
                                </span>
                                {news.length > 1 && (
                                    <span className="text-xs text-muted-foreground">
                                        {currentIndex + 1} / {news.length}
                                    </span>
                                )}
                            </div>
                            <h3 className="truncate text-sm font-semibold">{currentNews.title}</h3>
                            <p className="truncate text-xs text-muted-foreground">
                                {currentNews.content}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-shrink-0 items-center gap-1">
                            {onNewsClick && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={onNewsClick}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">查看更多</span>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setIsVisible(false)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">關閉</span>
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
