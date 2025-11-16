import { Router } from "express";
import * as kyc from "../controllers/kyc.controller";

const router = Router();

router.post("/update", kyc.updateStatus);

export default router;
