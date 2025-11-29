import { useState } from "react";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, Phone, Video, MoreVertical, Calendar } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";

// Mock chat data
const mockChats: Record<string, {
  provider: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  messages: {
    id: string;
    sender: "me" | "them";
    text: string;
    time: string;
    status?: "sent" | "delivered" | "read";
  }[];
}> = {
  "1": {
    provider: {
      id: "1",
      name: "Sarah Mueller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      isOnline: true,
    },
    messages: [
      {
        id: "1",
        sender: "them",
        text: "Hallo! Ich freue mich auf deinen Termin morgen 😊",
        time: "10:30",
        status: "read",
      },
      {
        id: "2",
        sender: "me",
        text: "Vielen Dank! Ich freue mich auch. Kann ich meine eigenen Extensions mitbringen?",
        time: "10:32",
        status: "read",
      },
      {
        id: "3",
        sender: "them",
        text: "Natürlich! Das ist kein Problem. Bitte bring sie morgen mit.",
        time: "10:35",
        status: "read",
      },
      {
        id: "4",
        sender: "me",
        text: "Super, bis morgen dann!",
        time: "10:40",
        status: "read",
      },
    ],
  },
  "2": {
    provider: {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isOnline: false,
    },
    messages: [
      {
        id: "1",
        sender: "them",
        text: "Guten Tag! Danke für deine Buchung.",
        time: "14:20",
        status: "read",
      },
      {
        id: "2",
        sender: "me",
        text: "Hallo! Wie lange dauert die Behandlung ungefähr?",
        time: "14:25",
        status: "delivered",
      },
    ],
  },
};

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockChats[id || "1"]?.messages || []);

  const chat = mockChats[id || "1"];

  if (!chat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="mb-2">Chat nicht gefunden</h3>
          <Button onClick={() => navigate("/messages")}>Zurück zu Nachrichten</Button>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: "me" as const,
        text: message,
        time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        status: "sent" as const,
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" as const } : msg
          )
        );
      }, 1000);
    }
  };

  const handleAttachment = () => {
    toast.info("Anhang-Funktion kommt bald");
  };

  const handleCall = (type: "voice" | "video") => {
    toast.info(`${type === "voice" ? "Sprach" : "Video"}anruf kommt bald`);
  };

  const handleBooking = () => {
    navigate(`/booking/${chat.provider.id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/messages")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <Link to={`/provider/${chat.provider.id}`} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <img src={chat.provider.avatar} alt={chat.provider.name} className="object-cover" />
            </Avatar>
            {chat.provider.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm">{chat.provider.name}</h4>
            <p className="text-xs text-gray-500">
              {chat.provider.isOnline ? "Online" : "Zuletzt online vor 2 Std."}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={() => handleCall("voice")} className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => handleCall("video")} className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/provider/${chat.provider.id}`)}>
                Profil ansehen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBooking}>
                <Calendar className="w-4 h-4 mr-2" />
                Termin buchen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Funktion kommt bald")}>
                Chat stummschalten
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => toast.info("Funktion kommt bald")}>
                Chat löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-4">
          <div className="bg-gray-200 px-3 py-1 rounded-full">
            <p className="text-xs text-gray-600">Heute</p>
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2 max-w-[75%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
              {msg.sender === "them" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <img src={chat.provider.avatar} alt="" className="object-cover" />
                </Avatar>
              )}
              <div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.sender === "me"
                      ? "bg-[#8B4513] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === "me" ? "justify-end" : ""}`}>
                  <p className="text-xs text-gray-500">{msg.time}</p>
                  {msg.sender === "me" && msg.status && (
                    <span className="text-xs text-gray-500">
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "read" && <span className="text-blue-500">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <button onClick={handleAttachment} className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleAttachment} className="p-2 hover:bg-gray-100 rounded-full">
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nachricht schreiben..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="bg-[#8B4513] hover:bg-[#5C2E0A] rounded-full w-10 h-10"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
