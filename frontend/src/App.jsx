import { useState, useEffect } from 'react';

function App() {
  // CONFIGURACIÓN DE NAVEGACIÓN Y USUARIO
  const [vista, setVista] = useState('login'); // Puede ser: 'login', 'registro', 'marketplace'
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Guardará los datos del usuario actual

  // Estados comunes
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // Estados de los formularios de autenticación
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regContrasena, setRegContrasena] = useState('');

  const [loginCorreo, setLoginCorreo] = useState('');
  const [loginContrasena, setLoginContrasena] = useState('');

  // Estados del formulario para crear un servicio
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [categoria, setCategoria] = useState('');

  // 1. TRAER SERVICIOS DEL BACKEND (Actualizado a Render)
  const obtenerServicios = async (termino = '') => {
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/servicios?buscar=${termino}`);
      const datos = await respuesta.json();
      setServicios(datos);
    } catch (error) {
      console.error("Error conectando con el backend:", error);
    }
  };

  useEffect(() => {
    if (vista === 'marketplace') {
      obtenerServicios();
    }
  }, [vista]);

  // 2. LOGICA DE BÚSQUEDA
  const manejarBusqueda = (e) => {
    e.preventDefault();
    obtenerServicios(busqueda);
  };

  // 3. PROCESAR EL REGISTRO DE USUARIOS (Corregido doble fetch y ruta)
  const manejarRegistroUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: regNombre, correo: regCorreo, contrasena: regContrasena })
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert(datos.mensaje || "¡Registro exitoso!");
        setVista('login'); // Lo mandamos a iniciar sesión
        setRegNombre(''); setRegCorreo(''); setRegContrasena('');
      } else {
        alert(datos.error || "Error al registrar.");
      }
    } catch (error) {
      console.error("Error en registro frontend:", error);
    }
  };

  // 4. PROCESAR EL INICIO DE SESIÓN (Actualizado a Render y ruta estándar)
  const manejarLoginUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: loginCorreo, contrasena: loginContrasena })
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert(`¡Bienvenido de vuelta, ${datos.usuario.nombre}!`);
        setUsuarioLogueado(datos.usuario); // Guardamos la info del usuario en memoria
        setVista('marketplace'); // Saltamos al Marketplace principal
        setLoginCorreo(''); setLoginContrasena('');
      } else {
        alert(datos.error || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error en login frontend:", error);
    }
  };

  // 5. REGISTRAR UN NUEVO SERVICIO (Actualizado a Render)
  const manejarRegistroServicio = async (e) => {
    e.preventDefault();

    if (!titulo || !descripcion || !precio || !telefono || !categoria) {
      alert("Por favor, llena todos los campos del formulario.");
      return;
    }

    const nuevoServicio = {
      id_usuario: usuarioLogueado?.id, // ID dinámico del usuario seguro
      titulo,
      descripcion,
      precio: parseFloat(precio),
      telefono,
      categoria
    };

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoServicio)
      });

      if (respuesta.ok) {
        alert("🎉 ¡Servicio publicado con éxito!");
        setTitulo(''); setDescripcion(''); setPrecio(''); setTelefono(''); setCategoria('');
        obtenerServicios();
      } else {
        alert("Hubo un error al publicar el servicio.");
      }
    } catch (error) {
      console.error("Error al enviar el servicio:", error);
    }
  };

  // 6. ELIMINAR UN SERVICIO (Actualizado a Render)
  const eliminarServicio = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/servicios/${id}`, { 
        method: 'DELETE' 
      });
      if (respuesta.ok) {
        alert("🗑️ Servicio eliminado correctamente.");
        obtenerServicios();
      } else {
        alert("No se pudo eliminar el servicio.");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

  // =========================================================================
  // RENDERIZADO CONDICIONAL DE LAS PANTALLAS
  // =========================================================================

  // VISTA 1: INTERFAZ DE LOGIN
  if (vista === 'login') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5' }}>
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2e7d32', marginBottom: '24px' }}>Marketplace Login</h2>
          <form onSubmit={manejarLoginUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Correo electrónico" value={loginCorreo} onChange={(e) => setLoginCorreo(e.target.value)} required style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }} />
            <input type="password" placeholder="Contraseña" value={loginContrasena} onChange={(e) => setLoginContrasena(e.target.value)} required style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }} />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Iniciar Sesión</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            ¿No tienes cuenta? <span onClick={() => setVista('registro')} style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}>Regístrate aquí</span>
          </p>
        </div>
      </div>
    );
  }

  // VISTA 2: INTERFAZ DE REGISTRO
  if (vista === 'registro') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5' }}>
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '24px' }}>Crear Cuenta</h2>
          <form onSubmit={manejarRegistroUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Nombre completo" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }} />
            <input type="email" placeholder="Correo electrónico" value={regCorreo} onChange={(e) => setRegCorreo(e.target.value)} required style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }} />
            <input type="password" placeholder="Contraseña segura" value={regContrasena} onChange={(e) => setRegContrasena(e.target.value)} required style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }} />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Registrarse</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            ¿Ya tienes cuenta? <span onClick={() => setVista('login')} style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 'bold' }}>Inicia sesión</span>
          </p>
        </div>
      </div>
    );
  }

  // VISTA 3: INTERFAZ PRINCIPAL DEL MARKETPLACE
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ color: '#2e7d32', margin: '0' }}>Marketplace de Servicios</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Hola, <strong style={{ color: '#333' }}>{usuarioLogueado?.nombre}</strong>. Encuentra o publica servicios locales.</p>
        </div>
        <button 
          onClick={() => { setUsuarioLogueado(null); setVista('login'); }} 
          style={{ padding: '8px 16px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión 🚪
        </button>
      </header>

      {/* BARRA DE BÚSQUEDA */}
      <form onSubmit={manejarBusqueda} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" placeholder="¿Qué servicio estás buscando? (ej. Plomero, Eléctrico...)" 
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '12px 25px', fontSize: '16px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Buscar
        </button>
      </form>

      {/* CONTENIDO EN DOS COLUMNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        
        {/* FORMULARIO */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
          <h3 style={{ marginTop: '0', color: '#333' }}>🚀 Publicar un Servicio</h3>
          <form onSubmit={manejarRegistroServicio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Título del servicio..." value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
              <option value="">-- Selecciona Categoría --</option>
              <option value="Hogar">Hogar</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Clases">Clases / Tutorías</option>
              <option value="Otros">Otros</option>
            </select>
            <textarea placeholder="Descripción del servicio..." rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }} />
            <input type="number" placeholder="Precio estimado ($)" value={precio} onChange={(e) => setPrecio(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Teléfono de WhatsApp (ej. 522221234567)" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Publicar Servicio</button>
          </form>
        </div>

        {/* LISTA DE TARJETAS */}
        <div>
          <h3 style={{ marginTop: '0', color: '#333' }}>Servicios Disponibles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {servicios.length === 0 ? (
              <p style={{ color: '#888' }}>No hay servicios disponibles.</p>
            ) : (
              servicios.map((servicio) => {
                const telLimpio = servicio.telefono.replace(/[^0-9]/g, '');
                const mensajeWa = encodeURIComponent(`Hola, vi tu servicio de "${servicio.titulo}" en el Marketplace.`);
                const urlWhatsapp = `https://wa.me/${telLimpio}?text=${mensajeWa}`;

                return (
                  <div key={servicio.id_servicio} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {servicio.categoria}
                      </span>
                      <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{servicio.titulo}</h3>
                      <p style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0' }}>{servicio.descripcion}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '10px 0' }}>
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(servicio.precio)}
                      </p>
                      <a href={urlWhatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: '#25D366', color: 'white', padding: '8px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>💬 WhatsApp</a>
                      <button onClick={() => eliminarServicio(servicio.id_servicio)} style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#d32f2f', color: 'white', padding: '8px', borderRadius: '5px', border: 'none', fontWeight: 'bold', fontSize: '14px', marginTop: '8px', cursor: 'pointer' }}>🗑️ Eliminar Publicación</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;