import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Cliente } from "./Cliente.js";

@Entity("direcciones")
export class Direccion {
    @PrimaryGeneratedColumn({ name: "direccion_id" })
    direccionId: number;

    @Column({ type: "int", name: "cliente_id" })
    clienteId: number;

    @Column({ type: "varchar" })
    calle: string;

    @Column({ type: "varchar" })
    ciudad: string;

    @Column({ type: "varchar", name: "codigo_postal" })
    codigoPostal: string;

    @Column({ type: "enum", enum: ["ORIGEN", "DESTINO"] })
    tipo: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.direcciones)
    @JoinColumn({ name: "cliente_id" })
    cliente: Relation<Cliente>;
}
