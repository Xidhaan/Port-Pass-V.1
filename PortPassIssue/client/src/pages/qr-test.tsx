import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Note: Using a regular textarea since Textarea component might not be available
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle, XCircle } from "lucide-react";

export default function QRTest() {
  const [qrData, setQrData] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyQR = async () => {
    if (!qrData.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData: qrData.trim() }),
      });
      
      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        valid: false,
        message: "Failed to verify QR code",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQRData = "PASS:PP-2025-123456|CUSTOMER:John Doe|TYPE:daily|VALID:2025-08-03|AMOUNT:MVR 6.11|STAFF:Port Authority Staff|DATE:8/3/2025|STATUS:ACTIVE";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <QrCode className="text-primary text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">QR Code Verification Test</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Input */}
          <Card>
            <CardHeader>
              <CardTitle>Test QR Code Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qrData">Paste QR Code Data Here</Label>
                <textarea
                  id="qrData"
                  placeholder="Scan a QR code and paste the data here..."
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={handleVerifyQR} disabled={!qrData.trim() || isLoading} className="w-full">
                  {isLoading ? "Verifying..." : "Verify QR Code"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setQrData(sampleQRData)}
                  className="w-full"
                >
                  Load Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Result</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-4">
                  <div className={`flex items-center space-x-2 p-3 rounded-md ${
                    verificationResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {verificationResult.valid ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {verificationResult.valid ? 'Valid Pass' : 'Invalid Pass'}
                    </span>
                  </div>

                  {verificationResult.data && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Pass Details:</h4>
                      <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                        {Object.entries(verificationResult.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Enter QR code data above and click verify to see results
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>QR Code Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The QR codes generated by this system use a pipe-separated format that's compatible with most QR scanners:
              </p>
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm break-all">
                PASS:PP-2025-123456|CUSTOMER:John Doe|TYPE:daily|VALID:2025-08-03|AMOUNT:MVR 6.11|STAFF:Port Authority Staff|DATE:8/3/2025|STATUS:ACTIVE
              </div>
              <p className="text-sm text-gray-600">
                When scanned, this shows the pass number, customer name, pass type, validity date, amount, 
                staff designation who created it, creation date, and status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}