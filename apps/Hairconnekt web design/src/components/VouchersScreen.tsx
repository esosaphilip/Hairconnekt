import { ArrowLeft, Gift, Copy, Check, Calendar, Tag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

const activeVouchers = [
  {
    id: 1,
    code: "WELCOME20",
    title: "Willkommensrabatt",
    description: "20% Rabatt auf deine erste Buchung",
    discount: "20%",
    minAmount: 50,
    expiryDate: "31. Dez 2025",
    applicable: "Alle Services",
  },
  {
    id: 2,
    code: "BOXBRAIDS10",
    title: "Box Braids Special",
    description: "€10 Rabatt auf Box Braids",
    discount: "€10",
    minAmount: 40,
    expiryDate: "30. Nov 2025",
    applicable: "Nur Box Braids",
  },
];

const usedVouchers = [
  {
    id: 3,
    code: "SUMMER25",
    title: "Sommeraktion",
    description: "€25 Rabatt auf alle Services",
    discount: "€25",
    usedDate: "15. Okt 2025",
    savedAmount: "€25",
  },
];

export function VouchersScreen() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  const handleCopyCode = async (code, id) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback method for browsers without Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          textArea.remove();
          toast.error("Kopieren fehlgeschlagen. Bitte manuell kopieren.");
          return;
        }
      }
      setCopiedId(id);
      toast.success("Code kopiert!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Kopieren fehlgeschlagen. Bitte manuell kopieren.");
    }
  };

  const handleRedeemCode = () => {
    if (promoCode.trim()) {
      // In real app, this would validate and add the voucher
      alert(`Gutscheincode "${promoCode}" wird eingelöst...`);
      setPromoCode("");
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Gutscheine & Rabatte</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Add Promo Code */}
        <Card className="p-4 mb-6">
          <h5 className="mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#8B4513]" />
            Gutscheincode einlösen
          </h5>
          <div className="flex gap-2">
            <Input
              placeholder="Code eingeben"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button
              onClick={handleRedeemCode}
              disabled={!promoCode.trim()}
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              Einlösen
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">
              Aktiv ({activeVouchers.length})
            </TabsTrigger>
            <TabsTrigger value="used">
              Verwendet ({usedVouchers.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Vouchers */}
          <TabsContent value="active" className="space-y-3 mt-0">
            {activeVouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className="p-4 border-2 border-dashed border-[#8B4513] bg-gradient-to-br from-amber-50 to-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-5 h-5 text-[#8B4513]" />
                      <h5>{voucher.title}</h5>
                    </div>
                    <p className="text-gray-600 mb-2">{voucher.description}</p>
                  </div>
                  <Badge className="bg-[#8B4513] text-white text-lg px-3 py-1">
                    {voucher.discount}
                  </Badge>
                </div>

                {/* Voucher Code */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Code:</p>
                      <code className="text-lg tracking-wider">
                        {voucher.code}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(voucher.code, voucher.id)}
                    >
                      {copiedId === voucher.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Kopiert
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Kopieren
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Mindestbetrag: €{voucher.minAmount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Gültig bis: {voucher.expiryDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span>Anwendbar auf: {voucher.applicable}</span>
                  </div>
                </div>
              </Card>
            ))}

            {activeVouchers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Keine aktiven Gutscheine</h4>
                <p className="text-gray-600">
                  Löse einen Code ein oder warte auf neue Angebote!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Used Vouchers */}
          <TabsContent value="used" className="space-y-3 mt-0">
            {usedVouchers.map((voucher) => (
              <Card key={voucher.id} className="p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-5 h-5 text-gray-400" />
                      <h5 className="text-gray-600">{voucher.title}</h5>
                    </div>
                    <p className="text-gray-500 mb-2">{voucher.description}</p>
                  </div>
                  <Badge variant="secondary">Verwendet</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Verwendet am {voucher.usedDate}
                  </span>
                  <span className="text-green-600">
                    Gespart: {voucher.savedAmount}
                  </span>
                </div>
              </Card>
            ))}

            {usedVouchers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Keine verwendeten Gutscheine</h4>
                <p className="text-gray-600">
                  Deine verwendeten Gutscheine erscheinen hier.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-100">
          <h5 className="mb-2 text-blue-900">Gutschein-Tipps</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Gutscheine können nur einmal verwendet werden</li>
            <li>• Pro Buchung kann nur ein Gutschein eingelöst werden</li>
            <li>• Prüfe das Ablaufdatum vor der Verwendung</li>
            <li>• Manche Gutscheine haben einen Mindestbestellwert</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
