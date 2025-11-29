import { useState } from "react";
import { ArrowLeft, Upload, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { toast } from "sonner";

const categories = [
  "Box Braids",
  "Knotless Braids",
  "Cornrows",
  "Senegalese Twists",
  "Passion Twists",
  "Locs",
  "Natural Hair Care",
  "Special Occasion",
  "Barber Services",
  "Other",
];

export function UploadPortfolioScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error("Maximal 10 Bilder pro Upload erlaubt");
      return;
    }

    setImages([...images, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = typeof reader.result === "string" ? reader.result : "";
        setPreviewUrls(prev => [...prev, res]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Bitte mindestens ein Bild auswählen");
      return;
    }
    if (!formData.category) {
      toast.error("Bitte eine Kategorie auswählen");
      return;
    }

    toast.success("Portfolio-Bilder werden hochgeladen...");
    setTimeout(() => {
      toast.success("Portfolio erfolgreich aktualisiert!");
      navigate("/provider/portfolio");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h3>Portfolio hochladen</h3>
            <p className="text-sm text-gray-600">Zeige deine besten Arbeiten</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Image Upload */}
        <div>
          <Label>Bilder * (max. 10)</Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">
              Bilder hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG bis zu 10MB pro Bild
            </p>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="imageUpload"
            />
            <Button variant="outline" type="button" asChild>
              <label htmlFor="imageUpload" className="cursor-pointer">
                <Camera className="w-4 h-4 mr-2" />
                Bilder auswählen
              </label>
            </Button>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Titel (optional)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="z.B. 'Lange Box Braids mit Ombré'"
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Kategorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Beschreibung (optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Beschreibe den Style, verwendete Techniken, Dauer, etc."
            rows={4}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Eine gute Beschreibung hilft Kunden, deine Arbeit besser zu verstehen
          </p>
        </div>

        {/* Tips Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h5 className="mb-2 text-blue-900">💡 Tipps für gute Portfolio-Bilder</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Gute Beleuchtung verwenden</li>
            <li>• Verschiedene Winkel zeigen</li>
            <li>• Details hervorheben</li>
            <li>• Vorher-Nachher Vergleiche</li>
          </ul>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
          disabled={images.length === 0 || !formData.category}
        >
          Hochladen ({images.length} {images.length === 1 ? "Bild" : "Bilder"})
        </Button>
      </form>
    </div>
  );
}
