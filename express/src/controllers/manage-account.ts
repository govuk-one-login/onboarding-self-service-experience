import {Request, Response} from "express";

export const listServices = async function(req: Request, res: Response) {
    res.render('manage-account/list-services.njk');
}
