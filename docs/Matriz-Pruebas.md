# Matriz de Pruebas

Casos de prueba automatizados del proyecto, con su identificador, tipo, entrada, resultado esperado y resultado obtenido. Cada ID aparece en el nombre de la prueba dentro del código (`TC-U05: ...`), así que se puede buscar con `grep`.

## Resumen de la ejecución

Resultado obtenido el 1 de noviembre de 2026, ejecutando cada suite completa.

| Paquete | Herramienta | Archivos de prueba | Pruebas | Resultado | Cobertura (líneas) |
|---|---|---|---|---|---|
| Backend | Jest 29 + Supertest 7 | 8 | 75 | **75 de 75 pasan** | 99.34 % |
| Frontend | Vitest 4 + React Testing Library 16 | 10 | 48 | **48 de 48 pasan** | 100 % |
| **Total** | | **18** | **123** | **123 de 123** | Umbral exigido: 60 % |

Los **101 identificadores** de caso se ejecutan como 123 pruebas, porque algunos casos usan una tabla de datos (por ejemplo `TC-I11` verifica cinco rutas y `TC-F32` cuatro pantallas).

| Tipo | IDs | Casos |
|---|---|---|
| Unitaria (backend) | `TC-U01` a `TC-U24` | 24 |
| Integración (backend) | `TC-I01` a `TC-I28` | 28 |
| Regresión (backend) | `TC-R01` a `TC-R09` | 9 |
| Componente (frontend) | `TC-F01` a `TC-F27`, `TC-F33`, `TC-F34` | 29 |
| Integración de rutas (frontend) | `TC-F28` a `TC-F32` | 5 |
| Regresión (frontend) | `TC-F35` a `TC-F40` | 6 |

**Cómo ejecutarlas**

```bash
cd backend-express && npm run test:coverage    # Jest, falla si la cobertura baja de 60 %
cd frontend-react  && npm run test:coverage    # Vitest, falla si la cobertura baja de 60 %
```

Las pruebas del backend simulan el cliente de Prisma, así que no necesitan una base de datos. Las del frontend simulan el módulo de la API, así que no necesitan el backend.

---

## 1. Backend: pruebas unitarias

### Middleware de autenticación (`tests/unit/auth.middleware.test.js`)

| ID | Componente | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-U01 | `verifyToken` | Petición sin cabecera `Authorization` | Responde 401 con `{ message: "Unauthenticated." }` y no llama a `next` | ✅ Pasa |
| TC-U02 | `verifyToken` | Token que no es un JWT válido | Responde 401 con `{ message: "Invalid token" }` | ✅ Pasa |
| TC-U03 | `verifyToken` | Token con la fecha de expiración vencida | Responde 401 con `{ message: "Invalid token" }` | ✅ Pasa |
| TC-U04 | `verifyToken` | Token válido del usuario 42 | Llama a `next` y guarda `req.userId = 42` | ✅ Pasa |

### Validadores (`tests/unit/validators.test.js`)

| ID | Componente | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-U05 | `validateRegister` | Nombre, correo y contraseña válidos, correo no registrado | Sin errores | ✅ Pasa |
| TC-U06 | `validateRegister` | Nombre vacío | Error `Name is required` | ✅ Pasa |
| TC-U07 | `validateRegister` | Correo `no-es-correo` | Error `Email is invalid` | ✅ Pasa |
| TC-U08 | `validateRegister` | Correo vacío | Error `Email is required` | ✅ Pasa |
| TC-U09 | `validateRegister` | Correo que ya existe en la base de datos | Error `Email already exists` | ✅ Pasa |
| TC-U10 | `validateRegister` | Contraseña `12345` | Error `Password must be at least 6 characters long` | ✅ Pasa |
| TC-U11 | `validateLogin` | Correo y contraseña de 9 caracteres | Sin errores | ✅ Pasa |
| TC-U12 | `validateLogin` | Correo vacío y contraseña `123` | Errores `Email is required` y de longitud mínima | ✅ Pasa |
| TC-U13 | `validateUser` | Datos válidos | Sin errores | ✅ Pasa |
| TC-U14 | `validateUser` | Actualizar al usuario 5 conservando su propio correo | Sin errores | ✅ Pasa |
| TC-U15 | `validateUser` | Actualizar al usuario 5 con el correo del usuario 9 | Error `Email already exists` | ✅ Pasa |
| TC-U16 | `validateUser` | Nombre vacío y contraseña `1` | Errores `Name is required` y de longitud mínima | ✅ Pasa |

