import { Request, Response } from "express";
import * as clienteService from "../services/cliente.service.js";
import { responderError } from "../errores.js";

export const enviosDeCliente = async (req: Request, res: Response) => {
    try {
        res.json(await clienteService.enviosDeCliente(Number(req.params.id)));
    } catch (error) {
        responderError(res, error);
    }
};
