import { ArrowLeft, CreditCard, Plus, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const initialPaymentMethods = [
  {
    id: 1,
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "2026",
    isDefault: true,
    cardholderName: "Max Müller",
  },
  {
    id: 2,
    type: "card",
    brand: "Mastercard",
    last4: "5555",
    expiryMonth: "08",
    expiryYear: "2027",
    isDefault: false,
    cardholderName: "Max Müller",
  },
  {
    id: 3,
    type: "paypal",
    email: "max.mueller@email.com",
    isDefault: false,
  },
];

export function PaymentMethodsScreen() {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);

  const handleSetDefault = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = () => {
    if (methodToDelete) {
      setPaymentMethods(
        paymentMethods.filter((method) => method.id !== methodToDelete)
      );
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  const getCardIcon = (brand: string) => {
    const colors: Record<string, string> = {
      Visa: "bg-blue-500",
      Mastercard: "bg-red-500",
      Amex: "bg-green-500",
      Default: "bg-gray-500",
    };
    return colors[brand] || colors.Default;
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Zahlungsmethoden</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Add New Payment Method */}
        <Button
          className="w-full mb-6 bg-[#8B4513] hover:bg-[#5C2E0A]"
          onClick={() => {
            // In real app, this would open a payment method form
            alert("Zahlungsmethode hinzufügen - wird implementiert");
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Zahlungsmethode hinzufügen
        </Button>

        {/* Payment Methods List */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-4">
              {method.type === "card" ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg ${getCardIcon(
                          method.brand
                        )} flex items-center justify-center`}
                      >
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5>{method.brand}</h5>
                          {method.isDefault && (
                            <Badge className="bg-[#8B4513] text-white text-xs">
                              Standard
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">•••• {method.last4}</p>
                        <p className="text-sm text-gray-500">
                          Gültig bis {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    {!method.isDefault && (
                      <button
                        onClick={() => {
                          setMethodToDelete(method.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {method.cardholderName}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">PP</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5>PayPal</h5>
                          {method.isDefault && (
                            <Badge className="bg-[#8B4513] text-white text-xs">
                              Standard
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">{method.email}</p>
                      </div>
                    </div>
                    {!method.isDefault && (
                      <button
                        onClick={() => {
                          setMethodToDelete(method.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </>
              )}

              {!method.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(method.id)}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Als Standard festlegen
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-100">
          <h5 className="mb-2 text-blue-900">Sichere Zahlungen</h5>
          <p className="text-sm text-blue-800">
            Alle Zahlungen werden verschlüsselt und sicher verarbeitet. Deine
            Zahlungsinformationen werden niemals mit Drittanbietern geteilt.
          </p>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zahlungsmethode löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diese Zahlungsmethode löschen möchtest?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
