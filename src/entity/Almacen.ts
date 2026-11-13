import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Paquete } from "./Paquete.js";

@Entity("almacenes")
export class Almacen {
    @PrimaryGeneratedColumn({ name: "almacen_id" })
    almacenId: number;

    @Column({ type: "varchar" })
    nombre: string;

    @Column({ type: "varchar" })
    ubicacion: string;

    @Column({ type: "int", name: "capacidad_maxima" })
    capacidadMaxima: number;

    @OneToMany(() => Paquete, (paquete) => paquete.almacen)
    paquetes: Relation<Paquete[]>;
}
