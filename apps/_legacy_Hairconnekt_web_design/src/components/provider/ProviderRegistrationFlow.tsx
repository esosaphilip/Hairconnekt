import { useState } from "react";
import { ArrowLeft, Check, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingEmails: boolean;

  // Step 2: Business Info
  businessName: string;
  businessTypes: string[];
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  state: string;
  showOnMap: boolean;
  serviceRadius: number;
  businessLicense: string;
  taxId: string;

  // Step 3: Services & Expertise
  serviceCategories: string[];
  yearsExperience: number;
  languages: string[];
  specializations: string[];

  // Step 4: Verification
  idDocument: File | null;
  businessDocument: File | null;
  certificates: File[];
  profilePicture: File | null;
  portfolioImages: File[];
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  acceptPrivacy: false,
  marketingEmails: false,

  businessName: "",
  businessTypes: [],
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  state: "",
  showOnMap: true,
  serviceRadius: 10,
  businessLicense: "",
  taxId: "",

  serviceCategories: [],
  yearsExperience: 5,
  languages: [],
  specializations: [],

  idDocument: null,
  businessDocument: null,
  certificates: [],
  profilePicture: null,
  portfolioImages: [],
};

export function ProviderRegistrationFlow() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const navigate = useNavigate();

  const progress = (step / 5) * 100;

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 33;
    if (/[A-Z]/.test(password)) strength += 33;
    if (/[0-9]/.test(password)) strength += 34;
    return strength;
  };

  const canProceedStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.includes("@") &&
      formData.phone.trim() !== "" &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms &&
      formData.acceptPrivacy
    );
  };

  const canProceedStep2 = () => {
    return (
      formData.businessTypes.length > 0 &&
      formData.postalCode.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== ""
    );
  };

  const canProceedStep3 = () => {
    return formData.serviceCategories.length > 0 && formData.languages.length > 0;
  };

  const canProceedStep4 = () => {
    return (
      formData.idDocument !== null &&
      formData.profilePicture !== null &&
      formData.portfolioImages.length >= 3
    );
  };

  const handleFileUpload = (field: keyof FormData, file: File | null) => {
    setFormData({ ...formData, [field]: file });
    if (file) {
      toast.success(`${file.name} hochgeladen`);
    }
  };

  const handleSubmit = () => {
    // Mock submission
    toast.success("Profil wird zur Prüfung eingereicht...");
    setTimeout(() => {
      navigate("/provider/pending-approval");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          {step > 1 && (
            <button onClick={() => setStep((step - 1) as Step)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <h4>Anbieter-Registrierung</h4>
            <p className="text-sm text-gray-500">Schritt {step} von 5</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="p-6 pb-32">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Persönliche Angaben</h3>
              <p className="text-gray-600 text-sm">Grundlegende Informationen für dein Konto</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="max.mueller@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">Wird zur Anmeldung verwendet</p>
            </div>

            <div>
              <Label htmlFor="phone">Telefonnummer *</Label>
              <div className="flex gap-2 mt-1">
                <Input value="+49" className="w-16" disabled />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="151 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Passwort *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
              {formData.password && (
                <>
                  <Progress value={passwordStrength()} className="mt-2 h-1" />
                  <div className="mt-2 space-y-1 text-xs">
                    <p className={formData.password.length >= 8 ? "text-green-600" : "text-gray-400"}>
                      ✓ Min. 8 Zeichen
                    </p>
                    <p className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                      ✓ 1 Großbuchstabe
                    </p>
                    <p className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                      ✓ 1 Zahl
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Passwort wiederholen *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptTerms: checked === true })
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                  Ich akzeptiere die{" "}
                  <button type="button" className="text-[#8B4513] hover:underline">
                    AGB für Anbieter
                  </button>{" "}
                  *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptPrivacy: checked === true })
                  }
                />
                <Label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
                  Ich akzeptiere die{" "}
                  <button type="button" className="text-[#8B4513] hover:underline">
                    Datenschutzerklärung
                  </button>{" "}
                  *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingEmails}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, marketingEmails: checked === true })
                  }
                />
                <Label htmlFor="marketing" className="text-sm text-gray-600 cursor-pointer">
                  Ich möchte Marketing-E-Mails erhalten (optional)
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Über dein Business</h3>
              <p className="text-gray-600 text-sm">Geschäftsinformationen</p>
            </div>

            <div>
              <Label htmlFor="businessName">Business-Name (optional)</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-1"
                placeholder="z.B. 'Marias Braiding Studio'"
              />
            </div>

            <div>
              <Label>Business-Typ *</Label>
              <div className="space-y-2 mt-2">
                {["Freelancer", "Salon", "Barber", "Mobil"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.businessTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            businessTypes: [...formData.businessTypes, type],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            businessTypes: formData.businessTypes.filter((t) => t !== type),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={type} className="cursor-pointer">
                      {type === "Freelancer" && "Einzelperson / Freelancer"}
                      {type === "Salon" && "Salon / Barbershop"}
                      {type === "Barber" && "Barber"}
                      {type === "Mobil" && "Mobiler Service"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {!formData.businessTypes.includes("Mobil") && (
              <div>
                <h5 className="mb-3">Geschäftsadresse</h5>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="street">Straße</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="houseNumber">Nr.</Label>
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber}
                        onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="postalCode">PLZ *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="city">Stadt *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state">Bundesland *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Wähle ein Bundesland" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NRW">Nordrhein-Westfalen</SelectItem>
                        <SelectItem value="BY">Bayern</SelectItem>
                        <SelectItem value="BW">Baden-Württemberg</SelectItem>
                        <SelectItem value="BE">Berlin</SelectItem>
                        <SelectItem value="HH">Hamburg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showOnMap"
                      checked={formData.showOnMap}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, showOnMap: checked === true })
                      }
                    />
                    <Label htmlFor="showOnMap" className="text-sm cursor-pointer">
                      Meine Adresse auf Google Maps anzeigen
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {formData.businessTypes.includes("Mobil") && (
              <div>
                <Label>Service-Radius (km)</Label>
                <div className="mt-3">
                  <Slider
                    value={[formData.serviceRadius]}
                    onValueChange={(value) => setFormData({ ...formData, serviceRadius: value[0] })}
                    max={50}
                    step={5}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Ich biete Service im Umkreis von {formData.serviceRadius} km an
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Services & Expertise */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Deine Dienstleistungen</h3>
              <p className="text-gray-600 text-sm">Wähle deine Spezialisierungen</p>
            </div>

            <div>
              <Label>Service-Kategorien *</Label>
              <div className="space-y-3 mt-2">
                {[
                  "Box Braids",
                  "Knotless Braids",
                  "Cornrows",
                  "Senegalese Twists",
                  "Passion Twists",
                  "Locs",
                  "Barber Services",
                  "Natural Hair Care",
                ].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.serviceCategories.includes(service)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            serviceCategories: [...formData.serviceCategories, service],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            serviceCategories: formData.serviceCategories.filter(
                              (s) => s !== service
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={service} className="cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Jahre Erfahrung</Label>
              <div className="mt-3">
                <Slider
                  value={[formData.yearsExperience]}
                  onValueChange={(value) => setFormData({ ...formData, yearsExperience: value[0] })}
                  max={30}
                  step={1}
                />
                <p className="text-sm text-gray-600 mt-2">{formData.yearsExperience} Jahre</p>
              </div>
            </div>

            <div>
              <Label>Sprachen *</Label>
              <div className="space-y-2 mt-2">
                {["Deutsch", "Englisch", "Französisch", "Spanisch", "Türkisch", "Arabisch"].map(
                  (lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              languages: [...formData.languages, lang],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              languages: formData.languages.filter((l) => l !== lang),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={lang} className="cursor-pointer">
                        {lang}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <Label>Spezialisierungen (optional)</Label>
              <div className="space-y-2 mt-2">
                {[
                  "Kinderfreundlich",
                  "Lange Haare Spezialist",
                  "Hochzeitsstyling",
                  "Natürliche Produkte",
                  "Männer-Styling",
                ].map((spec) => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      id={spec}
                      checked={formData.specializations.includes(spec)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            specializations: [...formData.specializations, spec],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            specializations: formData.specializations.filter((s) => s !== spec),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={spec} className="cursor-pointer">
                      {spec}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Verifizierung</h3>
              <p className="text-gray-600 text-sm">
                Um die Sicherheit für alle zu gewährleisten, bitten wir um folgende Dokumente
              </p>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                🔒 Deine Daten werden vertraulich behandelt und sicher verschlüsselt
              </p>
            </Card>

            <div>
              <Label>Identitätsnachweis *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Personalausweis oder Reisepass</p>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload("idDocument", e.target.files?.[0] || null)}
                  className="hidden"
                  id="idDocument"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="idDocument" className="cursor-pointer">
                    Datei auswählen
                  </label>
                </Button>
                {formData.idDocument && (
                  <p className="text-xs text-green-600 mt-2">✓ {formData.idDocument.name}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Profilbild *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Dein öffentliches Profilbild</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("profilePicture", e.target.files?.[0] || null)}
                  className="hidden"
                  id="profilePicture"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="profilePicture" className="cursor-pointer">
                    Foto hochladen
                  </label>
                </Button>
                {formData.profilePicture && (
                  <p className="text-xs text-green-600 mt-2">✓ {formData.profilePicture.name}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Portfolio (min. 3 Bilder) *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Zeige deine besten Arbeiten</p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, portfolioImages: files });
                    if (files.length > 0) {
                      toast.success(`${files.length} Bilder ausgewählt`);
                    }
                  }}
                  className="hidden"
                  id="portfolio"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="portfolio" className="cursor-pointer">
                    Fotos hinzufügen
                  </label>
                </Button>
                {formData.portfolioImages.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {formData.portfolioImages.length} Bilder ausgewählt
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Zusammenfassung</h3>
              <p className="text-gray-600 text-sm">
                Bitte überprüfe deine Angaben bevor du dein Profil einreichst
              </p>
            </div>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h5>Persönliche Informationen</h5>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Bearbeiten
                </Button>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                <p>
                  {formData.firstName} {formData.lastName}
                </p>
                <p>{formData.email}</p>
                <p>+49 {formData.phone}</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h5>Geschäftsinformationen</h5>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Bearbeiten
                </Button>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                {formData.businessName && <p>{formData.businessName}</p>}
                <p>{formData.businessTypes.join(", ")}</p>
                {formData.city && (
                  <p>
                    {formData.postalCode} {formData.city}
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h5>Services & Expertise</h5>
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  Bearbeiten
                </Button>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                <p>{formData.serviceCategories.join(", ")}</p>
                <p>{formData.yearsExperience} Jahre Erfahrung</p>
                <p>Sprachen: {formData.languages.join(", ")}</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h5>Verifizierung</h5>
                <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                  Bearbeiten
                </Button>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                <p>✓ Identitätsnachweis hochgeladen</p>
                <p>✓ Profilbild hochgeladen</p>
                <p>✓ Portfolio ({formData.portfolioImages.length} Bilder)</p>
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <h5 className="mb-3">Was passiert jetzt?</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Profil eingereicht</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span className="text-gray-600">Überprüfung (1-3 Werktage)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span className="text-gray-600">Freischaltung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span className="text-gray-600">Start!</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Du erhältst eine E-Mail sobald dein Profil genehmigt wurde
              </p>
            </Card>

            <div className="flex items-start space-x-2">
              <Checkbox id="confirm" required />
              <Label htmlFor="confirm" className="text-sm cursor-pointer">
                Ich bestätige, dass alle Angaben korrekt sind
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-[428px] mx-auto">
        <Button
          onClick={() => {
            if (step < 5) {
              const canProceed =
                (step === 1 && canProceedStep1()) ||
                (step === 2 && canProceedStep2()) ||
                (step === 3 && canProceedStep3()) ||
                (step === 4 && canProceedStep4());

              if (canProceed) {
                setStep((step + 1) as Step);
                window.scrollTo(0, 0);
              } else {
                toast.error("Bitte fülle alle Pflichtfelder aus");
              }
            } else {
              handleSubmit();
            }
          }}
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
        >
          {step < 5 ? `Weiter zu Schritt ${step + 1}` : "Profil zur Prüfung einreichen"}
        </Button>
        {step > 1 && (
          <Button variant="ghost" onClick={() => setStep((step - 1) as Step)} className="w-full mt-2">
            Zurück
          </Button>
        )}
      </div>
    </div>
  );
}
