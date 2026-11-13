import { AppDataSource } from "../config/data-source.js";
import { Envio } from "../entity/Envio.js";
import { Paquete } from "../entity/Paquete.js";
import { HistorialRastreo } from "../entity/HistorialRastreo.js";
import { HttpError } from "../errores.js";

const envioRepo = () => AppDataSource.getRepository(Envio);

export const buscarEnvio = async (id: number) => {
    const envio = await envioRepo().findOne({
        where: { envioId: id },
        relations: { remitente: true, destinatario: true, paquetes: true, historial: true, auditorias: true },
    });
    if (!envio) throw new HttpError(404, "Envio no encontrado");
    return envio;
};

export const crearEnvio = async (datos: any) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const envio = await queryRunner.manager.save(Envio, {
            remitenteId: datos.remitenteId,
            destinatarioId: datos.destinatarioId,
            direccionOrigenId: datos.direccionOrigenId,
            direccionDestinoId: datos.direccionDestinoId,
            costoTotal: datos.costoTotal,
        });
        for (const paquete of datos.paquetes) {
            await queryRunner.manager.save(Paquete, { ...paquete, envioId: envio.envioId });
        }
        await queryRunner.commitTransaction();
        return await buscarEnvio(envio.envioId);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};

export const actualizarCosto = async (id: number, costoTotal: number, usuario: string | null) => {
    await buscarEnvio(id);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.query("SET @usuario_app = ?", [usuario]);
        await queryRunner.manager.update(Envio, { envioId: id }, { costoTotal });
        await queryRunner.query("SET @usuario_app = NULL");
    } finally {
        await queryRunner.release();
    }
    return await buscarEnvio(id);
};

export const agregarRastreo = async (id: number, datos: any) => {
    const envio = await buscarEnvio(id);
    if (envio.estadoGlobal === "ENTREGADO") throw new HttpError(400, "El envio ya fue entregado");
    await AppDataSource.getRepository(HistorialRastreo).save({ ...datos, envioId: id });
    return await buscarEnvio(id);
};

export const enviosActivos = async () => {
    return await envioRepo()
        .createQueryBuilder("envio")
        .leftJoinAndSelect("envio.remitente", "remitente")
        .leftJoinAndSelect("envio.destinatario", "destinatario")
        .leftJoinAndSelect("envio.paquetes", "paquetes")
        .where("envio.estadoGlobal IN (:...estados)", { estados: ["REGISTRADO", "EN_TRANSITO"] })
        .getMany();
};
