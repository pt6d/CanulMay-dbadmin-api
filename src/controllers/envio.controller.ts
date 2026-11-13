import { Request, Response } from "express";
import * as envioService from "../services/envio.service.js";
import { responderError } from "../errores.js";

export const crearEnvio = async (req: Request, res: Response) => {
    try {
        const { remitenteId, destinatarioId, direccionOrigenId, direccionDestinoId, costoTotal, paquetes } = req.body ?? {};
        if (!remitenteId || !destinatarioId || !direccionOrigenId || !direccionDestinoId || !Array.isArray(paquetes)) {
            return res.status(400).json({ message: "Faltan datos del envio" });
        }
        const envio = await envioService.crearEnvio(req.body);
        res.status(201).json(envio);
    } catch (error) {
        responderError(res, error);
    }
};

export const actualizarCosto = async (req: Request, res: Response) => {
    try {
        const { costoTotal, usuario } = req.body ?? {};
        if (costoTotal === undefined) {
            return res.status(400).json({ message: "Falta costoTotal" });
        }
        const envio = await envioService.actualizarCosto(Number(req.params.id), costoTotal, usuario ?? null);
        res.json(envio);
    } catch (error) {
        responderError(res, error);
    }
};

export const agregarRastreo = async (req: Request, res: Response) => {
    try {
        const { ubicacionActual, estadoEvento } = req.body ?? {};
        if (!ubicacionActual || !estadoEvento) {
            return res.status(400).json({ message: "Faltan ubicacionActual o estadoEvento" });
        }
        const envio = await envioService.agregarRastreo(Number(req.params.id), req.body);
        res.status(201).json(envio);
    } catch (error) {
        responderError(res, error);
    }
};

export const enviosActivos = async (_req: Request, res: Response) => {
    try {
        res.json(await envioService.enviosActivos());
    } catch (error) {
        responderError(res, error);
    }
};
