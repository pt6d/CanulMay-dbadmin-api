import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Envio } from "./Envio.js";

@Entity("auditoria_envios")
export class AuditoriaEnvio {
    @PrimaryGeneratedColumn({ name: "auditoria_id" })
    auditoriaId: number;

    @Column({ type: "int", name: "envio_id" })
    envioId: number;

    @Column({ name: "costo_anterior", type: "decimal", precision: 10, scale: 2 })
    costoAnterior: number;

    @Column({ name: "costo_nuevo", type: "decimal", precision: 10, scale: 2 })
    costoNuevo: number;

    @Column({ type: "varchar" })
    usuario: string;

    @Column({ name: "fecha_modificacion", type: "datetime" })
    fechaModificacion: Date;

    @ManyToOne(() => Envio, (envio) => envio.auditorias)
    @JoinColumn({ name: "envio_id" })
    envio: Relation<Envio>;
}
