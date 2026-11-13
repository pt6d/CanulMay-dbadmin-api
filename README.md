# LogiExpress API

## MySQL en Docker

```bash
docker compose up -d
```

Host localhost, puerto 3307, usuario root, password secret.

## Base de datos

Abrir `database/logiexpress.sql` en DBeaver y ejecutarlo con Alt + X.

```sql
CALL sp_reporte_mensual_cliente(1, 11, 2026);
CALL sp_obtener_hoja_ruta_envio(2);
```

## API

```bash
npm install
cp .env.example .env
npm run dev
```

## Endpoints

| Metodo | Ruta | Trigger |
|---|---|---|
| POST | /api/envios | |
| PUT | /api/envios/:id/costo | after_update_envio_costo |
| POST | /api/almacenes/:id/paquetes | before_insert_paquete_almacen |
| POST | /api/envios/:id/rastreo | after_insert_historial_rastreo |
| GET | /api/envios | |
| GET | /api/clientes/:id/envios | |

## Ejemplos

POST /api/envios

```json
{
  "remitenteId": 2,
  "destinatarioId": 3,
  "direccionOrigenId": 4,
  "direccionDestinoId": 3,
  "costoTotal": 180,
  "paquetes": [{ "peso": 1.5, "dimensiones": "20x20x20", "contenido": "Regalo", "almacenId": 1 }]
}
```

PUT /api/envios/3/costo

```json
{ "costoTotal": 350.75, "usuario": "eduardo" }
```

POST /api/almacenes/2/paquetes (la segunda vez responde 400 porque el almacen se llena)

```json
{ "envioId": 4, "peso": 2, "dimensiones": "10x10x10", "contenido": "Prueba" }
```

POST /api/envios/4/rastreo

```json
{ "ubicacionActual": "Campeche", "estadoEvento": "ENTREGADO" }
```
