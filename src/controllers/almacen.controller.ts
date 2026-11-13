import { Request, Response } from "express";
import * as almacenService from "../services/almacen.service.js";
import { responderError } from "../errores.js";

export const agregarPaquete = async (req: Request, res: Response) => {
    try {
        const { envioId, peso, dimensiones, contenido } = req.body ?? {};
        if (!envioId || !peso || !dimensiones || !contenido) {
            return res.status(400).json({ message: "Faltan datos del paquete" });
        }
        const paquete = await almacenService.agregarPaquete(Number(req.params.id), req.body);
        res.status(201).json(paquete);
    } catch (error) {
        responderError(res, error);
    }
};
