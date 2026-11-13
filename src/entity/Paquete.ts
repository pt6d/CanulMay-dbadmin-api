import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Envio } from "./Envio.js";
import { Almacen } from "./Almacen.js";

@Entity("paquetes")
export class Paquete {
    @PrimaryGeneratedColumn({ name: "paquete_id" })
    paqueteId: number;

    @Column({ type: "int", name: "envio_id" })
    envioId: number;

    @Column({ name: "almacen_id", type: "int", nullable: true })
    almacenId: number | null;

    @Column({ type: "decimal", precision: 8, scale: 2 })
    peso: number;

    @Column({ type: "varchar" })
    dimensiones: string;

    @Column({ type: "varchar" })
    contenido: string;

    @ManyToOne(() => Envio, (envio) => envio.paquetes)
    @JoinColumn({ name: "envio_id" })
    envio: Relation<Envio>;

    @ManyToOne(() => Almacen, (almacen) => almacen.paquetes)
    @JoinColumn({ name: "almacen_id" })
    almacen: Relation<Almacen>;
}
