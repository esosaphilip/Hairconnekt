import { useState } from "react";
import { ArrowLeft, Check, Calendar as CalendarIcon, Clock, MapPin, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Calendar } from "./ui/calendar";
import { Separator } from "./ui/separator";
import { SignInPrompt } from "./SignInPrompt";
import { useAuth } from "@/contexts/AuthContext";

const services = [
  { id: 1, name: "Classic Box Braids", duration: "3-4 Std.", price: 55 },
  { id: 2, name: "Knotless Box Braids", duration: "4-5 Std.", price: 65 },
  { id: 3, name: "Simple Cornrows", duration: "2-3 Std.", price: 45 },
];

const timeSlots = {
  morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  afternoon: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
  evening: ["17:00", "17:30", "18:00", "18:30", "19:00"],
};

export function BookingFlow() {
  const [step, setStep] = useState<"services" | "datetime" | "details" | "confirmation">("services");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [mobileService, setMobileService] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Check authentication from context
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getTotalPrice = () => {
    const basePrice = selectedServices.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service?.price || 0);
    }, 0);
    return mobileService ? basePrice + 15 : basePrice;
  };

  const getTotalDuration = () => {
    const selected = services.filter(s => selectedServices.includes(s.id));
    return selected.map(s => s.duration).join(", ");
  };

  // Show sign-in prompt if user tries to book without authentication
  if (showSignInPrompt) {
    return <SignInPrompt returnUrl={`/booking/${id}`} />;
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-[bounce_0.5s_ease-in-out]">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="mb-2 text-center">Termin bestätigt! 🎉</h2>
        <p className="text-gray-600 text-center mb-8">
          Dein Termin wurde erfolgreich gebucht
        </p>

        <Card className="w-full max-w-md p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">Buchungsnummer</p>
            <p className="text-lg">#BK-20251028-0042</p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Datum:</span>
              <span>{selectedDate?.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "short" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uhrzeit:</span>
              <span>{selectedTime} Uhr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dauer:</span>
              <span>{getTotalDuration()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gesamtpreis:</span>
              <span className="text-[#8B4513]">€{getTotalPrice()}</span>
            </div>
          </div>
        </Card>

        <div className="w-full max-w-md space-y-3">
          <Button className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Zum Kalender hinzufügen
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/appointments")}
          >
            Zu meinen Terminen
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/home")}
          >
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => {
            if (step === "services") {
              navigate(-1);
            } else if (step === "datetime") {
              setStep("services");
            } else if (step === "details") {
              setStep("datetime");
            }
          }}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h4>
              {step === "services" && "Services auswählen"}
              {step === "datetime" && "Termin wählen"}
              {step === "details" && "Buchungsdetails"}
            </h4>
            <p className="text-sm text-gray-500">
              Schritt {step === "services" ? "1" : step === "datetime" ? "2" : "3"} von 3
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          <div className={`flex-1 h-1 rounded-full ${step === "services" || step === "datetime" || step === "details" ? "bg-[#8B4513]" : "bg-gray-200"}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step === "datetime" || step === "details" ? "bg-[#8B4513]" : "bg-gray-200"}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step === "details" ? "bg-[#8B4513]" : "bg-gray-200"}`}></div>
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Service Selection */}
        {step === "services" && (
          <div className="space-y-4">
            <h4 className="mb-4">Wähle deine Services</h4>
            {services.map((service) => (
              <Card
                key={service.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? "border-2 border-[#8B4513] bg-[#8B4513]/5"
                    : "border-2 border-transparent"
                }`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    selectedServices.includes(service.id)
                      ? "bg-[#8B4513] border-[#8B4513]"
                      : "border-gray-300"
                  }`}>
                    {selectedServices.includes(service.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-1">{service.name}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </span>
                      <span className="text-[#8B4513]">€{service.price}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === "datetime" && (
          <div className="space-y-6">
            <Card className="p-4">
              <h5 className="mb-3">Datum wählen</h5>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
            </Card>

            {selectedDate && (
              <Card className="p-4">
                <h5 className="mb-3">
                  Verfügbare Zeiten für {selectedDate.toLocaleDateString("de-DE", { day: "2-digit", month: "long" })}
                </h5>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Vormittag</p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.morning.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all ${
                            selectedTime === time
                              ? "border-[#8B4513] bg-[#8B4513] text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Nachmittag</p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.afternoon.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all ${
                            selectedTime === time
                              ? "border-[#8B4513] bg-[#8B4513] text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Abend</p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.evening.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all ${
                            selectedTime === time
                              ? "border-[#8B4513] bg-[#8B4513] text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === "details" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5>Mobiler Service</h5>
                <Switch
                  checked={mobileService}
                  onCheckedChange={setMobileService}
                />
              </div>
              {mobileService && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Musterstraße 123, 44137 Dortmund
                  </p>
                  <p className="text-sm text-[#8B4513]">
                    Zusätzliche Gebühr: +€15
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h5 className="mb-3">Notizen für den Braider</h5>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Teile besondere Wünsche, Allergien, Haarzustand etc. mit..."
                className="min-h-24"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">{notes.length}/500</p>
            </Card>

            <Card className="p-4">
              <h5 className="mb-3">Zahlungsmethode</h5>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    paymentMethod === "cash"
                      ? "border-[#8B4513] bg-[#8B4513]/5"
                      : "border-gray-200"
                  }`}
                >
                  💵 Vor Ort bar zahlen
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    paymentMethod === "card"
                      ? "border-[#8B4513] bg-[#8B4513]/5"
                      : "border-gray-200"
                  }`}
                >
                  💳 Kreditkarte
                </button>
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    paymentMethod === "paypal"
                      ? "border-[#8B4513] bg-[#8B4513]/5"
                      : "border-gray-200"
                  }`}
                >
                  PayPal
                </button>
              </div>
            </Card>

            <Card className="p-4">
              <h5 className="mb-2">Stornierungsbedingungen</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Kostenlose Stornierung bis 24 Std. vorher</p>
                <p>• 50% Gebühr bei Stornierung {'<'} 24 Std.</p>
                <p>• 100% Gebühr bei No-Show</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 max-w-[428px] mx-auto">
        {selectedServices.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Services ({selectedServices.length}):</span>
              <span>€{getTotalPrice() - (mobileService ? 15 : 0)}</span>
            </div>
            {mobileService && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Mobiler Service:</span>
                <span>€15</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Gesamtpreis:</span>
              <span className="text-xl text-[#8B4513]">€{getTotalPrice()}</span>
            </div>
          </div>
        )}

        <Button
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
          disabled={
            (step === "services" && selectedServices.length === 0) ||
            (step === "datetime" && (!selectedDate || !selectedTime))
          }
          onClick={() => {
            if (step === "services") {
              setStep("datetime");
            } else if (step === "datetime") {
              setStep("details");
            } else if (step === "details") {
              // Check authentication before proceeding to confirmation
              if (!isAuthenticated) {
                setShowSignInPrompt(true);
              } else {
                setStep("confirmation");
              }
            }
          }}
        >
          {step === "details" ? "Jetzt buchen" : "Weiter"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
