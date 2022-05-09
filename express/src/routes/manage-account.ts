import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";

const router = express.Router();
router.get('/account/list-services', checkAuthorisation, listServices);

export default router;