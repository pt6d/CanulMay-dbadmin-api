import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Direccion } from "./Direccion.js";
import { Envio } from "./Envio.js";

@Entity("clientes")
export class Cliente {
    @PrimaryGeneratedColumn({ name: "cliente_id" })
    clienteId: number;

    @Column({ type: "varchar" })
    nombre: string;

    @Column({ type: "varchar" })
    correo: string;

    @Column({ type: "enum", enum: ["ACTIVO", "INACTIVO"], default: "ACTIVO" })
    estado: string;

    @Column({ name: "limite_credito", type: "decimal", precision: 10, scale: 2 })
    limiteCredito: number;

    @OneToMany(() => Direccion, (direccion) => direccion.cliente)
    direcciones: Relation<Direccion[]>;

    @OneToMany(() => Envio, (envio) => envio.remitente)
    envios: Relation<Envio[]>;
}
