import { AppDataSource } from "../config/data-source.js";
import { Cliente } from "../entity/Cliente.js";
import { Envio } from "../entity/Envio.js";
import { HttpError } from "../errores.js";

export const enviosDeCliente = async (clienteId: number) => {
    const cliente = await AppDataSource.getRepository(Cliente).findOneBy({ clienteId });
    if (!cliente) throw new HttpError(404, "Cliente no encontrado");
    return await AppDataSource.getRepository(Envio).find({
        where: [{ remitenteId: clienteId }, { destinatarioId: clienteId }],
        relations: { remitente: true, destinatario: true, paquetes: true, historial: true },
    });
};
