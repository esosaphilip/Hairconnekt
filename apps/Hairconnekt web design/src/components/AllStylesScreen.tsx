import { ArrowLeft, Clock, Filter, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const allStyles = [
  {
    id: 1,
    name: "Box Braids",
    category: "Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Cornrows",
    category: "Braids",
    price: "ab €35",
    duration: "2-3 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Senegalese Twists",
    category: "Twists",
    price: "ab €55",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 4,
    name: "Knotless Braids",
    category: "Braids",
    price: "ab €50",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 5,
    name: "Faux Locs",
    category: "Locs",
    price: "ab €65",
    duration: "5-6 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 6,
    name: "Passion Twists",
    category: "Twists",
    price: "ab €60",
    duration: "4-5 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 7,
    name: "Goddess Braids",
    category: "Braids",
    price: "ab €40",
    duration: "2-3 Std.",
    popularity: "Beliebt",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 8,
    name: "Fulani Braids",
    category: "Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    popularity: "Sehr beliebt",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const categories = ["Alle", "Braids", "Twists", "Locs"];

export function AllStylesScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const filteredStyles =
    selectedCategory === "Alle"
      ? allStyles
      : allStyles.filter((style) => style.category === selectedCategory);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Alle Styles</h3>
          <Button size="sm" variant="ghost">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-[#8B4513] hover:bg-[#5C2E0A]"
                  : ""
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-4">
          {filteredStyles.length} Style{filteredStyles.length !== 1 ? "s" : ""} gefunden
        </p>

        {/* Styles Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredStyles.map((style) => (
            <Link
              key={style.id}
              to="/search"
              state={{ style: style.name }}
              className="block"
              aria-label={`Style auswählen: ${style.name}`}
            >
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <ImageWithFallback
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white backdrop-blur-sm mb-2 text-xs"
                  >
                    {style.category}
                  </Badge>
                  <h5 className="mb-1">{style.name}</h5>
                  <div className="flex items-center justify-between text-xs">
                    <span>{style.price}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {style.duration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{style.popularity}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
