CREATE DATABASE IF NOT EXISTS ventas_db;
USE ventas_db;

DROP TRIGGER IF EXISTS before_insert_paquete_almacen;
DROP TRIGGER IF EXISTS after_update_envio_costo;
DROP TRIGGER IF EXISTS after_insert_historial_rastreo;
DROP PROCEDURE IF EXISTS sp_reporte_mensual_cliente;
DROP PROCEDURE IF EXISTS sp_obtener_hoja_ruta_envio;

DROP TABLE IF EXISTS auditoria_envios;
DROP TABLE IF EXISTS historial_rastreo;
DROP TABLE IF EXISTS paquetes;
DROP TABLE IF EXISTS envios;
DROP TABLE IF EXISTS almacenes;
DROP TABLE IF EXISTS direcciones;
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
    cliente_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    limite_credito DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE direcciones (
    direccion_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    calle VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    tipo ENUM('ORIGEN', 'DESTINO') NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id)
);

CREATE TABLE almacenes (
    almacen_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    capacidad_maxima INT NOT NULL
);

CREATE TABLE envios (
    envio_id INT AUTO_INCREMENT PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    direccion_origen_id INT NOT NULL,
    direccion_destino_id INT NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_global ENUM('REGISTRADO', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'REGISTRADO',
    FOREIGN KEY (remitente_id) REFERENCES clientes(cliente_id),
    FOREIGN KEY (destinatario_id) REFERENCES clientes(cliente_id),
    FOREIGN KEY (direccion_origen_id) REFERENCES direcciones(direccion_id),
    FOREIGN KEY (direccion_destino_id) REFERENCES direcciones(direccion_id)
);

CREATE TABLE paquetes (
    paquete_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    almacen_id INT NULL,
    peso DECIMAL(8,2) NOT NULL,
    dimensiones VARCHAR(50) NOT NULL,
    contenido VARCHAR(255) NOT NULL,
    FOREIGN KEY (envio_id) REFERENCES envios(envio_id),
    FOREIGN KEY (almacen_id) REFERENCES almacenes(almacen_id)
);

CREATE TABLE historial_rastreo (
    rastreo_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_actual VARCHAR(150) NOT NULL,
    estado_evento ENUM('EN_ALMACEN', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO') NOT NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (envio_id) REFERENCES envios(envio_id)
);

CREATE TABLE auditoria_envios (
    auditoria_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    costo_anterior DECIMAL(10,2) NOT NULL,
    costo_nuevo DECIMAL(10,2) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (envio_id) REFERENCES envios(envio_id)
);

DELIMITER $$

CREATE TRIGGER before_insert_paquete_almacen
BEFORE INSERT ON paquetes
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    DECLARE v_ocupados INT;

    IF NEW.almacen_id IS NOT NULL THEN
        SELECT capacidad_maxima INTO v_capacidad FROM almacenes WHERE almacen_id = NEW.almacen_id;
        SELECT COUNT(*) INTO v_ocupados FROM paquetes WHERE almacen_id = NEW.almacen_id;

        IF v_ocupados >= v_capacidad THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El almacen ya no tiene capacidad';
        END IF;
    END IF;
END$$

CREATE TRIGGER after_update_envio_costo
AFTER UPDATE ON envios
FOR EACH ROW
BEGIN
    IF OLD.costo_total <> NEW.costo_total THEN
        INSERT INTO auditoria_envios (envio_id, costo_anterior, costo_nuevo, usuario, fecha_modificacion)
        VALUES (NEW.envio_id, OLD.costo_total, NEW.costo_total, COALESCE(@usuario_app, CURRENT_USER()), NOW());
    END IF;
END$$

CREATE TRIGGER after_insert_historial_rastreo
AFTER INSERT ON historial_rastreo
FOR EACH ROW
BEGIN
    IF NEW.estado_evento = 'ENTREGADO' THEN
        UPDATE envios SET estado_global = 'ENTREGADO' WHERE envio_id = NEW.envio_id;
    END IF;
END$$

CREATE PROCEDURE sp_reporte_mensual_cliente(IN p_cliente_id INT, IN p_mes INT, IN p_anio INT)
BEGIN
    SELECT
        c.nombre AS cliente,
        COUNT(e.envio_id) AS total_envios,
        IFNULL(SUM(e.costo_total), 0) AS facturacion_total,
        IFNULL(SUM(e.estado_global = 'ENTREGADO'), 0) AS envios_entregados,
        ROUND(AVG(TIMESTAMPDIFF(HOUR, e.fecha, h.fecha)), 2) AS tiempo_promedio_horas
    FROM clientes c
    LEFT JOIN envios e
        ON e.remitente_id = c.cliente_id
        AND MONTH(e.fecha) = p_mes
        AND YEAR(e.fecha) = p_anio
    LEFT JOIN historial_rastreo h
        ON h.envio_id = e.envio_id
        AND h.estado_evento = 'ENTREGADO'
    WHERE c.cliente_id = p_cliente_id
    GROUP BY c.cliente_id, c.nombre;
END$$

CREATE PROCEDURE sp_obtener_hoja_ruta_envio(IN p_envio_id INT)
BEGIN
    SELECT
        e.envio_id,
        e.fecha,
        e.estado_global,
        e.costo_total,
        r.nombre AS remitente,
        d.nombre AS destinatario
    FROM envios e
    JOIN clientes r ON r.cliente_id = e.remitente_id
    JOIN clientes d ON d.cliente_id = e.destinatario_id
    WHERE e.envio_id = p_envio_id;

    SELECT paquete_id, contenido, peso, dimensiones
    FROM paquetes
    WHERE envio_id = p_envio_id;

    SELECT fecha, ubicacion_actual, estado_evento, observaciones
    FROM historial_rastreo
    WHERE envio_id = p_envio_id
    ORDER BY fecha;
END$$

DELIMITER ;

INSERT INTO clientes (nombre, correo, estado, limite_credito) VALUES
('Comercial del Sureste', 'contacto@comsureste.mx', 'ACTIVO', 50000),
('Maria Lopez', 'maria.lopez@mail.com', 'ACTIVO', 5000),
('Juan Perez', 'juan.perez@mail.com', 'ACTIVO', 3000);

INSERT INTO direcciones (cliente_id, calle, ciudad, codigo_postal, tipo) VALUES
(1, 'Calle 60 #450', 'Merida', '97000', 'ORIGEN'),
(2, 'Av. Colon #120', 'Merida', '97070', 'DESTINO'),
(3, 'Calle 10 #25', 'Campeche', '24040', 'DESTINO'),
(2, 'Calle 21 #300', 'Merida', '97100', 'ORIGEN');

INSERT INTO almacenes (nombre, ubicacion, capacidad_maxima) VALUES
('CEDIS Merida', 'Periferico Norte Km 5', 100),
('Bodega Campeche', 'Av. Gobernadores #500', 2);

INSERT INTO envios (remitente_id, destinatario_id, direccion_origen_id, direccion_destino_id, costo_total, fecha) VALUES
(1, 2, 1, 2, 250.00, '2026-11-02 09:00:00'),
(1, 3, 1, 3, 480.50, '2026-11-05 10:30:00'),
(1, 3, 1, 3, 320.00, '2026-11-10 08:15:00'),
(2, 3, 4, 3, 150.00, '2026-11-11 12:00:00');

INSERT INTO paquetes (envio_id, almacen_id, peso, dimensiones, contenido) VALUES
(1, 1, 2.50, '30x20x15', 'Ropa'),
(2, 1, 8.00, '50x40x30', 'Electrodomesticos'),
(3, 2, 4.75, '40x30x20', 'Libros'),
(4, NULL, 0.80, '25x18x5', 'Documentos');

INSERT INTO historial_rastreo (envio_id, fecha, ubicacion_actual, estado_evento) VALUES
(1, '2026-11-02 11:00:00', 'CEDIS Merida', 'EN_ALMACEN'),
(1, '2026-11-03 13:00:00', 'Merida', 'ENTREGADO'),
(2, '2026-11-05 14:00:00', 'CEDIS Merida', 'EN_ALMACEN'),
(2, '2026-11-07 10:30:00', 'Campeche', 'ENTREGADO'),
(3, '2026-11-10 10:00:00', 'Bodega Campeche', 'EN_ALMACEN');

UPDATE envios SET estado_global = 'EN_TRANSITO' WHERE envio_id = 3;
