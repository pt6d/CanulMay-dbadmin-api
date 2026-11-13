import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Envio } from "./Envio.js";

@Entity("historial_rastreo")
export class HistorialRastreo {
    @PrimaryGeneratedColumn({ name: "rastreo_id" })
    rastreoId: number;

    @Column({ type: "int", name: "envio_id" })
    envioId: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    fecha: Date;

    @Column({ type: "varchar", name: "ubicacion_actual" })
    ubicacionActual: string;

    @Column({ name: "estado_evento", type: "enum", enum: ["EN_ALMACEN", "EN_TRANSITO", "EN_REPARTO", "ENTREGADO"] })
    estadoEvento: string;

    @Column({ type: "text", nullable: true })
    observaciones: string | null;

    @ManyToOne(() => Envio, (envio) => envio.historial)
    @JoinColumn({ name: "envio_id" })
    envio: Relation<Envio>;
}
