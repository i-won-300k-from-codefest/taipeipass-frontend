"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmergencyContact {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  relation: string;
  coordinates: [number, number];
}

interface ChatMessage {
  id: number;
  senderId: number | "me";
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
}

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

export function StatusReportDialog({
  isOpen,
  onOpenChange,
  emergencyContacts,
  currentUser,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyContacts: EmergencyContact[];
  currentUser: UserData | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prefill chat history
    const initialMessages: ChatMessage[] = [
      {
        id: 1,
        senderId: 1,
        senderName: emergencyContacts[0]?.name || "李其睿",
        senderAvatar: emergencyContacts[0]?.avatar || "/avatar/1.png",
        message: "大家都還好嗎？剛才地震很大",
        timestamp: "10:23",
      },
      {
        id: 2,
        senderId: "me",
        senderName: currentUser?.name || "我",
        senderAvatar: currentUser?.avatar || "/avatar/user.png",
        message: "我這邊還好，有點晃但沒事",
        timestamp: "10:24",
      },
      {
        id: 3,
        senderId: 2,
        senderName: emergencyContacts[1]?.name || "董教授",
        senderAvatar: emergencyContacts[1]?.avatar || "/avatar/2.png",
        message: "我在家裡，東西掉了一些，人沒事",
        timestamp: "10:25",
      },
      {
        id: 4,
        senderId: 3,
        senderName: emergencyContacts[2]?.name || "優路扣特",
        senderAvatar: emergencyContacts[2]?.avatar || "/avatar/3.png",
        message: "剛從辦公室跑出來，有點嚇到",
        timestamp: "10:26",
      },
      {
        id: 5,
        senderId: 4,
        senderName: emergencyContacts[3]?.name || "薩摩耶",
        senderAvatar: emergencyContacts[3]?.avatar || "/avatar/4.png",
        message: "家裡的書櫃倒了，正在整理",
        timestamp: "10:27",
      },
    ];
    setMessages(initialMessages);
  }, [emergencyContacts, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      senderId: "me",
      senderName: currentUser?.name || "我",
      senderAvatar: currentUser?.avatar || "/avatar/user.png",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-base">狀態回報</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>狀態回報</DialogTitle>
          <DialogDescription>與緊急聯絡人群組對話</DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.senderId === "me" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col gap-1 ${
                  msg.senderId === "me" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.senderId === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入訊息..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
              <span className="sr-only">發送</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { EmergencyContact, ChatMessage };
