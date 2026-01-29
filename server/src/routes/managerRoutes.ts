import express from "express";
import {
    getManager,
    createManager,
    updateManager,
    getManagerProperties
} from "../controllers/managerControllers"
const router = express.Router();

router.post("/", createManager);
router.get("/:cognitoId/properties", getManagerProperties);
router.get("/:cognitoId", getManager);
router.put("/:cognitoId", updateManager);

export default router;