### Utilidades (`tests/unit/user.utils.test.js`)

| ID | Componente | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-U17 | `omitPassword` | Usuario con id 3 y contraseña cifrada | Devuelve el usuario sin `password` y con id, nombre y correo | ✅ Pasa |
| TC-U18 | `omitPassword` | El mismo usuario | No modifica el objeto original | ✅ Pasa |
| TC-U19 | `parseId` | `"5"`, `"120"` y `7` | Devuelve 5, 120 y 7 | ✅ Pasa (3 valores) |
| TC-U20 | `parseId` | `"abc"`, `"0"`, `"-3"`, `"1.5"`, `""`, `undefined` y `null` | Devuelve `null` | ✅ Pasa (7 valores) |

### Controlador de usuarios aislado (`tests/unit/user.controller.test.js`)

| ID | Componente | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-U21 | `findUsers` | La base de datos devuelve un usuario | Responde 200 con `success: true` y la lista | ✅ Pasa |
| TC-U22 | `findUsers` | La base de datos lanza un error genérico | Responde 500 `Internal server error` | ✅ Pasa |
| TC-U23 | `deleteUser` | Prisma lanza el error `P2025` (registro inexistente) | Responde 404 `User not found` | ✅ Pasa |
| TC-U24 | `findUserById` | Id `abc` | Responde 400 y no consulta la base de datos | ✅ Pasa |

---

## 2. Backend: pruebas de integración (Supertest)

Atraviesan el router, el middleware, los validadores y los controladores reales; solo se reemplaza Prisma.

### Registro y login (`tests/integration/auth.routes.test.js`)

| ID | Ruta | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-I01 | `GET /` | Petición simple | 200 con el texto `Hello World!` | ✅ Pasa |
| TC-I02 | `POST /api/register` | Datos válidos | 201 `Register successfully`; la contraseña se guarda cifrada y distinta del texto plano | ✅ Pasa |
| TC-I03 | `POST /api/register` | Cuerpo vacío | 422 `Validation error` con la lista de errores; no crea el usuario | ✅ Pasa |
| TC-I04 | `POST /api/register` | Correo ya registrado | 422 con `Email already exists`; no crea el usuario | ✅ Pasa |
| TC-I05 | `POST /api/register` | La base de datos falla | 500 `Internal server error` | ✅ Pasa |
| TC-I06 | `POST /api/login` | Credenciales válidas del usuario 7 | 200 `Login successfully`, usuario sin contraseña y un JWT firmado con id 7 | ✅ Pasa |
| TC-I07 | `POST /api/login` | Usuario inexistente | 404 `User not found` | ✅ Pasa |
| TC-I08 | `POST /api/login` | Contraseña incorrecta | 401 `Invalid password` | ✅ Pasa |
| TC-I09 | `POST /api/login` | Correo vacío y contraseña `1` | 422; no consulta la base de datos | ✅ Pasa |
| TC-I10 | `POST /api/login` | La base de datos falla | 500 `Internal server error` | ✅ Pasa |

### Rutas de usuarios (`tests/integration/users.routes.test.js`)

