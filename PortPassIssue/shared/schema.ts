import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payerName: text("payer_name").notNull(),
  payerEmail: text("payer_email"),
  payerPhone: text("payer_phone"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  slipFilename: text("slip_filename").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passes = pgTable("passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").references(() => transactions.id).notNull(),
  passNumber: text("pass_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  passType: text("pass_type").notNull(), // 'daily', 'vehicle', 'crane'
  idNumber: text("id_number"), // for daily passes
  plateNumber: text("plate_number"), // for vehicle/crane passes
  validDate: text("valid_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  qrCode: text("qr_code").notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertPassSchema = createInsertSchema(passes).omit({
  id: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Frontend form schemas
export const payerSchema = z.object({
  name: z.string().min(1, "Payer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const passSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  passType: z.enum(["daily", "vehicle", "crane"], {
    required_error: "Pass type is required",
  }),
  idNumber: z.string().optional(),
  plateNumber: z.string().optional(),
  validDate: z.string().min(1, "Valid date is required"),
}).refine((data) => {
  if (data.passType === "daily" && !data.idNumber) {
    return false;
  }
  if ((data.passType === "vehicle" || data.passType === "crane") && !data.plateNumber) {
    return false;
  }
  return true;
}, {
  message: "ID number is required for Daily Pass, Vehicle plate number is required for Vehicle/Crane passes",
});

export const createPassesSchema = z.object({
  payer: payerSchema,
  passes: z.array(passSchema).min(1, "At least one pass is required"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createStaffSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  isAdmin: z.boolean().default(false),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertPass = z.infer<typeof insertPassSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Pass = typeof passes.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type PayerData = z.infer<typeof payerSchema>;
export type PassData = z.infer<typeof passSchema>;
export type CreatePassesData = z.infer<typeof createPassesSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type CreateStaffData = z.infer<typeof createStaffSchema>;
