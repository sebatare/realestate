import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "local-dev-secret";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!["manager", "tenant"].includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be 'manager' or 'tenant'" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "manager") {
      // Check if manager exists
      const existingManager = await prisma.manager.findUnique({
        where: { email },
      });

      if (existingManager) {
        res.status(409).json({ error: "Manager with this email already exists" });
        return;
      }

      // Create manager
      const manager = await prisma.manager.create({
        data: {
          cognitoId: `local-${Date.now()}`,
          email,
          name,
          password: hashedPassword,
          phoneNumber: "",
        },
      });

      // Generate JWT
      const token = jwt.sign(
        {
          userId: manager.id,
          email: manager.email,
          role: "manager",
          "custom:role": "manager",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: "manager",
        },
      });
    } else {
      // Check if tenant exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { email },
      });

      if (existingTenant) {
        res.status(409).json({ error: "Tenant with this email already exists" });
        return;
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          cognitoId: `local-${Date.now()}`,
          email,
          name,
          password: hashedPassword,
          phoneNumber: "",
        },
      });

      // Generate JWT
      const token = jwt.sign(
        {
          userId: tenant.id,
          email: tenant.email,
          role: "tenant",
          "custom:role": "tenant",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: tenant.id,
          email: tenant.email,
          name: tenant.name,
          role: "tenant",
        },
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginLocal = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Try to find manager
    let user = await prisma.manager.findUnique({
      where: { email },
    });

    let role = "manager";

    // If not found, try tenant
    if (!user) {
      user = await prisma.tenant.findUnique({
        where: { email },
      });
      role = "tenant";
    }

    // User not found
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Check password
    if (!user.password) {
      res.status(401).json({ error: "This user account uses AWS Cognito authentication" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role,
        "custom:role": role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