| ID | Ruta | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-I11 | `GET /api/users`, `POST /api/users/create`, `GET /api/users/find/1`, `PUT /api/users/update/1`, `DELETE /api/users/delete/1` | Sin token | 401 `Unauthenticated.` en las cinco rutas | ✅ Pasa (5 rutas) |
| TC-I12 | `GET /api/users` | Token inválido `token-falso` | 401 `Invalid token` | ✅ Pasa |
| TC-I13 | `GET /api/users` | Token válido | 200 con dos usuarios; la consulta pide solo id, nombre y correo | ✅ Pasa |
| TC-I14 | `GET /api/users` | La base de datos falla | 500 `Internal server error` | ✅ Pasa |
| TC-I15 | `POST /api/users/create` | Datos válidos con token | 201 `User created successfully`; contraseña cifrada | ✅ Pasa |
| TC-I16 | `POST /api/users/create` | Nombre vacío, correo `x`, contraseña `1` | 422; no crea el usuario | ✅ Pasa |
| TC-I17 | `POST /api/users/create` | La base de datos falla | 500 | ✅ Pasa |
| TC-I18 | `GET /api/users/find/1` | Usuario existente | 200 `Get user By ID :1` con id, nombre y correo | ✅ Pasa |
| TC-I19 | `GET /api/users/find/1` | La base de datos falla | 500 | ✅ Pasa |
| TC-I20 | `PUT /api/users/update/5` | Datos válidos | 200 `User updated successfully`; actualiza el usuario 5 | ✅ Pasa |
| TC-I21 | `PUT /api/users/update/5` | Nombre vacío y contraseña `1` | 422; no actualiza | ✅ Pasa |
| TC-I22 | `PUT /api/users/update/5` | La base de datos falla | 500 | ✅ Pasa |
| TC-I23 | `DELETE /api/users/delete/3` | Usuario existente | 200 `User deleted successfully`; elimina el usuario 3 | ✅ Pasa |
| TC-I24 | `DELETE /api/users/delete/3` | La base de datos falla | 500 | ✅ Pasa |

### Seguridad de la aplicación (`tests/integration/app.security.test.js`)

| ID | Ruta | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-I25 | `GET /` | Petición simple | La respuesta no incluye la cabecera `X-Powered-By` | ✅ Pasa |
| TC-I26 | `GET /` | Cabecera `Origin: http://localhost:5173` | `Access-Control-Allow-Origin` es ese mismo origen | ✅ Pasa |
| TC-I27 | `GET /` | Cabecera `Origin` de un sitio desconocido | La respuesta no incluye `Access-Control-Allow-Origin` | ✅ Pasa |
| TC-I28 | `GET /` | `CORS_ORIGIN` con dos orígenes permitidos | Permite uno de esos orígenes y rechaza `localhost:5173` | ✅ Pasa |

---

## 3. Backend: pruebas de regresión (`tests/regression/known-defects.test.js`)

Fijan el comportamiento correcto de defectos del código original. **Antes de corregirlos, 10 de estas 11 pruebas fallaron** (la restante, `TC-R08`, protege la compatibilidad con el frontend y ya pasaba). Después de las correcciones pasan todas.

| ID | Defecto original | Entrada | Resultado esperado | Antes | Resultado obtenido |
|---|---|---|---|---|---|
| TC-R01 | `register` devolvía el hash de la contraseña | `POST /api/register` válido | 201 y la respuesta no contiene `password` ni el hash | ❌ Falló | ✅ Pasa |
| TC-R02 | `create` devolvía el hash | `POST /api/users/create` válido | 201 y sin `password` ni hash | ❌ Falló | ✅ Pasa |
| TC-R03 | `update` devolvía el hash | `PUT /api/users/update/1` válido | 200 y sin `password` ni hash | ❌ Falló | ✅ Pasa |
| TC-R04 | `find` de un usuario inexistente respondía 200 con `data: null` | `GET /api/users/find/999` | 404 `User not found` | ❌ Falló | ✅ Pasa |
| TC-R05 | `update` de un usuario inexistente respondía 500 | `PUT /api/users/update/999` (Prisma lanza `P2025`) | 404 `User not found` | ❌ Falló | ✅ Pasa |
| TC-R06 | `delete` de un usuario inexistente respondía 500 | `DELETE /api/users/delete/999` (Prisma lanza `P2025`) | 404 `User not found` | ❌ Falló | ✅ Pasa |
| TC-R07 | El middleware rechazaba el esquema `Bearer` | `Authorization: Bearer <token>` | 200 | ❌ Falló | ✅ Pasa |
| TC-R08 | Compatibilidad: el frontend envía el token sin prefijo | `Authorization: <token>` | 200 | ✅ Pasaba | ✅ Pasa |
| TC-R09 | Un id no numérico producía un error 500 de Prisma | `GET /find/abc`, `PUT /update/abc`, `DELETE /delete/abc` | 400 `Invalid user id`; no llama a Prisma | ❌ Falló (3 de 3) | ✅ Pasa (3 rutas) |

