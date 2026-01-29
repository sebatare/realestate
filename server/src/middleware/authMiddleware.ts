import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub?: string;
  userId?: number;
  role?: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "local-dev-secret";

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      let decoded: DecodedToken;
      
      try {
        // Try to verify with local secret first (for development)
        decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      } catch {
        // Fall back to decode without verification (for Cognito tokens)
        decoded = jwt.decode(token) as DecodedToken;
      }

      // Extract role and ID from token (support both local and Cognito formats)
      const userRole = decoded.role || decoded["custom:role"] || "";
      const userId = decoded.userId || decoded.sub || "";

      if (!userId) {
        res.status(400).json({ message: "Invalid token: missing user ID" });
        return;
      }

      req.user = {
        id: userId,
        role: userRole,
      };

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" });
        return;
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};