import { Router } from "express";
import * as envio from "./controllers/envio.controller.js";
import * as almacen from "./controllers/almacen.controller.js";
import * as cliente from "./controllers/cliente.controller.js";

const router = Router();

router.post("/envios", envio.crearEnvio);
router.put("/envios/:id/costo", envio.actualizarCosto);
router.post("/almacenes/:id/paquetes", almacen.agregarPaquete);
router.post("/envios/:id/rastreo", envio.agregarRastreo);
router.get("/envios", envio.enviosActivos);
router.get("/clientes/:id/envios", cliente.enviosDeCliente);

export default router;
