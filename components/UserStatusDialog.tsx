'use client';

import { User, Mail, MapPin, UserCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

interface UserData {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
}

export function UserStatusDialog({
    userData,
    isOpen,
    onOpenChange
}: {
    userData: UserData | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-12 w-full justify-start">
                    <User className="mr-3 h-5 w-5" />
                    <span className="text-base">我的狀態</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>我的狀態</DialogTitle>
                    <DialogDescription>您的個人資訊與聯絡方式</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* User Profile Section */}
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

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">電子信箱</span>
                                <span className="text-sm text-muted-foreground">
                                    {userData?.email || '載入中...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">聯絡電話</span>
                                <span className="text-sm text-muted-foreground">
                                    {userData?.phone || '載入中...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">地址</span>
                                <span className="text-sm text-muted-foreground">
                                    {userData?.address || '載入中...'}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-start gap-3">
                            <UserCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">緊急聯絡人</span>
                                <span className="text-sm text-muted-foreground">
                                    {userData?.emergencyContact.name || '載入中...'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {userData?.emergencyContact.phone || '載入中...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export type { UserData };
