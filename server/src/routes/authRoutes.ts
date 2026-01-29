import { Router } from "express";
import { register, loginLocal } from "../controllers/authControllers";

const router = Router();

// Local authentication routes (for development)
router.post("/register", register);
router.post("/login-local", loginLocal);

export default router;
