import { useState } from "react";
import {
  ArrowLeft,
  Gift,
  Plus,
  Tag,
  Calendar,
  Users,
  TrendingUp,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const vouchers = [
  {
    id: 1,
    code: "NEUKUNDE20",
    type: "percentage",
    value: 20,
    description: "20% Rabatt für Neukunden",
    validFrom: "01.10.2025",
    validUntil: "31.12.2025",
    usageLimit: 100,
    usedCount: 34,
    revenue: 2840,
    status: "active",
    minAmount: 50,
  },
  {
    id: 2,
    code: "SOMMER2025",
    type: "fixed",
    value: 15,
    description: "€15 Rabatt auf alle Services",
    validFrom: "01.06.2025",
    validUntil: "31.08.2025",
    usageLimit: 50,
    usedCount: 28,
    revenue: 1890,
    status: "active",
    minAmount: 80,
  },
  {
    id: 3,
    code: "TREUE10",
    type: "percentage",
    value: 10,
    description: "10% Rabatt für treue Kunden",
    validFrom: "01.01.2025",
    validUntil: "31.12.2025",
    usageLimit: null,
    usedCount: 156,
    revenue: 8920,
    status: "active",
    minAmount: 60,
  },
  {
    id: 4,
    code: "FRÜHJAHR2025",
    type: "percentage",
    value: 15,
    description: "Frühjahrs-Aktion",
    validFrom: "01.03.2025",
    validUntil: "31.05.2025",
    usageLimit: 80,
    usedCount: 80,
    revenue: 4560,
    status: "expired",
    minAmount: 70,
  },
];

export function ProviderVouchersScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "active" | "expired">("active");

  const filteredVouchers = vouchers.filter((v) => {
    if (filter === "active") return v.status === "active";
    if (filter === "expired") return v.status === "expired";
    return true;
  });

  const activeVouchers = vouchers.filter((v) => v.status === "active").length;
  const totalUsage = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
  const totalRevenue = vouchers.reduce((sum, v) => sum + v.revenue, 0);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" kopiert!`);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Gutscheine & Angebote</h3>
          <Button
            size="sm"
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => alert("Gutschein erstellen - Funktion in Entwicklung")}
          >
            <Plus className="w-4 h-4 mr-1" />
            Neu
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Gift className="w-4 h-4 text-[#8B4513]" />
              <span className="text-xs text-gray-600">Aktiv</span>
            </div>
            <div className="text-xl">{activeVouchers}</div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">Verwendet</span>
            </div>
            <div className="text-xl">{totalUsage}</div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600">Umsatz</span>
            </div>
            <div className="text-xl">€{totalRevenue.toLocaleString()}</div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
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
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            className={filter === "active" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Aktiv ({activeVouchers})
          </Button>
          <Button
            size="sm"
            variant={filter === "expired" ? "default" : "outline"}
            onClick={() => setFilter("expired")}
            className={filter === "expired" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Abgelaufen
          </Button>
        </div>

        {/* Vouchers List */}
        <div className="space-y-3">
          {filteredVouchers.map((voucher) => (
            <Card key={voucher.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4>{voucher.code}</h4>
                    <Badge
                      className={
                        voucher.status === "active"
                          ? "bg-green-500 text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      {voucher.status === "active" ? "Aktiv" : "Abgelaufen"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                  
                  {/* Discount Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B6B] bg-opacity-10 rounded-lg">
                    <Tag className="w-4 h-4 text-[#FF6B6B]" />
                    <span className="text-[#FF6B6B]">
                      {voucher.type === "percentage"
                        ? `${voucher.value}% Rabatt`
                        : `€${voucher.value} Rabatt`}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyCode(voucher.code)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Code kopieren
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Gültigkeitszeitraum</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{voucher.validFrom} - {voucher.validUntil}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Min. Bestellwert</p>
                  <span>€{voucher.minAmount}</span>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="mb-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-600">Verwendung</span>
                  <span>
                    {voucher.usedCount}
                    {voucher.usageLimit && ` / ${voucher.usageLimit}`} mal
                  </span>
                </div>
                {voucher.usageLimit && (
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8B4513]"
                      style={{
                        width: `${Math.min(
                          (voucher.usedCount / voucher.usageLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Revenue */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm text-gray-600">Generierter Umsatz</span>
                <span className="text-green-600">
                  €{voucher.revenue.toLocaleString()}
                </span>
              </div>

              {/* Copy Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3"
                onClick={() => copyCode(voucher.code)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Code kopieren
              </Button>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredVouchers.length === 0 && (
          <div className="text-center py-12 px-4">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="mb-2">Keine Gutscheine gefunden</h4>
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "Erstelle deinen ersten Gutschein"
                : `Keine ${filter === "active" ? "aktiven" : "abgelaufenen"} Gutscheine`}
            </p>
            <Button
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
              onClick={() => alert("Gutschein erstellen - Funktion in Entwicklung")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gutschein erstellen
            </Button>
          </div>
        )}

        {/* Info Card */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <h5 className="mb-2 text-blue-900">💡 Tipp</h5>
          <p className="text-sm text-blue-800">
            Gutscheine sind eine großartige Möglichkeit, neue Kunden zu gewinnen und
            bestehende Kunden zu belohnen. Erstelle zeitlich begrenzte Angebote für
            besondere Anlässe!
          </p>
        </Card>
      </div>
    </div>
  );
}
