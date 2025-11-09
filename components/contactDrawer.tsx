"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import AddMemberDrawer from "./addMemberDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFamily } from "@/contexts/FamilyContext";
import { ShelterSelectionDialog } from "./ShelterSelectionDialog";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "motion/react";
import { StatusReportDialog } from "./StatusReportDialog";
import type { UserData } from "./UserStatusDialog";

export default function ContactDrawer() {
  const { familyData, removeMember } = useFamily();
  const contacts = familyData.members;
  const displayedAvatars = contacts.slice(0, 4);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isStatusReportOpen, setIsStatusReportOpen] = useState(false);

  useEffect(() => {
    fetch("/current-user.json")
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.error("Failed to load user data:", err));
  }, []);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full h-fit cursor-pointer">
          <div className="flex gap-4 py-2 mx-auto h-fit place-items-center">
            <div className="flex -space-x-2">
              {displayedAvatars.map((contact) => (
                <Avatar
                  key={contact.id}
                  className="ring-2 ring-background grayscale"
                >
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
            </div>

            <p className="leading-7 font-bold">查看我的家庭</p>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>家庭管理</DrawerTitle>
          <DrawerDescription>
            管理家庭成員與集合避難所
          </DrawerDescription>
        </DrawerHeader>

        {/* Common Shelter Selection */}
        <div className="px-4 mb-4">
          <ShelterSelectionDialog />
        </div>

        <Separator className="mb-4" />

        <div className="px-4 mb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            家庭成員 ({contacts.length})
          </h3>
        </div>

        <div className="flex flex-col gap-2 px-4 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 100 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ml-2">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-semibold text-sm leading-none">
                          {contact.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {contact.relation} · {contact.phone}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => removeMember(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <DrawerFooter>
          <AddMemberDrawer />
          <StatusReportDialog
            isOpen={isStatusReportOpen}
            onOpenChange={setIsStatusReportOpen}
            emergencyContacts={familyData.members}
            currentUser={userData}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
