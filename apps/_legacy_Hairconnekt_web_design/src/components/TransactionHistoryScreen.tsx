import { ArrowLeft, Download, Calendar, Filter, Check, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const transactions = {
  all: [
    {
      id: 1,
      type: "payment",
      provider: "Aisha Mohammed",
      service: "Box Braids",
      amount: 95,
      date: "15. Okt 2025",
      time: "14:30",
      status: "completed",
      paymentMethod: "Visa •••• 4242",
      transactionId: "TXN-2025-10-15-001",
    },
    {
      id: 2,
      type: "payment",
      provider: "Fatima Hassan",
      service: "Cornrows",
      amount: 65,
      date: "8. Okt 2025",
      time: "11:20",
      status: "completed",
      paymentMethod: "Mastercard •••• 5555",
      transactionId: "TXN-2025-10-08-001",
    },
    {
      id: 3,
      type: "refund",
      provider: "Sarah Williams",
      service: "Knotless Braids",
      amount: 105,
      date: "20. Sep 2025",
      time: "16:45",
      status: "completed",
      paymentMethod: "Visa •••• 4242",
      transactionId: "TXN-2025-09-20-001",
      reason: "Stornierung durch Kunde",
    },
    {
      id: 4,
      type: "payment",
      provider: "Lina Okafor",
      service: "Senegalese Twists",
      amount: 110,
      date: "1. Okt 2025",
      time: "15:15",
      status: "completed",
      paymentMethod: "PayPal",
      transactionId: "TXN-2025-10-01-001",
    },
    {
      id: 5,
      type: "payment",
      provider: "Amina Johnson",
      service: "Faux Locs",
      amount: 120,
      date: "18. Sep 2025",
      time: "10:00",
      status: "completed",
      paymentMethod: "Visa •••• 4242",
      transactionId: "TXN-2025-09-18-001",
      voucherApplied: "WELCOME20",
      originalAmount: 150,
    },
  ],
};

export function TransactionHistoryScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const payments = transactions.all.filter((t) => t.type === "payment");
  const refunds = transactions.all.filter((t) => t.type === "refund");

  const totalSpent = payments.reduce((sum, t) => sum + t.amount, 0);
  const totalRefunded = refunds.reduce((sum, t) => sum + t.amount, 0);

  const TransactionCard = ({ transaction }: { transaction: any }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5>{transaction.provider}</h5>
            {transaction.type === "refund" ? (
              <Badge className="bg-orange-500 text-white text-xs">
                Rückerstattung
              </Badge>
            ) : (
              <Badge className="bg-green-500 text-white text-xs">
                Zahlung
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{transaction.service}</p>
          <p className="text-xs text-gray-500">
            {transaction.date} um {transaction.time} Uhr
          </p>
        </div>
        <div className="text-right">
          <div
            className={`text-xl ${
              transaction.type === "refund"
                ? "text-green-600"
                : "text-gray-900"
            }`}
          >
            {transaction.type === "refund" ? "+" : "-"}€{transaction.amount}
          </div>
          {transaction.voucherApplied && (
            <p className="text-xs text-gray-500 line-through">
              €{transaction.originalAmount}
            </p>
          )}
        </div>
      </div>

      {transaction.voucherApplied && (
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            Gutschein: {transaction.voucherApplied}
          </Badge>
        </div>
      )}

      <div className="pt-3 border-t space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Zahlungsmethode:</span>
          <span>{transaction.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span>Transaktions-ID:</span>
          <span className="text-xs">{transaction.transactionId}</span>
        </div>
        {transaction.reason && (
          <div className="flex justify-between">
            <span>Grund:</span>
            <span>{transaction.reason}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>Status:</span>
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span>Abgeschlossen</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Transaktionshistorie</h3>
          <Button size="sm" variant="ghost">
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-4 py-6 mt-2">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl text-[#8B4513] mb-1">€{totalSpent}</div>
            <div className="text-xs text-gray-600">Gesamt ausgegeben</div>
          </div>
          <div>
            <div className="text-2xl text-green-600 mb-1">
              €{totalRefunded}
            </div>
            <div className="text-xs text-gray-600">Rückerstattet</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Filter Button */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Filter-Optionen werden implementiert")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Kalenderfilter wird implementiert")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Zeitraum
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              Alle ({transactions.all.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              Zahlungen ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="refunds">
              Rückerstattungen ({refunds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-0">
            {transactions.all.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </TabsContent>

          <TabsContent value="payments" className="space-y-3 mt-0">
            {payments.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </TabsContent>

          <TabsContent value="refunds" className="space-y-3 mt-0">
            {refunds.length > 0 ? (
              refunds.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Keine Rückerstattungen</h4>
                <p className="text-gray-600">
                  Du hast bisher keine Rückerstattungen erhalten.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
