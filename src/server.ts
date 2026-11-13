import "dotenv/config";
import "reflect-metadata";
import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    })
    .catch((error) => console.error("Error al conectar con la base de datos:", error.message));
