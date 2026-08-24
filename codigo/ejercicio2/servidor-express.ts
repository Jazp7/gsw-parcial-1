import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app: Express = express();
const PORT = 3000;


// Middlewares de Seguridad

// Helmet: Establece headers HTTP seguros
app.use(helmet());

// Rate Limiting: Máximo 30 peticiones por minuto
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 peticiones
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
    standardHeaders: true, // Devuelve info de rate limit en los headers
    legacyHeaders: false, // Desactiva X-RateLimit-* headers
});

// Aplicar rate limiter a todas las rutas
app.use(limiter);

// Middlewares de Parseo
app.use(express.json());

// Data Storage (Base de datos simulada)
interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

let usuarios: Usuario[] = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, nombre: 'María García', email: 'maria@example.com' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com' },
];

let nextId = 4;

// Rutas de la API
/**
 * GET /api/usuarios
 * Devuelve un arreglo de todos los usuarios
 */
app.get('/api/usuarios', (req: Request, res: Response) => {
    res.json(usuarios);
});

/**
 * GET /api/usuarios/:id
 * Devuelve un usuario específico por ID
 * Responde con 404 si no existe
 */
app.get('/api/usuarios/:id', (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const usuario = usuarios.find((u) => u.id === id);

    if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }

    res.json(usuario);
});

/**
 * POST /api/usuarios
 * Crea un nuevo usuario
 * Requiere: { nombre, email }
 * Valida que ambos campos estén presentes y no vacíos
 */
app.post('/api/usuarios', (req: Request, res: Response) => {
    const { nombre, email } = req.body;

    // Validación: campos presentes y no vacíos
    if (!nombre || !email || nombre.trim() === '' || email.trim() === '') {
        res.status(400).json({
            error: 'Validación fallida',
            mensaje: 'Los campos "nombre" y "email" son requeridos y no pueden estar vacíos.',
        });
        return;
    }

    // Crear nuevo usuario con ID autoincremental
    const nuevoUsuario: Usuario = {
        id: nextId++,
        nombre: nombre.trim(),
        email: email.trim(),
    };

    usuarios.push(nuevoUsuario);

    res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: nuevoUsuario,
    });
});

/**
 * GET /api/health
 * Endpoint de health check
 * Devuelve estado del servidor y timestamp
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});


// Manejo de Errores Global

/**
 * Middleware de error global
 * Nunca muestra el stack trace al cliente por seguridad
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error en el servidor:', err);

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
        error: 'Error interno del servidor',
        ...(isDevelopment && { detalles: err.message }), // Solo en desarrollo
    });
});

/**
 * Middleware para rutas no encontradas (404)
 */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta: req.originalUrl,
        metodo: req.method,
    });
});


// Iniciar Servidor

app.listen(PORT, () => {
    console.log(`✓ Servidor Express ejecutándose en http://localhost:${PORT}`);
    console.log(`✓ Rutas disponibles:`);
    console.log(`  - GET  /api/usuarios`);
    console.log(`  - GET  /api/usuarios/:id`);
    console.log(`  - POST /api/usuarios`);
    console.log(`  - GET  /api/health`);
    console.log(`✓ Rate limit: 30 peticiones por minuto`);
    console.log(`✓ Seguridad: Helmet activado`);
});
