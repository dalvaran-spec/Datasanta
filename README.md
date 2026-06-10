# Datasanta

Aplicación web de gestión escolar pensada para el acceso de administradores y usuarios. Permite iniciar sesión, consultar información personal, administrar usuarios y mantener calificaciones organizadas por periodos y materias.

## Descripción

El programa carga una base de usuarios con datos de ejemplo y guarda los cambios en `localStorage` para que la información se conserve entre recargas. La interfaz se divide en tres vistas principales:

1. Inicio de sesión.
2. Panel de administración.
3. Panel de usuario.

## Funcionalidades

- Inicio de sesión con usuario normal o administrador.
- Restauración de los datos base.
- Visualización de usuarios registrados en una tabla.
- Edición de nombre, correo, rol y contraseña.
- Registro, edición y eliminación de calificaciones por materia y periodo.
- Consulta de notas personales del usuario autenticado.
- Visualización de materias, cantidad de notas, promedio y estado de aprobación.

## Datos base

La aplicación incluye usuarios de ejemplo con notas, materias y calificaciones precargadas. También maneja periodos académicos y un catálogo fijo de asignaturas como Matemáticas, Lengua, Ciencias, Historia, Inglés, Arte y Educación Física.

## Credenciales de prueba

- Administrador: `admin` / `12345`
- Restaurar datos base: `restaurar` / `12345`
- Usuarios base: se accede con el nombre o correo registrado y su contraseña correspondiente.

## Archivos del proyecto

- `index.html`: estructura de la interfaz.
- `styles.css`: estilos visuales.
- `javascrip.js`: lógica de autenticación, administración y calificaciones.

## Uso

1. Abre `index.html` en el navegador.
2. Inicia sesión con una de las credenciales disponibles.
3. Usa el panel correspondiente según el rol del usuario.
