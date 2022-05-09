import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";

const router = express.Router();

router.get('/account/list-services', listServices);

export default router;