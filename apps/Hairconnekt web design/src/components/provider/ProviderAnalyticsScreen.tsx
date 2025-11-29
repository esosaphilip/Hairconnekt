import { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Euro,
  Star,
  Clock,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
// Removed unused Tabs components

const monthlyData = [
  { month: "Jan", revenue: 2800, appointments: 32, newClients: 8 },
  { month: "Feb", revenue: 3200, appointments: 38, newClients: 12 },
  { month: "Mar", revenue: 2950, appointments: 35, newClients: 10 },
  { month: "Apr", revenue: 3400, appointments: 42, newClients: 15 },
  { month: "Mai", revenue: 3800, appointments: 48, newClients: 18 },
  { month: "Jun", revenue: 4100, appointments: 52, newClients: 20 },
];

const topServices = [
  { name: "Box Braids", bookings: 156, revenue: 14820, growth: 12 },
  { name: "Knotless Braids", bookings: 98, revenue: 10290, growth: 8 },
  { name: "Cornrows", bookings: 87, revenue: 5655, growth: -3 },
  { name: "Senegalese Twists", bookings: 72, revenue: 7920, growth: 15 },
];

const peakHours = [
  { hour: "9-11", bookings: 12 },
  { hour: "11-13", bookings: 18 },
  { hour: "13-15", bookings: 24 },
  { hour: "15-17", bookings: 32 },
  { hour: "17-19", bookings: 28 },
  { hour: "19-21", bookings: 15 },
];

export function ProviderAnalyticsScreen() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
  const maxBookings = Math.max(...peakHours.map(d => d.bookings));

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Statistiken & Berichte</h3>
          <Button size="sm" variant="ghost">
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white px-4 py-3 border-b">
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
          <Button
            size="sm"
            variant={period === "year" ? "default" : "outline"}
            onClick={() => setPeriod("year")}
            className={period === "year" ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
          >
            Jahr
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Umsatz</span>
            </div>
            <div className="text-2xl mb-1">€4,100</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+8% vs. letzter Monat</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Termine</span>
            </div>
            <div className="text-2xl mb-1">52</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+5 vs. letzter Monat</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">Neue Kunden</span>
            </div>
            <div className="text-2xl mb-1">20</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+25%</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-gray-600">Bewertung</span>
            </div>
            <div className="text-2xl mb-1">4.8 ★</div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>→ Stabil</span>
            </div>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="p-4 mb-4">
          <h4 className="mb-4">Umsatzentwicklung</h4>
          <div className="flex items-end justify-between gap-2 h-48 mb-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-[#8B4513] rounded-t hover:bg-[#5C2E0A] transition-colors cursor-pointer relative group"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      €{data.revenue}
                      <br />
                      {data.appointments} Termine
                      <br />
                      {data.newClients} neue Kunden
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Durchschnitt/Monat</p>
                <h4 className="text-green-600">€3,542</h4>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Trend</p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <h4>+12%</h4>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card className="p-4 mb-4">
          <h4 className="mb-3">Beliebteste Services</h4>
          <div className="space-y-3">
            {topServices.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h5>{service.name}</h5>
                    <p className="text-sm text-gray-600">{service.bookings} Buchungen</p>
                  </div>
                  <div className="text-right">
                    <h5 className="text-[#8B4513]">€{service.revenue.toLocaleString()}</h5>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        service.growth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {service.growth >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(service.growth)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B4513]"
                    style={{ width: `${(service.revenue / 14820) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4>Stoßzeiten</h4>
          </div>
          <div className="space-y-3">
            {peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-16 text-gray-600">{hour.hour} Uhr</span>
                <div className="flex-1 h-8 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 flex items-center justify-end pr-2"
                    style={{ width: `${(hour.bookings / maxBookings) * 100}%` }}
                  >
                    <span className="text-xs text-white">{hour.bookings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 mb-4">
          <h4 className="mb-3">Leistungskennzahlen</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Annahmerate</span>
              <div className="text-right">
                <h5 className="text-green-600">98%</h5>
                <p className="text-xs text-gray-500">+2%</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Stornierungsrate</span>
              <div className="text-right">
                <h5 className="text-green-600">2%</h5>
                <p className="text-xs text-gray-500">-1%</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Wiederholungsrate</span>
              <div className="text-right">
                <h5 className="text-[#8B4513]">72%</h5>
                <p className="text-xs text-gray-500">+5%</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Ø Reaktionszeit</span>
              <div className="text-right">
                <h5>2 Std.</h5>
                <p className="text-xs text-gray-500">→ Stabil</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Durchschn. Buchungswert</span>
              <div className="text-right">
                <h5 className="text-[#8B4513]">€79</h5>
                <p className="text-xs text-gray-500">+3%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Client Demographics */}
        <Card className="p-4">
          <h4 className="mb-3">Kundensegmente</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Neue Kunden</span>
                <span className="text-sm">28%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "28%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Stammkunden</span>
                <span className="text-sm">52%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "52%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Inaktiv (&gt;3 Monate)</span>
                <span className="text-sm">20%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400" style={{ width: "20%" }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
