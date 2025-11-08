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
import { Trash2 } from "lucide-react";
import emergencyContactsData from "@/public/emergency-contacts.json";
import { useState } from "react";
import AddMemberDrawer from "./addMemberDrawer";

export default function ContactDrawer() {
  const contacts = emergencyContactsData.contacts;
  const displayedAvatars = contacts.slice(0, 4);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full h-fit">
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

            <p className="leading-7">
              家庭共 <b>{contacts.length} 個聯絡人</b>
            </p>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DrawerFooter>
          <AddMemberDrawer />
          <DrawerClose asChild>
            <Button variant="outline">關閉</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
