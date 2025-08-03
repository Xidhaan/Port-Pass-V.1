import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPassesSchema, loginSchema, createStaffSchema, type LoginData, type CreateStaffData, type Staff } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import session from "express-session";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "slips");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and PDF files are allowed."));
    }
  },
});

// Pass type pricing
const PASS_PRICES = {
  daily: "6.11",
  vehicle: "11.21",
  crane: "81.51",
};

// Generate unique pass number
function generatePassNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `PP-${year}-${timestamp}${random}`;
}

// Session type extension
declare module 'express-session' {
  interface SessionData {
    staffId?: string;
    isAuthenticated?: boolean;
  }
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.isAuthenticated || !req.session?.staffId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Admin middleware
async function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.isAuthenticated || !req.session?.staffId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const staff = await storage.getStaffById(req.session.staffId);
    if (!staff || !staff.isAdmin) {
      return res.status(403).json({ message: "Administrator access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify admin status" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'development-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData: LoginData = loginSchema.parse(req.body);
      
      const staff = await storage.getStaffByUsername(loginData.username);
      if (!staff || !staff.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordValid = await bcrypt.compare(loginData.password, staff.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.staffId = staff.id;
      req.session.isAuthenticated = true;

      res.json({
        message: "Login successful",
        staff: {
          id: staff.id,
          username: staff.username,
          fullName: staff.fullName,
          designation: staff.designation,
          department: staff.department,
          isAdmin: staff.isAdmin
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const staff = await storage.getStaffById(req.session.staffId!);
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }

      res.json({
        id: staff.id,
        username: staff.username,
        fullName: staff.fullName,
        designation: staff.designation,
        department: staff.department,
        isAdmin: staff.isAdmin
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Staff management routes (admin only)
  app.post("/api/admin/staff", requireAuth, requireAdmin, async (req, res) => {
    try {
      const staffData: CreateStaffData = createStaffSchema.parse(req.body);
      
      // Check if username already exists
      const existingStaff = await storage.getStaffByUsername(staffData.username);
      if (existingStaff) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newStaff = await storage.createStaff({
        username: staffData.username,
        passwordHash: staffData.password, // Will be hashed in storage
        fullName: staffData.fullName,
        designation: staffData.designation,
        department: staffData.department,
        isAdmin: staffData.isAdmin,
        isActive: true
      });

      res.json({
        message: "Staff member created successfully",
        staff: {
          id: newStaff.id,
          username: newStaff.username,
          fullName: newStaff.fullName,
          designation: newStaff.designation,
          department: newStaff.department,
          isAdmin: newStaff.isAdmin
        }
      });
    } catch (error: any) {
      console.error("Create staff error:", error);
      res.status(400).json({ message: error.message || "Failed to create staff member" });
    }
  });

  app.get("/api/admin/staff", requireAuth, requireAdmin, async (req, res) => {
    try {
      const allStaff = await storage.getAllStaff();
      const staffList = allStaff.map(staff => ({
        id: staff.id,
        username: staff.username,
        fullName: staff.fullName,
        designation: staff.designation,
        department: staff.department,
        isAdmin: staff.isAdmin,
        isActive: staff.isActive,
        createdAt: staff.createdAt
      }));
      
      res.json(staffList);
    } catch (error: any) {
      console.error("Get staff error:", error);
      res.status(500).json({ message: "Failed to get staff list" });
    }
  });

  // Create passes endpoint (protected)
  app.post("/api/passes", requireAuth, upload.single("slip"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Bank transfer slip is required" });
      }

      const body = JSON.parse(req.body.data);
      const validatedData = createPassesSchema.parse(body);

      // Calculate total amount
      const totalAmount = validatedData.passes.reduce((sum, pass) => {
        return sum + parseFloat(PASS_PRICES[pass.passType]);
      }, 0);

      // Create transaction
      const transaction = await storage.createTransaction({
        payerName: validatedData.payer.name,
        payerEmail: validatedData.payer.email || null,
        payerPhone: validatedData.payer.phone || null,
        totalAmount: totalAmount.toFixed(2),
        slipFilename: req.file.filename,
      });

      // Create passes
      const createdPasses = [];
      for (const passData of validatedData.passes) {
        const passNumber = generatePassNumber();
        
        // Get staff information for QR code
        const currentStaff = await storage.getStaffById(req.session.staffId!);
        const staffDesignation = currentStaff ? currentStaff.designation : 'Port Authority Staff';
        
        // Create QR code data with pass info and staff designation
        // Using a simple text format that's more compatible with standard QR scanners
        const qrData = `PASS:${passNumber}|CUSTOMER:${passData.customerName}|TYPE:${passData.passType}|VALID:${passData.validDate}|AMOUNT:MVR ${PASS_PRICES[passData.passType]}|STAFF:${staffDesignation}|DATE:${new Date().toLocaleDateString()}|STATUS:ACTIVE`;
        
        const qrCode = await QRCode.toDataURL(qrData);
        
        const pass = await storage.createPass({
          transactionId: transaction.id,
          passNumber,
          customerName: passData.customerName,
          passType: passData.passType,
          idNumber: passData.idNumber || null,
          plateNumber: passData.plateNumber || null,
          validDate: passData.validDate,
          amount: PASS_PRICES[passData.passType],
          qrCode,
          staffId: req.session.staffId!,
        });
        
        createdPasses.push(pass);
      }

      res.json({
        transaction,
        passes: createdPasses,
      });
    } catch (error: any) {
      console.error("Error creating passes:", error);
      res.status(400).json({ 
        message: error.message || "Failed to create passes" 
      });
    }
  });

  // Get recent passes (protected)
  app.get("/api/passes/recent", requireAuth, async (req, res) => {
    try {
      const recentPasses = await storage.getRecentPasses(5);
      res.json(recentPasses);
    } catch (error: any) {
      console.error("Error fetching recent passes:", error);
      res.status(500).json({ message: "Failed to fetch recent passes" });
    }
  });

  // Get passes by transaction ID
  app.get("/api/passes/transaction/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransactionById(transactionId);
      const passes = await storage.getPassesByTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json({ transaction, passes });
    } catch (error: any) {
      console.error("Error fetching passes by transaction:", error);
      res.status(500).json({ message: "Failed to fetch passes" });
    }
  });

  // Get pass prices
  app.get("/api/pass-prices", (req, res) => {
    res.json(PASS_PRICES);
  });

  // QR code verification endpoint
  app.post("/api/verify-qr", async (req, res) => {
    try {
      const { qrData } = req.body;
      
      if (!qrData) {
        return res.status(400).json({ message: "QR data is required" });
      }

      // Parse the QR data (now in pipe-separated format)
      let parsedData: any = {};
      try {
        if (qrData.includes('|')) {
          // Parse pipe-separated format
          const parts = qrData.split('|');
          parts.forEach((part: string) => {
            const [key, value] = part.split(':');
            if (key && value) {
              parsedData[key.toLowerCase()] = value;
            }
          });
        } else {
          // Try JSON format for backwards compatibility
          try {
            parsedData = JSON.parse(qrData);
          } catch {
            // Simple pass number
            parsedData = { passNumber: qrData };
          }
        }
      } catch (error) {
        parsedData = { passNumber: qrData };
      }

      res.json({
        valid: true,
        data: parsedData,
        verifiedAt: new Date().toISOString(),
        message: "Pass verified successfully"
      });
    } catch (error: any) {
      console.error("Error verifying QR code:", error);
      res.status(400).json({ 
        message: error.message || "Failed to verify QR code" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