Los defectos de `TC-R01` a `TC-R07` están descritos en `Linea-Base-Calidad.md`, sección 4 (`TC-R08` solo verifica la compatibilidad con el frontend); el de `TC-R09` se descubrió al escribir estas pruebas y se añadió a esa sección.

---

## 4. Frontend: pruebas de componentes y de rutas (Vitest + React Testing Library)

### Listado de usuarios (`tests/views/users-index.test.jsx`)

| ID | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-F01 | Componente | Cookie `token` y la API devuelve dos usuarios | Muestra la lista, llama a `GET /api/users` con el token en `Authorization` y los enlaces EDIT apuntan a `/admin/users/edit/1` | ✅ Pasa |
| TC-F02 | Componente | La API devuelve una lista vacía | Muestra `Data Belum Tersedia!` | ✅ Pasa |
| TC-F03 | Componente | Sin cookie de token | No llama a la API; registra `Token is not available!` | ✅ Pasa |
| TC-F04 | Componente | La API rechaza la petición | Registra el error y la pantalla sigue funcionando | ✅ Pasa |
| TC-F05 | Componente | Pantalla cargada | El enlace ADD USER apunta a `/admin/users/create` | ✅ Pasa |
| TC-F06 | Componente | Clic en DELETE del usuario 1 | Llama a `DELETE /api/users/delete/1`, recarga la lista y desaparece el usuario | ✅ Pasa |
| TC-F07 | Componente | DELETE falla en la API | Registra el error y no recarga la lista | ✅ Pasa |
| TC-F08 | Componente | Se borra el token y se pulsa DELETE | No llama a la API; registra `Token is not available!` | ✅ Pasa |

### Crear y editar (`tests/views/users-create.test.jsx`, `users-edit.test.jsx`)

| ID | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-F09 | Componente | Rellenar el formulario y pulsar SAVE | `POST /api/users/create` con nombre, correo y contraseña, con el token; navega a `/admin/users` | ✅ Pasa |
| TC-F10 | Componente | La API responde 422 con dos errores | Muestra `email : Email already exists` y el error de contraseña; no navega | ✅ Pasa |
| TC-F11 | Componente | Abrir `/admin/users/edit/5` | Llama a `GET /api/users/find/5` y rellena nombre y correo; contraseña vacía | ✅ Pasa |
| TC-F12 | Componente | Cambiar el nombre a `Ana Maria`, escribir contraseña y pulsar UPDATE | `PUT /api/users/update/5` con los datos y el token; navega a `/admin/users` | ✅ Pasa |
| TC-F13 | Componente | La API responde 422 al actualizar | Muestra el error de contraseña; no navega | ✅ Pasa |

### Login, registro, dashboard e inicio (`tests/views/auth.test.jsx`, `dashboard-home.test.jsx`)

| ID | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-F14 | Componente | Credenciales válidas | `POST /api/login`; guarda las cookies `token` y `user`; marca la sesión como autenticada y navega a `/admin/dashboard` | ✅ Pasa |
| TC-F15 | Componente | La API responde `Invalid password` | Muestra el mensaje; sin cookies; no autentica ni navega | ✅ Pasa |
| TC-F16 | Componente | La API responde 422 con un error de correo | Muestra `email : Email is required` | ✅ Pasa |
| TC-F17 | Componente | Registro válido | `POST /api/register` con los tres campos; navega a `/login` | ✅ Pasa |
| TC-F18 | Componente | La API responde 422 | Muestra `email : Email already exists`; no navega | ✅ Pasa |
| TC-F19 | Componente | Cookie `user` con el nombre `Ana` | El dashboard saluda a `Ana` | ✅ Pasa |
| TC-F20 | Componente | Sin cookie `user` | El dashboard no muestra ningún nombre | ✅ Pasa |
| TC-F21 | Componente | Pantalla de inicio | Muestra el título y los enlaces REGISTER (`/register`) y LOGIN (`/login`) | ✅ Pasa |

### Menú lateral y contexto de autenticación (`tests/components/`, `tests/context/`)

