import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import type { Pass, Transaction } from "@shared/schema";

export default function PassDisplay() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Get data from localStorage when component mounts
    const passesData = localStorage.getItem("generatedPasses");
    const transactionData = localStorage.getItem("generatedTransaction");
    
    if (passesData) {
      const parsedPasses = JSON.parse(passesData);
      setPasses(parsedPasses);
      // Clear the data after loading to prevent stale data
      localStorage.removeItem("generatedPasses");
    }
    if (transactionData) {
      const parsedTransaction = JSON.parse(transactionData);
      setTransaction(parsedTransaction);
      // Clear the data after loading to prevent stale data
      localStorage.removeItem("generatedTransaction");
    }
  }, []);

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

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    window.print();
  };

  if (passes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">No Passes Found</h1>
          <p className="text-gray-600">Please generate passes first.</p>
          <Button onClick={() => window.close()} className="mt-4">
            Close Window
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow-sm border-b no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Generated Passes</h1>
            <div className="flex items-center space-x-3">
              <Button onClick={handlePrint} className="flex items-center">
                <Printer className="mr-2 h-4 w-4" />
                Print All
              </Button>
              <Button onClick={handleSaveAsPDF} variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
              <Button variant="ghost" onClick={() => window.close()}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pass Cards */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {passes.map((pass, index) => (
          <div
            key={pass.id}
            className="pass-card bg-white border-2 border-gray-300 rounded-lg p-6 max-w-md mx-auto print:max-w-none print:page-break-after-always print:m-0 print:border-0 print:rounded-none"
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

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            background: white !important;
          }
          .pass-card {
            width: 100%;
            max-width: none;
            page-break-after: always;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: 1px solid #000 !important;
            border-radius: 0 !important;
          }
          .pass-card:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}