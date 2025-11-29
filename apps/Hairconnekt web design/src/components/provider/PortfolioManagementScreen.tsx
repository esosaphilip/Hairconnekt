import { ArrowLeft, Plus, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { toast } from "sonner";

// Mock portfolio data
const mockPortfolio = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    title: "Box Braids - Medium Length",
    category: "Box Braids",
    views: 245,
    likes: 32,
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
    title: "Knotless Braids - Long",
    category: "Knotless Braids",
    views: 189,
    likes: 28,
    createdAt: "2025-01-10",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
    title: "Cornrows Styles",
    category: "Cornrows",
    views: 167,
    likes: 21,
    createdAt: "2025-01-05",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
    title: "Senegalese Twists",
    category: "Twists",
    views: 198,
    likes: 25,
    createdAt: "2024-12-28",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400",
    title: "Wedding Hairstyle",
    category: "Special Occasion",
    views: 312,
    likes: 45,
    createdAt: "2024-12-20",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
    title: "Passion Twists - Burgundy",
    category: "Passion Twists",
    views: 221,
    likes: 34,
    createdAt: "2024-12-15",
  },
];

export function PortfolioManagementScreen() {
  const navigate = useNavigate();

  const handleDelete = (_id) => {
    // Consume parameter to satisfy @typescript-eslint/no-unused-vars
    void _id;
    toast.success("Portfolio-Bild gelöscht");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h3>Portfolio</h3>
              <p className="text-sm text-gray-600">{mockPortfolio.length} Bilder</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/provider/portfolio/upload")}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hinzufügen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl text-[#8B4513]">
              {mockPortfolio.reduce((sum, item) => sum + item.views, 0)}
            </p>
            <p className="text-xs text-gray-600">Aufrufe gesamt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#8B4513]">
              {mockPortfolio.reduce((sum, item) => sum + item.likes, 0)}
            </p>
            <p className="text-xs text-gray-600">Likes gesamt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#8B4513]">{mockPortfolio.length}</p>
            <p className="text-xs text-gray-600">Bilder</p>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {mockPortfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bild löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchtest du dieses Bild wirklich aus deinem Portfolio löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="p-3">
              <h5 className="mb-1 text-sm line-clamp-1">{item.title}</h5>
              <Badge variant="outline" className="text-xs mb-2">
                {item.category}
              </Badge>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>❤️</span>
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockPortfolio.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h4 className="mb-2">Noch keine Portfolio-Bilder</h4>
          <p className="text-gray-600 text-center mb-6">
            Zeige deine besten Arbeiten und gewinne mehr Kunden
          </p>
          <Button
            onClick={() => navigate("/provider/portfolio/upload")}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            Erstes Bild hochladen
          </Button>
        </div>
      )}
    </div>
  );
}
