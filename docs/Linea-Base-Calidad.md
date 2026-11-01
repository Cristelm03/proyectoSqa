# Línea Base de Calidad

Métricas del código **antes de la intervención**. Son el "antes" de la comparativa que se presenta en `Reporte-Mejora.md`.

## 1. Qué se midió

| Dato | Valor |
|---|---|
| Aplicación | Gestión de usuarios con login JWT (React + Vite, Express, Prisma, MySQL) |
| Origen | Proyecto open source [arda-bahrul-ulum/express-reactjs](https://github.com/arda-bahrul-ulum/express-reactjs), licencia MIT |
| Código medido | Tag `baseline` (commit `2a43b01`, estado original sin modificar) |
| Commit analizado | `0fae5ed` = `baseline` + solo `sonar-project.properties` y el workflow de Sonar. **No cambia ni una línea de código de la aplicación.** |
| Herramienta | SonarQube Cloud (plan Free), organización `cristelm03`, proyecto `Cristelm03_proyectoSqa` |
| Análisis | 2026-11-01 01:30 UTC, ejecutado por GitHub Actions (`SonarQube Baseline`) |

## 2. Métricas de SonarQube Cloud

| Métrica | Línea base |
|---|---|
| Líneas de código (ncloc) | 1 160 en 24 archivos |
| Quality Gate (Sonar way) | Passed (ver nota) |
| Bugs | **3** |
| Vulnerabilidades | **2** |
| Security Hotspots | 0 |
| Code smells | **12** |
| Issues en total | **17** |
| Cobertura de pruebas | **0.0 %** |
| Duplicación | **9.9 %** |
| Deuda técnica | 1 h (60 min) |
| Rating de fiabilidad | C |
| Rating de seguridad | C |
| Rating de mantenibilidad | A |

> **Nota sobre el Quality Gate.** El gate por defecto "Sonar way" aplica sus condiciones al *código nuevo*. En el primer análisis no hay referencia previa, así que marca *Passed* aunque la cobertura sea 0 %. Por eso el SQA Plan define umbrales propios que sí fallan el pipeline (ver `SQA-Plan.md`).

### Detalle de los 17 issues

| Regla | Tipo | Severidad | Cantidad | Dónde |
|---|---|---|---|---|
| `S9383` Promesas sin `await` ni `.catch` | Bug | Major | 3 | `edit.jsx:47`, `users/index.jsx:45` y `:62` |
| `S5122` CORS habilitado para cualquier origen | Vulnerabilidad | Major | 1 | `backend-express/index.js:17` |
| `S5689` Express revela su versión (`X-Powered-By`) | Vulnerabilidad | Minor | 1 | `backend-express/index.js:14` |
| `S6853` `<label>` sin control asociado | Code smell | Major | 11 | `create.jsx`, `edit.jsx`, `login.jsx`, `register.jsx` |
| `S6848` Elemento no nativo interactivo | Code smell | Major | 1 | `SidebarMenu.jsx:51` |

## 3. Métricas locales (sin SonarQube)

Medidas el 2026-10-31 sobre el tag `baseline`, con Node 20.18 y npm 10.8.

| Métrica | Backend (`backend-express`) | Frontend (`frontend-react`) |
|---|---|---|
| Archivos de código / líneas físicas | 9 / 530 | 13 / 938 |
| Pruebas automatizadas | 0 (`npm test` es un stub) | 0 |
| Cobertura | 0 % | 0 % |
| Linter configurado | No | Sí (ESLint): **7 errores, 1 warning** |
| `npm audit`: vulnerabilidades | **14** (2 críticas, 10 altas, 2 moderadas) | **24** (1 crítica, 16 altas, 5 moderadas, 2 bajas) |

Reglas de ESLint que fallan en el frontend: `no-unused-vars` (6), `react/prop-types` (1), `react-hooks/exhaustive-deps` (1).

## 4. Defectos conocidos que las herramientas no detectan

Se encontraron al revisar el código a mano. Son candidatos directos a **pruebas de regresión**:

1. `createUser` y `updateUser` devuelven el objeto completo de Prisma, **incluido el hash de la contraseña**.
2. `findUserById` responde `200` con `data: null` cuando el usuario no existe (debería ser `404`).
3. `updateUser` y `deleteUser` con un id inexistente responden `500` (debería ser `404`).
4. El middleware `verifyToken` espera el token crudo en `Authorization`, sin el esquema `Bearer`.
5. `index.js` llama a `app.listen` al importarse, lo que impide probar la API con Supertest sin levantar el servidor.
6. El bloque de validación se repite en 4 funciones. Falta verificar qué archivos concentran la duplicación del 9.9 % (los formularios del frontend también son candidatos).

## 5. Cómo reproducir esta medición

```bash
git checkout baseline          # código original
cd backend-express && npm install && npm audit
cd ../frontend-react && npm install && npm audit && npx eslint .
```

Las métricas de SonarQube Cloud están en el dashboard del proyecto, en el análisis de la revisión `0fae5ed`.
