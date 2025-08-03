import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import type { Pass, Transaction } from "@shared/schema";

interface PassPreviewProps {
  passes: Pass[];
  transaction: Transaction | null;
  onClose: () => void;
  onPrint: () => void;
}

export function PassPreview({ passes, transaction, onClose, onPrint }: PassPreviewProps) {
  const getPassTypeName = (type: string): string => {
    switch (type) {
      case "daily":
        return "Daily Pass";
      case "vehicle":
        return "Vehicle Sticker";
      case "crane":
        return "Crane Lorry Vehicle Sticker";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 no-print z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-auto">
        <div className="p-6 border-b border-gray-200 no-print">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pass Preview</h2>
            <div className="flex items-center space-x-3">
              <Button onClick={onPrint} className="flex items-center">
                <Printer className="mr-2 h-4 w-4" />
                Print All
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {passes.map((pass) => (
            <div
              key={pass.id}
              className="pass-card bg-white border-2 border-gray-300 rounded-lg p-6 max-w-md mx-auto print:max-w-none print:page-break-after-always print:m-0"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-primary text-2xl mr-2">⚓</span>
                  <h3 className="text-lg font-bold text-gray-900">Maldives Port Authority</h3>
                </div>
                <div className="h-1 bg-primary rounded mx-8"></div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Pass Number:</span>
                  <span className="text-sm font-bold text-primary">{pass.passNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Customer:</span>
                  <span className="text-sm font-semibold">{pass.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm font-semibold">{getPassTypeName(pass.passType)}</span>
                </div>
                {pass.idNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">ID Number:</span>
                    <span className="text-sm font-semibold">{pass.idNumber}</span>
                  </div>
                )}
                {pass.plateNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Plate Number:</span>
                    <span className="text-sm font-semibold">{pass.plateNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Valid Date:</span>
                  <span className="text-sm font-semibold">{formatDate(pass.validDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-green-600">MVR {pass.amount}</span>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="bg-gray-100 rounded-lg p-3 inline-block">
                  <img
                    src={pass.qrCode}
                    alt={`QR Code for ${pass.passNumber}`}
                    className="w-20 h-20"
                  />
                </div>
              </div>

              <div className="text-center border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500">
                  {pass.passType === "daily"
                    ? "This pass is valid for port access on the specified date. Keep this pass visible at all times."
                    : "This sticker is valid for vehicle access on the specified date. Affix to vehicle windshield."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
          }
          .pass-card {
            width: 100%;
            max-width: none;
            page-break-after: always;
            margin: 0;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
