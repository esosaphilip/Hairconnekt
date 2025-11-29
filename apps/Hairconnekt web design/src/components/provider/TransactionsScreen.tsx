import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Euro,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const transactions = [
  {
    id: 1,
    date: "28. Okt. 14:30",
    client: "Sarah Müller",
    service: "Box Braids + Styling",
    gross: 95,
    fee: 9.5,
    net: 85.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 2,
    date: "27. Okt. 18:00",
    client: "Lisa Werner",
    service: "Cornrows",
    gross: 65,
    fee: 6.5,
    net: 58.5,
    status: "completed",
    type: "booking",
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
    type: "booking",
  },
  {
    id: 4,
    date: "26. Okt. 16:45",
    client: "Anna Schmidt",
    service: "Knotless Braids",
    gross: 105,
    fee: 10.5,
    net: 94.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 5,
    date: "25. Okt. 15:00",
    type: "payout",
    description: "Auszahlung auf Bankkonto",
    amount: -950,
    status: "completed",
  },
  {
    id: 6,
    date: "25. Okt. 11:30",
    client: "Eva Müller",
    service: "Passion Twists",
    gross: 95,
    fee: 9.5,
    net: 85.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 7,
    date: "24. Okt. 17:00",
    client: "Sophie Wagner",
    service: "Box Braids",
    gross: 85,
    fee: 8.5,
    net: 76.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 8,
    date: "24. Okt. 13:00",
    client: "Laura Klein",
    service: "Cornrows + Styling",
    gross: 75,
    fee: 7.5,
    net: 67.5,
    status: "refunded",
    type: "booking",
  },
  {
    id: 9,
    date: "23. Okt. 16:00",
    client: "Nina Hoffmann",
    service: "Senegalese Twists",
    gross: 115,
    fee: 11.5,
    net: 103.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 10,
    date: "23. Okt. 10:00",
    client: "Julia Becker",
    service: "Faux Locs",
    gross: 125,
    fee: 12.5,
    net: 112.5,
    status: "completed",
    type: "booking",
  },
  {
    id: 11,
    date: "15. Okt. 09:00",
    type: "subscription",
    description: "Pro Abonnement",
    amount: -29.99,
    status: "completed",
  },
];

export function TransactionsScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "bookings" | "payouts" | "fees">("all");
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "bookings") return t.type === "booking";
    if (filter === "payouts") return t.type === "payout";
    if (filter === "fees") return t.type === "subscription";
    return true;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "booking" && t.status === "completed")
    .reduce((sum, t) => sum + (t.net || 0), 0);

  const totalPayouts = transactions
    .filter((t) => t.type === "payout")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Alle Transaktionen</h3>
          <Button size="sm" variant="ghost">
            <Download className="w-5 h-5" />
          </Button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-3">
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
          <Button
            size="sm"
            variant={period === "all" ? "default" : "outline"}
            onClick={() => setPeriod("all")}
            className={period === "all" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Alle
          </Button>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
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
            variant={filter === "bookings" ? "default" : "outline"}
            onClick={() => setFilter("bookings")}
            className={filter === "bookings" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Buchungen
          </Button>
          <Button
            size="sm"
            variant={filter === "payouts" ? "default" : "outline"}
            onClick={() => setFilter("payouts")}
            className={filter === "payouts" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Auszahlungen
          </Button>
          <Button
            size="sm"
            variant={filter === "fees" ? "default" : "outline"}
            onClick={() => setFilter("fees")}
            className={filter === "fees" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Gebühren
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Einnahmen</span>
            </div>
            <div className="text-2xl text-green-600 mb-1">
              €{totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Dieser Monat</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Auszahlungen</span>
            </div>
            <div className="text-2xl text-red-600 mb-1">
              €{totalPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Dieser Monat</p>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              {transaction.type === "booking" ? (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5>{transaction.client}</h5>
                      <p className="text-sm text-gray-600">{transaction.service}</p>
                    </div>
                    <Badge
                      className={
                        transaction.status === "completed"
                          ? "bg-green-500 text-white"
                          : transaction.status === "pending"
                          ? "bg-amber-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {transaction.status === "completed"
                        ? "Abgeschlossen"
                        : transaction.status === "pending"
                        ? "Ausstehend"
                        : "Erstattet"}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span>Betrag:</span>
                      <span>€{transaction.gross?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Gebühr (10%):</span>
                      <span>-€{transaction.fee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-900">Deine Einnahmen:</span>
                      <span
                        className={
                          transaction.status === "refunded"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {transaction.status === "refunded" ? "-" : ""}€
                        {transaction.net?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{transaction.date}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5>
                        {transaction.type === "payout"
                          ? "Auszahlung"
                          : "Abonnement"}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                    </div>
                    <Badge
                      className={
                        transaction.status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-amber-500 text-white"
                      }
                    >
                      {transaction.status === "completed"
                        ? "Abgeschlossen"
                        : "Ausstehend"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Betrag:</span>
                    <span className="text-lg text-red-600">
                      -€{Math.abs(transaction.amount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{transaction.date}</span>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 px-4">
            <Euro className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="mb-2">Keine Transaktionen gefunden</h4>
            <p className="text-gray-600">
              {filter === "all"
                ? "Noch keine Transaktionen vorhanden"
                : `Keine ${
                    filter === "bookings"
                      ? "Buchungen"
                      : filter === "payouts"
                      ? "Auszahlungen"
                      : "Gebühren"
                  } in diesem Zeitraum`}
            </p>
          </div>
        )}

        {/* Export Button */}
        <Card className="p-4 mt-6">
          <h5 className="mb-2">Transaktionen exportieren</h5>
          <p className="text-sm text-gray-600 mb-3">
            Lade deine Transaktionshistorie als CSV für deine Buchhaltung herunter.
          </p>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => alert("CSV-Export - Funktion in Entwicklung")}
          >
            <Download className="w-4 h-4 mr-2" />
            Als CSV exportieren
          </Button>
        </Card>
      </div>
    </div>
  );
}
