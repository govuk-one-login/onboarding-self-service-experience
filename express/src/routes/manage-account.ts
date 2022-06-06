import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {showAddServiceForm, processAddServiceForm} from "../controllers/manage-account";

const router = express.Router();
router.get('/account/list-services', checkAuthorisation, listServices);

router.get('/add-service-name', checkAuthorisation, showAddServiceForm);
router.post('/create-service-name-validation', checkAuthorisation, processAddServiceForm);

export default router;