| ID | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-F22 | Componente | Menú renderizado | Enlaza a `/admin/dashboard` y a `/admin/users` | ✅ Pasa |
| TC-F23 | Componente | Clic en Logout | Borra las cookies, marca la sesión como no autenticada y navega a `/login` | ✅ Pasa |
| TC-F24 | Componente | Cookie `token` presente | `AuthProvider` empieza autenticado | ✅ Pasa |
| TC-F25 | Componente | Sin cookie | `AuthProvider` empieza como anónimo | ✅ Pasa |
| TC-F26 | Componente | Se borra la cookie y se dispara el evento `storage` | Pasa a anónimo | ✅ Pasa |
| TC-F27 | Componente | Se desmonta el proveedor | Quita el listener del evento `storage` | ✅ Pasa |

### Rutas protegidas, `App` y cliente de la API (`tests/routes/`, `tests/app.test.jsx`)

| ID | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| TC-F28 | Integración | `/` sin sesión | Ruta pública: muestra la pantalla de inicio | ✅ Pasa |
| TC-F29 | Integración | `/login` y `/register` sin sesión | Muestran su formulario | ✅ Pasa (2 rutas) |
| TC-F30 | Integración | `/admin/dashboard`, `/admin/users`, `/admin/users/create` y `/admin/users/edit/1` sin sesión | Redirigen al login | ✅ Pasa (4 rutas) |
| TC-F31 | Integración | `/login` y `/register` con sesión | Redirigen al dashboard | ✅ Pasa (2 rutas) |
| TC-F32 | Integración | Las cuatro rutas de administración con sesión | Muestran DASHBOARD, USERS, ADD USER y EDIT USER | ✅ Pasa (4 rutas) |
| TC-F33 | Componente | `App` en `/` | Barra superior con el enlace HOME, botón de navegación y pantalla de inicio | ✅ Pasa |
| TC-F34 | Componente | Cliente de la API | `baseURL` es `http://localhost:3000` | ✅ Pasa |

---

## 5. Frontend: pruebas de regresión (`tests/views/users-edit.test.jsx`, `accessibility.test.jsx`)

Protegen las correcciones de Sonar. **Las seis fallaron contra el código original** de `frontend-react/src` y pasan con las correcciones.

| ID | Issue de Sonar protegido | Entrada | Resultado esperado | Antes | Resultado obtenido |
|---|---|---|---|---|---|
| TC-F35 | `S9383` promesa sin manejar | La API falla al cargar el usuario en editar | Registra `There was an error fetching the user!` y deja el formulario vacío | ❌ Falló | ✅ Pasa |
| TC-F36 | `S6853` label sin control | Formulario de crear usuario | Cada campo se localiza por su etiqueta (Full Name, Email address, Password) | ❌ Falló | ✅ Pasa |
| TC-F37 | `S6853` label sin control | Formulario de editar usuario | Cada campo se localiza por su etiqueta y trae los valores cargados | ❌ Falló | ✅ Pasa |
| TC-F38 | `S6853` label sin control | Formulario de login | Los campos de correo y contraseña se localizan por etiqueta, con su tipo correcto | ❌ Falló | ✅ Pasa |
| TC-F39 | `S6853` label sin control | Formulario de registro | Los tres campos se localizan por etiqueta, con su tipo correcto | ❌ Falló | ✅ Pasa |
| TC-F40 | `S6848` elemento no nativo | Menú lateral | `Logout` es un `button` nativo | ❌ Falló | ✅ Pasa |

---

## 6. Comprobación de que las pruebas detectan fallos

La cobertura mide qué líneas se ejecutan, no si se verifica algo. Para comprobar que las pruebas no son decorativas, se rompió el código a propósito y se comprobó que fallaba la prueba correspondiente:

| Cambio introducido en el código | Prueba que falló |
|---|---|
| URL de `DELETE` cambiada de `/api/users/delete/` a `/api/users/remove/` | `TC-F06` |
| Redirección de `/admin/users` sin sesión cambiada de `/login` a `/register` | `TC-F30` |
| Las pruebas nuevas contra el código original (regresión y seguridad) | `TC-R01` a `TC-R09`, `TC-I25` a `TC-I28` y `TC-F35` a `TC-F40` |

Después de cada experimento se restauró el código con git.
