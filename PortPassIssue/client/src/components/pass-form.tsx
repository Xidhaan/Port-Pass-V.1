import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPassesSchema, type CreatePassesData, type PayerData, type PassData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Trash2, User, IdCard, Wand2, Info } from "lucide-react";

interface PassFormProps {
  onSubmit: (data: { payer: PayerData; passes: PassData[]; slip: File }) => void;
  isLoading: boolean;
  passPrices?: { daily: string; vehicle: string; crane: string };
  calculateTotal: (passes: PassData[]) => number;
}

export function PassForm({ onSubmit, isLoading, passPrices, calculateTotal }: PassFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<CreatePassesData>({
    resolver: zodResolver(createPassesSchema),
    defaultValues: {
      payer: {
        name: "",
        email: "",
        phone: "",
      },
      passes: [
        {
          customerName: "",
          passType: undefined as any,
          idNumber: "",
          plateNumber: "",
          validDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "passes",
  });

  const watchedPasses = form.watch("passes");
  const totalAmount = calculateTotal(watchedPasses);

  const handleSubmit = (data: CreatePassesData) => {
    if (!uploadedFile) {
      form.setError("root", { message: "Bank transfer slip is required" });
      return;
    }
    
    onSubmit({ ...data, slip: uploadedFile });
    form.reset();
    setUploadedFile(null);
  };

  const addPass = () => {
    append({
      customerName: "",
      passType: undefined as any,
      idNumber: "",
      plateNumber: "",
      validDate: "",
    });
  };

  const removePass = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getPassTypePrice = (type: string): string => {
    if (!passPrices) return "0.00";
    switch (type) {
      case "daily":
        return passPrices.daily;
      case "vehicle":
        return passPrices.vehicle;
      case "crane":
        return passPrices.crane;
      default:
        return "0.00";
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Payer Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="text-primary mr-2" />
                Payer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter payer's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payer.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payer.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+960 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>
                    Bank Transfer Slip <span className="text-red-500">*</span>
                  </FormLabel>
                  <FileUpload
                    onFileSelect={setUploadedFile}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024}
                    selectedFile={uploadedFile}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Passes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <IdCard className="text-primary mr-2" />
                  Individual Passes
                </h2>
                <Button type="button" onClick={addPass} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pass
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const passType = form.watch(`passes.${index}.passType`);
                  return (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Pass #{index + 1}</h3>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePass(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`passes.${index}.customerName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Customer Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Pass holder's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`passes.${index}.passType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Pass Type <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pass type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">
                                    Daily Pass (MVR {passPrices?.daily || "6.11"})
                                  </SelectItem>
                                  <SelectItem value="vehicle">
                                    Vehicle Sticker (MVR {passPrices?.vehicle || "11.21"})
                                  </SelectItem>
                                  <SelectItem value="crane">
                                    Crane Lorry Vehicle Sticker (MVR {passPrices?.crane || "81.51"})
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {passType === "daily" && (
                          <FormField
                            control={form.control}
                            name={`passes.${index}.idNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  ID Card Number <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="ID card number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {(passType === "vehicle" || passType === "crane") && (
                          <FormField
                            control={form.control}
                            name={`passes.${index}.plateNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Vehicle Plate Number <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Vehicle plate number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name={`passes.${index}.validDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Valid Date <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {passType && (
                        <div className="mt-2 text-sm text-gray-600">
                          Price: MVR {getPassTypePrice(passType)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Actions */}
              <div className="mt-6 space-y-4">
                {form.formState.errors.root && (
                  <div className="text-red-500 text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 flex items-center">
                    <Info className="mr-1 h-4 w-4" />
                    All passes will be generated for the same payer
                  </div>
                  <div className="flex items-center space-x-4">
                    {totalAmount > 0 && (
                      <div className="text-lg font-semibold text-primary">
                        Total: MVR {totalAmount.toFixed(2)}
                      </div>
                    )}
                    <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isLoading ? "Generating..." : "Generate Passes"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
