const express = require('express');
const mysql = require('mysql2/promise'); // 🔄 CAMBIADO: Ahora usamos la versión de promesas
const cors = require('cors');
require('dotenv').config();

const app = express();

// CONFIGURACIONES BÁSICAS
app.use(cors()); // Permite que tu página de React se comunique con este servidor
app.use(express.json()); // Permite al servidor entender datos en formato JSON

// CONEXIÓN A LA BASE DE DATOS (Configurada para XAMPP local o Aiven en la nube)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' 
        ? { rejectUnauthorized: false } 
        : null // 🔒 Activa SSL automáticamente solo si estás en la nube (Aiven)
});

// FUNCIÓN PARA CREAR LAS TABLAS AUTOMÁTICAMENTE
async function inicializarBaseDeDatos() {
    try {
        // 1. Crear tabla de usuarios
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                correo VARCHAR(100) UNIQUE NOT NULL,
                contrasena VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Crear tabla de servicios (Asegurando que las columnas coincidan con tus rutas)
        await db.query(`
            CREATE TABLE IF NOT EXISTS servicios (
                id_servicio INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT,
                titulo VARCHAR(150) NOT NULL,
                descripcion TEXT NOT NULL,
                precio DECIMAL(10, 2) NOT NULL,
                telefono VARCHAR(20),
                categoria VARCHAR(100),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Conexión exitosa y tablas verificadas en la base de datos.');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
    }
}

// Ejecutamos la verificación de tablas al arrancar
inicializarBaseDeDatos();

// ====================================================================
// RUTA 1: OBTENER Y BUSCAR SERVICIOS (GET)
// ====================================================================
app.get('/api/servicios', async (req, res) => {
    const { buscar } = req.query;
    
    let query = 'SELECT * FROM servicios';
    let queryParams = [];

    if (buscar) {
        query += ' WHERE titulo LIKE ? OR categoria LIKE ?';
        queryParams = [`%${buscar}%`, `%${buscar}%`];
    }

    try {
        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar los servicios en la base de datos' });
    }
});

// ====================================================================
// RUTA 2: REGISTRAR UN NUEVO SERVICIO (POST)
// ====================================================================
app.post('/api/servicios', async (req, res) => {
    const { id_usuario, titulo, descripcion, precio, telefono, categoria } = req.body;

    const query = `INSERT INTO servicios (id_usuario, titulo, descripcion, precio, telefono, categoria) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    try {
        const [result] = await db.query(query, [id_usuario, titulo, descripcion, precio, telefono, categoria]);
        res.status(201).json({ 
            mensaje: '🎉 ¡Servicio publicado con éxito!', 
            id_servicio: result.insertId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar el servicio en la base de datos' });
    }
});

// ====================================================================
// RUTA 3: ELIMINAR UN SERVICIO POR ID (DELETE)
// ====================================================================
app.delete('/api/servicios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await db.query('DELETE FROM servicios WHERE id_servicio = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        res.json({ mensaje: "Servicio eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ==========================================
// RUTA 4: REGISTRAR UN NUEVO USUARIO (POST)
// ==========================================
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ error: "Por favor, llena todos los campos." });
    }

    try {
        const [existente] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (existente.length > 0) {
            return res.status(400).json({ error: "El correo ya está registrado con otra cuenta." });
        }

        const queryInsertar = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
        await db.query(queryInsertar, [nombre, correo, contrasena]);

        res.json({ mensaje: "🎉 ¡Usuario registrado con éxito!" });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error interno del servidor al registrar." });
    }
});

// ==========================================
// RUTA 5: INICIAR SESIÓN (LOGIN) (POST)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: "Por favor, proporciona correo y contraseña." });
    }

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        
        if (usuarios.length === 0) {
            return res.status(401).json({ error: "El correo electrónico no existe." });
        }

        const usuario = usuarios[0];

        if (usuario.contrasena !== contrasena) {
            return res.status(401).json({ error: "La contraseña es incorrecta." });
        }

        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error interno del servidor al loguear." });
    }
});

// ARRANCAR EL SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});