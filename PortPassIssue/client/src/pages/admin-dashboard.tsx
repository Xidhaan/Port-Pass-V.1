import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createStaffSchema, type CreateStaffData, type Staff } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Users, Shield, Calendar, Building } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CreateStaffData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      designation: "",
      department: "",
      isAdmin: false,
    },
  });

  // Fetch staff list
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["/api/admin/staff"],
    retry: false,
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffData) => {
      return await apiRequest("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Staff Created",
        description: `${data.staff.fullName} has been added successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStaffData) => {
    createStaffMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Administrative Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage staff members and system administration
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Enter password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Port Officer, Senior Inspector" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Operations, Security, Administration" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Administrator Access</FormLabel>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Grant administrative privileges
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createStaffMutation.isPending}
                    className="flex-1"
                  >
                    {createStaffMutation.isPending ? "Creating..." : "Create Staff"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading staff members...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No staff members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Username</th>
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Designation</th>
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Department</th>
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Role</th>
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff: Staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div className="font-medium text-gray-900 dark:text-white">{staff.fullName}</div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{staff.username}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Building className="h-4 w-4" />
                          {staff.designation}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{staff.department}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.isAdmin
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {staff.isAdmin ? "Administrator" : "Staff"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {formatDate(staff.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}