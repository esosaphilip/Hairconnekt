import { useState } from "react";
import { TrendingUp, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const weeklyData = [
  { day: "Mo", amount: 180, appointments: 2 },
  { day: "Di", amount: 245, appointments: 3 },
  { day: "Mi", amount: 0, appointments: 0 },
  { day: "Do", amount: 320, appointments: 4 },
  { day: "Fr", amount: 280, appointments: 3 },
  { day: "Sa", amount: 540, appointments: 6 },
  { day: "So", amount: 380, appointments: 4 },
];

const recentTransactions = [
  {
    id: 1,
    date: "28. Okt. 14:30",
    client: "Sarah Müller",
    service: "Box Braids",
    gross: 95,
    fee: 9.5,
    net: 85.5,
    status: "paid",
  },
  {
    id: 2,
    date: "27. Okt. 18:00",
    client: "Lisa Werner",
    service: "Cornrows",
    gross: 65,
    fee: 6.5,
    net: 58.5,
    status: "paid",
  },
  {
    id: 3,
    date: "27. Okt. 14:00",
    client: "Maria König",
    service: "Senegalese Twists",
    gross: 115,
    fee: 11.5,
    net: 103.5,
    status: "pending",
  },
];

export function ProviderEarnings() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const navigate = useNavigate();

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3>Einnahmen & Auszahlungen</h3>
          <button>
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="px-4 py-4 space-y-3">
        <Card className="p-5 bg-gradient-to-br from-[#8B4513] to-[#5C2E0A] text-white">
          <p className="text-sm opacity-90 mb-2">Verfügbares Guthaben</p>
          <h1 className="mb-4">€1,245.50</h1>
          <Button
            className="w-full bg-white text-[#8B4513] hover:bg-gray-100"
            onClick={() => navigate("/provider/earnings/payout-request")}
          >
            Auszahlung beantragen
          </Button>
          <p className="text-xs text-center mt-2 opacity-75">Bereit zur Auszahlung</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ausstehende Zahlungen</p>
              <h3>€350.00</h3>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Ausstehend
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                Nach Terminabschluss
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings Chart */}
      <div className="px-4 mb-4">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4>Einnahmen-Übersicht</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={period === "week" ? "default" : "outline"}
                onClick={() => setPeriod("week")}
                className={period === "week" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
              >
                Woche
              </Button>
              <Button
                size="sm"
                variant={period === "month" ? "default" : "outline"}
                onClick={() => setPeriod("month")}
                className={period === "month" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
              >
                Monat
              </Button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40 mb-2">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-[#8B4513] rounded-t hover:bg-[#5C2E0A] transition-colors cursor-pointer relative group"
                    style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      €{data.amount}
                      <br />
                      {data.appointments} Termine
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div>
              <p className="text-sm text-gray-600">Gesamt diese Woche</p>
              <h4 className="text-green-600">€1,945</h4>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+18%</span>
              </div>
              <p className="text-xs text-gray-500">vs. letzte Woche</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h4>Letzte Transaktionen</h4>
          <button
            onClick={() => navigate("/provider/earnings/transactions")}
            className="text-sm text-[#8B4513] hover:underline"
          >
            Alle anzeigen
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5>{transaction.client}</h5>
                  <p className="text-sm text-gray-600">{transaction.service}</p>
                </div>
                <Badge
                  className={
                    transaction.status === "paid"
                      ? "bg-green-500 text-white"
                      : "bg-amber-500 text-white"
                  }
                >
                  {transaction.status === "paid" ? "Bezahlt" : "Ausstehend"}
                </Badge>
              </div>

              <div className="text-xs text-gray-600 space-y-1 mb-2">
                <div className="flex justify-between">
                  <span>Betrag:</span>
                  <span>€{transaction.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Gebühr (10%):</span>
                  <span>-€{transaction.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-900">Deine Einnahmen:</span>
                  <span className="text-green-600">€{transaction.net.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">{transaction.date}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Service Performance */}
      <div className="px-4 mt-6">
        <h4 className="mb-3">Leistungsstärkste Services</h4>
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h5>Box Braids</h5>
              <p className="text-sm text-gray-600">24 Buchungen</p>
            </div>
            <div className="text-right">
              <h5 className="text-[#8B4513]">€2,280</h5>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+8%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h5>Cornrows</h5>
              <p className="text-sm text-gray-600">18 Buchungen</p>
            </div>
            <div className="text-right">
              <h5 className="text-[#8B4513]">€1,170</h5>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+5%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h5>Senegalese Twists</h5>
              <p className="text-sm text-gray-600">12 Buchungen</p>
            </div>
            <div className="text-right">
              <h5 className="text-[#8B4513]">€1,380</h5>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>→ Stabil</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
