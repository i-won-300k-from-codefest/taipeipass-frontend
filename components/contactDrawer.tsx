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
import emergencyContactsData from "@/public/emergency-contacts.json";
import { useState } from "react";
import AddMemberDrawer from "./addMemberDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContactDrawer() {
  const contacts = emergencyContactsData.contacts;
  const displayedAvatars = contacts.slice(0, 4);

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
          <DrawerTitle>家庭成員</DrawerTitle>
          <DrawerDescription>
            目前家庭有 {contacts.length} 個人
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-2 px-4 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <Card key={contact.id}>
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
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      刪除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>

        <DrawerFooter>
          <AddMemberDrawer />
          <DrawerClose asChild>
            <Button variant="outline" className="cursor-pointer">
              關閉
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
