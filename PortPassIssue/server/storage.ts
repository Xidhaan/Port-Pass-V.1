import { type Transaction, type Pass, type Staff, type InsertTransaction, type InsertPass, type InsertStaff } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createPass(pass: InsertPass): Promise<Pass>;
  getRecentPasses(limit?: number): Promise<Pass[]>;
  getPassesByTransaction(transactionId: string): Promise<Pass[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  
  // Staff management
  createStaff(staff: InsertStaff): Promise<Staff>;
  getStaffByUsername(username: string): Promise<Staff | undefined>;
  getStaffById(id: string): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  updateStaff(id: string, updates: Partial<Staff>): Promise<Staff>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private passes: Map<string, Pass>;
  private staff: Map<string, Staff>;

  constructor() {
    this.transactions = new Map();
    this.passes = new Map();
    this.staff = new Map();
    
    // Create default admin user for testing (password: "admin123")
    const adminId = randomUUID();
    this.staff.set(adminId, {
      id: adminId,
      username: "admin",
      passwordHash: bcrypt.hashSync("admin123", 10),
      fullName: "Administrator",
      designation: "System Administrator",
      department: "IT",
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      payerEmail: insertTransaction.payerEmail || null,
      payerPhone: insertTransaction.payerPhone || null,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async createPass(insertPass: InsertPass): Promise<Pass> {
    const id = randomUUID();
    const pass: Pass = {
      ...insertPass,
      idNumber: insertPass.idNumber || null,
      plateNumber: insertPass.plateNumber || null,
      id,
      createdAt: new Date(),
    };
    this.passes.set(id, pass);
    return pass;
  }

  async getRecentPasses(limit: number = 10): Promise<Pass[]> {
    const allPasses = Array.from(this.passes.values());
    return allPasses
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getPassesByTransaction(transactionId: string): Promise<Pass[]> {
    return Array.from(this.passes.values()).filter(
      (pass) => pass.transactionId === transactionId
    );
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  // Staff management methods
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertStaff.passwordHash, 10);
    const staff: Staff = {
      ...insertStaff,
      id,
      passwordHash: hashedPassword,
      isAdmin: insertStaff.isAdmin ?? false,
      isActive: insertStaff.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.staff.set(id, staff);
    return staff;
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(staff => staff.username === username);
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(staff => staff.isActive);
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const existingStaff = this.staff.get(id);
    if (!existingStaff) {
      throw new Error("Staff member not found");
    }
    
    const updatedStaff: Staff = {
      ...existingStaff,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }
}

export const storage = new MemStorage();
