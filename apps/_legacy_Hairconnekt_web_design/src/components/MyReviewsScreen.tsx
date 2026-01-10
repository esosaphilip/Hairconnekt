import { ArrowLeft, Star, ThumbsUp, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const reviews = [
  {
    id: 1,
    providerName: "Aisha Mohammed",
    providerBusiness: "Aisha's Braiding Studio",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "15. Okt 2025",
    service: "Box Braids",
    review: "Absolut fantastisch! Aisha ist sehr professionell und hat wunderschöne Box Braids gemacht. Ich komme definitiv wieder!",
    helpfulCount: 12,
  },
  {
    id: 2,
    providerName: "Fatima Hassan",
    providerBusiness: "Natural Hair Lounge",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "8. Okt 2025",
    service: "Cornrows",
    review: "Sehr zufrieden mit dem Ergebnis. Fatima nimmt sich Zeit und arbeitet sehr sorgfältig.",
    helpfulCount: 8,
  },
  {
    id: 3,
    providerName: "Lina Okafor",
    providerBusiness: null,
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 4,
    date: "1. Okt 2025",
    service: "Senegalese Twists",
    review: "Gute Arbeit, aber die Wartezeit war etwas länger als erwartet.",
    helpfulCount: 5,
  },
  {
    id: 4,
    providerName: "Sarah Williams",
    providerBusiness: "Braids & Beauty",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "24. Sep 2025",
    service: "Knotless Braids",
    review: "Perfekt! Die Braids sehen großartig aus und halten super.",
    helpfulCount: 15,
  },
  {
    id: 5,
    providerName: "Amina Johnson",
    providerBusiness: "Amina's Hair Art",
    providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    rating: 5,
    date: "18. Sep 2025",
    service: "Faux Locs",
    review: "Amina ist eine echte Künstlerin! Die Locs sind perfekt und sehen so natürlich aus.",
    helpfulCount: 10,
  },
];

export function MyReviewsScreen() {
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const avgRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Meine Bewertungen</h3>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-white px-4 py-6 mt-2">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl text-[#8B4513] mb-1">{avgRating}</div>
            <div className="flex justify-center mb-1">{renderStars(5)}</div>
            <div className="text-sm text-gray-600">Durchschnitt</div>
          </div>
          <div className="h-16 w-px bg-gray-200"></div>
          <div className="text-center">
            <div className="text-4xl text-[#8B4513] mb-1">{reviews.length}</div>
            <div className="text-sm text-gray-600">Bewertungen</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="px-4 py-4 space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            {/* Provider Info */}
            <Link
              to={`/provider/${review.id}`}
              className="flex items-center gap-3 mb-3 cursor-pointer"
              aria-label={`Profil von ${review.providerName} öffnen`}
            >
              <Avatar className="w-12 h-12">
                <ImageWithFallback
                  src={review.providerImage}
                  alt={review.providerName}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <div className="flex-1">
                <h5>{review.providerName}</h5>
                {review.providerBusiness && (
                  <p className="text-sm text-gray-500">{review.providerBusiness}</p>
                )}
              </div>
            </Link>

            {/* Rating & Date */}
            <div className="flex items-center justify-between mb-2">
              {renderStars(review.rating)}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {review.date}
              </div>
            </div>

            {/* Service */}
            <Badge variant="secondary" className="mb-3">
              {review.service}
            </Badge>

            {/* Review Text */}
            <p className="text-gray-700 mb-3">{review.review}</p>

            {/* Helpful Count */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span>{review.helpfulCount} Personen fanden dies hilfreich</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (if no reviews) */}
      {reviews.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="mb-2">Noch keine Bewertungen</h4>
          <p className="text-gray-600 mb-6">
            Buche deinen ersten Termin und bewerte deinen Braider!
          </p>
          <Button
            onClick={() => navigate("/search")}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            Braider finden
          </Button>
        </div>
      )}
    </div>
  );
}
