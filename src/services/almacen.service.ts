import { AppDataSource } from "../config/data-source.js";
import { Almacen } from "../entity/Almacen.js";
import { Paquete } from "../entity/Paquete.js";
import { HttpError } from "../errores.js";

export const agregarPaquete = async (almacenId: number, datos: any) => {
    const almacen = await AppDataSource.getRepository(Almacen).findOneBy({ almacenId });
    if (!almacen) throw new HttpError(404, "Almacen no encontrado");
    return await AppDataSource.getRepository(Paquete).save({ ...datos, almacenId });
};
