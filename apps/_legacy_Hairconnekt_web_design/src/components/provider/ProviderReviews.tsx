import { useState } from "react";
import { Star, Filter, TrendingUp, MessageCircle, ThumbsUp } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Textarea } from "../ui/textarea";

const reviews = [
  {
    id: 1,
    client: {
      name: "Sarah Müller",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 5,
    date: "vor 2 Tagen",
    service: "Box Braids",
    text: "Fantastisch! Meine Box Braids sehen perfekt aus und Aisha war super professionell. Die Atmosphäre war sehr entspannt und ich habe mich sehr wohl gefühlt. Kann ich nur weiterempfehlen!",
    helpful: 12,
    hasResponse: false,
    images: [],
  },
  {
    id: 2,
    client: {
      name: "Maria König",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 5,
    date: "vor 5 Tagen",
    service: "Cornrows",
    text: "Sehr professionell und freundlich. Die Cornrows halten super und sehen toll aus. Komme definitiv wieder!",
    helpful: 8,
    hasResponse: true,
    response: {
      text: "Vielen Dank für deine tolle Bewertung, Maria! Es war mir eine Freude, dich zu bedienen. Bis bald! 😊",
      date: "vor 5 Tagen",
    },
    images: [],
  },
  {
    id: 3,
    client: {
      name: "Lisa Werner",
      image: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100",
      verified: true,
    },
    rating: 4,
    date: "vor 1 Woche",
    service: "Senegalese Twists",
    text: "Sehr schöne Arbeit, aber die Wartezeit war etwas länger als erwartet. Ansonsten bin ich sehr zufrieden mit dem Ergebnis!",
    helpful: 5,
    hasResponse: true,
    response: {
      text: "Danke für dein Feedback, Lisa! Entschuldige die Wartezeit - ich arbeite daran, meine Zeitplanung zu verbessern. Freut mich, dass dir das Ergebnis gefällt!",
      date: "vor 1 Woche",
    },
    images: [],
  },
];

export function ProviderReviews() {
  const [filter, setFilter] = useState("all");
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  // Removed unused navigate to satisfy lint rule

  const filteredReviews = reviews.filter(review => {
    if (filter === "unresponded") return !review.hasResponse;
    if (filter === "5stars") return review.rating === 5;
    if (filter === "with-photos") return review.images.length > 0;
    return true;
  });

  const handleSubmitResponse = (reviewId: number) => {
    // Mock submit
    alert(`Response submitted for review ${reviewId}: ${responseText}`);
    setRespondingTo(null);
    setResponseText("");
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3>Bewertungen</h3>
          <button>
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Overall Rating Card */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl mb-1">4.8</div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= 4.8 ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">234 Bewertungen</p>
            </div>

            <div className="flex-1">
              {/* Rating Distribution */}
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stars === 5 ? 77 : stars === 4 ? 17 : stars === 3 ? 4 : 1;
                return (
                  <div key={stars} className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-8">{stars}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-10">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">+0.2 diesen Monat</span>
          </div>
        </Card>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Alle
          </Button>
          <Button
            size="sm"
            variant={filter === "unresponded" ? "default" : "outline"}
            onClick={() => setFilter("unresponded")}
            className={filter === "unresponded" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Unbeantwortet
            <Badge className="ml-1 bg-red-500 text-white text-xs">1</Badge>
          </Button>
          <Button
            size="sm"
            variant={filter === "5stars" ? "default" : "outline"}
            onClick={() => setFilter("5stars")}
            className={filter === "5stars" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            5 Sterne
          </Button>
          <Button
            size="sm"
            variant={filter === "with-photos" ? "default" : "outline"}
            onClick={() => setFilter("with-photos")}
            className={filter === "with-photos" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Mit Fotos
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="px-4 py-4 space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-4">
            {/* Client Info */}
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <ImageWithFallback
                  src={review.client.image}
                  alt={review.client.name}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5>{review.client.name}</h5>
                  {review.client.verified && (
                    <Badge variant="outline" className="text-xs">
                      Verifiziert
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </div>
            </div>

            {/* Service Tag */}
            <Badge variant="secondary" className="mb-2 text-xs">
              {review.service}
            </Badge>

            {/* Review Text */}
            <p className="text-sm text-gray-700 mb-3">{review.text}</p>

            {/* Helpful Count */}
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <ThumbsUp className="w-3 h-3" />
              <span>{review.helpful} fanden das hilfreich</span>
            </div>

            {/* Provider Response */}
            {review.hasResponse && review.response && (
              <div className="bg-gray-50 rounded-lg p-3 ml-4 border-l-2 border-[#8B4513]">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-[#8B4513]" />
                  <span className="text-sm">Antwort von Aisha&apos;s Braiding Studio</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{review.response.text}</p>
                <p className="text-xs text-gray-500">{review.response.date}</p>
              </div>
            )}

            {/* Response Form */}
            {!review.hasResponse && respondingTo === review.id ? (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <Textarea
                  placeholder="Deine Antwort..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitResponse(review.id)}
                    className="bg-[#8B4513] hover:bg-[#5C2E0A]"
                  >
                    Antwort senden
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRespondingTo(null);
                      setResponseText("");
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : !review.hasResponse ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-[#8B4513] border-[#8B4513]"
                onClick={() => setRespondingTo(review.id)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Antworten
              </Button>
            ) : null}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12 px-4">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="mb-2">Keine Bewertungen gefunden</h4>
          <p className="text-gray-600 mb-4">
            {filter === "all"
              ? "Noch keine Bewertungen vorhanden"
              : "Keine Bewertungen in dieser Kategorie"}
          </p>
          {filter !== "all" && (
            <Button variant="outline" onClick={() => setFilter("all")}>
              Alle Bewertungen anzeigen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
