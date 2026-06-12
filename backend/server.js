const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CONFIGURACIONES BÁSICAS
app.use(cors()); // Permite que tu futura página de React se comunique con este servidor
app.use(express.json()); // Permite al servidor entender datos en formato JSON (el estándar web)

// CONEXIÓN A LA BASE DE DATOS DE XAMPP
// Aquí el código toma los datos que guardaste de forma segura en tu archivo .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Comprobar si la conexión a XAMPP funciona
db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos MySQL en XAMPP');
});

// ====================================================================
// RUTA 1: OBTENER Y BUSCAR SERVICIOS (GET)
// Esta ruta se activará cuando entres a: http://localhost:5000/api/servicios
// ====================================================================
app.get('/api/servicios', (req, res) => {
    const { buscar } = req.query; // Captura lo que la gente escriba en el buscador
    
    let query = 'SELECT * FROM servicios';
    let queryParams = [];

    // Si el usuario escribe algo en el buscador, cambiamos la consulta SQL para filtrar
    if (buscar) {
        query += ' WHERE titulo LIKE ? OR categoria LIKE ?';
        queryParams = [`%${buscar}%`, `%${buscar}%`];
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al consultar los servicios en la base de datos' });
        }
        res.json(results); // Devuelve la lista de servicios encontrados
    });
});

// ====================================================================
// RUTA 2: REGISTRAR UN NUEVO SERVICIO (POST)
// Esta ruta recibirá los datos del formulario de tu página web y los guardará
// ====================================================================
app.post('/api/servicios', (req, res) => {
    // Desestructuramos los datos que vienen desde el formulario de la página web
    const { id_usuario, titulo, descripcion, precio, telefono, categoria } = req.body;

    const query = `INSERT INTO servicios (id_usuario, titulo, descripcion, precio, telefono, categoria) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [id_usuario, titulo, descripcion, precio, telefono, categoria], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al insertar el servicio en la base de datos' });
        }
        res.status(201).json({ 
            mensaje: '🎉 ¡Servicio publicado con éxito!', 
            id_servicio: result.insertId 
        });
    });
});

// ARRANCAR EL SERVIDOR
// Le decimos al servidor que escuche en el puerto 5000
const PORT = process.env.PORT || 5000;
// RUTA PARA ELIMINAR UN SERVICIO POR ID
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
// RUTA 1: REGISTRAR UN NUEVO USUARIO
// ==========================================
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: "Por favor, llena todos los campos." });
  }

  try {
    // Verificar si el correo ya existe en la base de datos
    const [existente] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado con otra cuenta." });
    }

    // Insertar el nuevo usuario
    const queryInsertar = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
    await db.query(queryInsertar, [nombre, correo, contrasena]);

    res.json({ mensaje: "🎉 ¡Usuario registrado con éxito!" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ error: "Error interno del servidor al registrar." });
  }
});

// ==========================================
// RUTA 2: INICIAR SESIÓN (LOGIN)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Por favor, proporciona correo y contraseña." });
  }

  try {
    // Buscar al usuario por correo
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ error: "El correo electrónico no existe." });
    }

    const usuario = usuarios[0];

    // Validar contraseña plana (puedes meter encriptación después si te lo piden)
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: "La contraseña es incorrecta." });
    }

    // Si todo coincide, mandamos los datos del usuario logueado
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
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});