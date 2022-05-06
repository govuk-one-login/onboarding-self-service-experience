import express, {Request, Response} from "express";

export const listServices = async function(req: Request, res: Response) {

    // do database query, check whether user has any services.
    // Zero services - show the add your service page
    // One service - show page for that service
    // More than one - list services



    res.render('manage-account/list-services.njk');
}