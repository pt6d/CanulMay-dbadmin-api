import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Cliente } from "./Cliente.js";
import { Direccion } from "./Direccion.js";
import { Paquete } from "./Paquete.js";
import { HistorialRastreo } from "./HistorialRastreo.js";
import { AuditoriaEnvio } from "./AuditoriaEnvio.js";

@Entity("envios")
export class Envio {
    @PrimaryGeneratedColumn({ name: "envio_id" })
    envioId: number;

    @Column({ type: "int", name: "remitente_id" })
    remitenteId: number;

    @Column({ type: "int", name: "destinatario_id" })
    destinatarioId: number;

    @Column({ type: "int", name: "direccion_origen_id" })
    direccionOrigenId: number;

    @Column({ type: "int", name: "direccion_destino_id" })
    direccionDestinoId: number;

    @Column({ name: "costo_total", type: "decimal", precision: 10, scale: 2 })
    costoTotal: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    fecha: Date;

    @Column({ name: "estado_global", type: "enum", enum: ["REGISTRADO", "EN_TRANSITO", "ENTREGADO", "CANCELADO"], default: "REGISTRADO" })
    estadoGlobal: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.envios)
    @JoinColumn({ name: "remitente_id" })
    remitente: Relation<Cliente>;

    @ManyToOne(() => Cliente)
    @JoinColumn({ name: "destinatario_id" })
    destinatario: Relation<Cliente>;

    @ManyToOne(() => Direccion)
    @JoinColumn({ name: "direccion_origen_id" })
    direccionOrigen: Relation<Direccion>;

    @ManyToOne(() => Direccion)
    @JoinColumn({ name: "direccion_destino_id" })
    direccionDestino: Relation<Direccion>;

    @OneToMany(() => Paquete, (paquete) => paquete.envio)
    paquetes: Relation<Paquete[]>;

    @OneToMany(() => HistorialRastreo, (historial) => historial.envio)
    historial: Relation<HistorialRastreo[]>;

    @OneToMany(() => AuditoriaEnvio, (auditoria) => auditoria.envio)
    auditorias: Relation<AuditoriaEnvio[]>;
}
