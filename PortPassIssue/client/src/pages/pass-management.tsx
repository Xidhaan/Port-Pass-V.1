import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PassForm } from "@/components/pass-form";
import { Anchor, Calculator, History, User, Printer, Download, ArrowLeft, Eye, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Pass, Transaction, PayerData, PassData } from "@shared/schema";

interface PassPrice {
  daily: string;
  vehicle: string;
  crane: string;
}

interface CreatePassesResponse {
  transaction: Transaction;
  passes: Pass[];
}

export default function PassManagement() {
  const { toast } = useToast();
  const [generatedPasses, setGeneratedPasses] = useState<Pass[]>([]);
  const [generatedTransaction, setGeneratedTransaction] = useState<Transaction | null>(null);
  const [showPasses, setShowPasses] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  // Fetch pass prices
  const { data: passPrices } = useQuery<PassPrice>({
    queryKey: ["/api/pass-prices"],
  });

  // Fetch recent passes
  const { data: recentPasses } = useQuery<Pass[]>({
    queryKey: ["/api/passes/recent"],
  });

  // Function to view passes by transaction ID
  const viewPassesMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/passes/transaction/${transactionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch passes");
      }
      return response.json() as Promise<{ transaction: Transaction; passes: Pass[] }>;
    },
    onSuccess: (data) => {
      setGeneratedPasses(data.passes);
      setGeneratedTransaction(data.transaction);
      setShowPasses(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create passes mutation
  const createPassesMutation = useMutation({
    mutationFn: async (data: { payer: PayerData; passes: PassData[]; slip: File }) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ payer: data.payer, passes: data.passes }));
      formData.append("slip", data.slip);

      const response = await fetch("/api/passes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create passes");
      }

      return response.json() as Promise<CreatePassesResponse>;
    },
    onSuccess: (data) => {
      // Set the generated data to state and show passes
      setGeneratedPasses(data.passes);
      setGeneratedTransaction(data.transaction);
      setShowPasses(true);
      
      queryClient.invalidateQueries({ queryKey: ["/api/passes/recent"] });
      toast({
        title: "Success",
        description: `${data.passes.length} pass(es) generated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateTotal = (passes: PassData[]): number => {
    if (!passPrices) return 0;
    return passes.reduce((sum, pass) => {
      return sum + parseFloat(passPrices[pass.passType] || "0");
    }, 0);
  };

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

  const getTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const passDate = typeof date === 'string' ? new Date(date) : date;
    const diffInHours = Math.floor((now.getTime() - passDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    return `${diffInHours} hours ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Anchor className="text-primary text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">Port Pass Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Staff Portal</span>
              <User className="text-gray-400 text-xl" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Create Passes</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Recent Passes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pass Form */}
              <div className="lg:col-span-2">
                <PassForm
                  onSubmit={(data) => createPassesMutation.mutate(data)}
                  isLoading={createPassesMutation.isPending}
                  passPrices={passPrices}
                  calculateTotal={calculateTotal}
                />
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Transaction Summary */}
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calculator className="text-primary mr-2" />
                      Transaction Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 mb-4">
                        Summary will appear when passes are added
                      </div>
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800 flex items-center">
                          <span className="mr-1">💡</span>
                          Verify the total amount matches the uploaded bank transfer slip.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="text-primary mr-2" />
                  Recent Passes
                </h3>
                <div className="space-y-3">
                  {recentPasses?.length ? (
                    recentPasses.map((pass, index) => (
                      <div key={pass.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        index === 0 ? 'border-green-200 bg-green-50' : 
                        index === 1 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pass.passNumber}</div>
                            <div className="text-gray-600">{pass.customerName} - {getPassTypeName(pass.passType)}</div>
                            <div className="text-xs text-gray-500">{getTimeAgo(new Date(pass.createdAt))}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPassesMutation.mutate(pass.transactionId)}
                            disabled={viewPassesMutation.isPending}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-8">No recent passes</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pass Display Section */}
      {showPasses && generatedPasses.length > 0 && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-8 print:hidden">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasses(false)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Form</span>
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">Generated Passes</h2>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => window.print()} className="flex items-center space-x-2">
                  <Printer className="h-4 w-4" />
                  <span>Print All</span>
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Save as PDF</span>
                </Button>
              </div>
            </div>

            {/* Pass Cards */}
            <div className="space-y-8 print:space-y-0">
              {generatedPasses.map((pass, index) => (
                <div key={pass.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 print:border print:border-black print:rounded-none print:mb-4 print:break-after-page">
                  {/* Pass Header with Logo */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Port Authority Logo */}
                      <div className="w-16 h-16 flex-shrink-0">
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="30" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>
                          <path d="M20 24h24v4H20z" fill="white"/>
                          <path d="M18 30h28v8H18z" fill="white"/>
                          <circle cx="32" cy="34" r="2" fill="#1e40af"/>
                          <path d="M22 42h20v2H22z" fill="white"/>
                          <text x="32" y="50" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">PORT</text>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{getPassTypeName(pass.passType)}</h3>
                        <p className="text-sm font-bold text-red-600">Pass Number: {pass.passNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">MVR {pass.amount}</p>
                      <p className="text-sm text-gray-600">Valid: {formatDate(pass.validDate)}</p>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                      <p className="text-sm"><strong>Name:</strong> {pass.customerName}</p>
                      {pass.idNumber && <p className="text-sm"><strong>ID Number:</strong> {pass.idNumber}</p>}
                      {pass.plateNumber && <p className="text-sm"><strong>Plate Number:</strong> {pass.plateNumber}</p>}
                    </div>
                    
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="text-center">
                        <img src={pass.qrCode} alt={`QR Code for ${pass.passNumber}`} className="w-24 h-24 mx-auto" />
                        <p className="text-xs text-gray-600 mt-2">Scan for verification</p>
                        <p className="text-xs text-gray-500">Includes staff designation</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-gray-500 border-t pt-4">
                    <p>Port Pass Management System | Generated on {formatDate(pass.createdAt.toString())}</p>
                    <p>This is an official port pass. Keep this document with you while at the port.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
