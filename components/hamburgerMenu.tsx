'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTrigger
} from '@/components/ui/drawer';
import { UserStatusDialog, type UserData } from '@/components/UserStatusDialog';
import { StatusReportDialog } from '@/components/StatusReportDialog';
import { NewsDialog, type NewsItem } from '@/components/NewsDialog';
import { useFamily } from '@/contexts/FamilyContext';

function UserDrawer({ userData, news }: { userData: UserData | null; news: NewsItem[] }) {
    const { familyData } = useFamily();
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="fixed top-4 right-4 z-50">
                    <Menu />
                    <span className="sr-only">開啟選單</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <div className="flex-1 overflow-y-auto">
                        {/* User Profile Section */}
                        <div className="px-4 py-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={userData?.avatar || '/avatar/user.png'}
                                        alt="使用者頭像"
                                    />
                                    <AvatarFallback>{userData?.name || '使用者'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-semibold">
                                        {userData?.name || '載入中...'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </DrawerHeader>

                <Separator />

                <div className="flex flex-col gap-2 p-4">
                    <UserStatusDialog
                        userData={userData}
                        isOpen={isStatusDialogOpen}
                        onOpenChange={setIsStatusDialogOpen}
                    />

                    <StatusReportDialog
                        isOpen={isReportDialogOpen}
                        onOpenChange={setIsReportDialogOpen}
                        emergencyContacts={familyData.members}
                        currentUser={userData}
                    />

                    <NewsDialog
                        isOpen={isNewsDialogOpen}
                        onOpenChange={setIsNewsDialogOpen}
                        news={news}
                    />
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">關閉</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export default function HamburgerMenu() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        fetch('/current-user.json')
            .then((res) => res.json())
            .then((data) => setUserData(data))
            .catch((err) => console.error('Failed to load user data:', err));

        fetch('/news.json')
            .then((res) => res.json())
            .then((data) => setNews(data.news || []))
            .catch((err) => console.error('Failed to load news:', err));
    }, []);

    return <UserDrawer userData={userData} news={news} />;
}
