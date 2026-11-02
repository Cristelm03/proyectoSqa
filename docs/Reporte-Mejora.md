# Reporte de Mejora

Comparación entre el código original (tag `baseline`) y el estado final de `main`. Las métricas de "antes" están detalladas en `Linea-Base-Calidad.md`; aquí se contrastan con las de "ahora" y se explica qué cambió y por qué.

| | |
|---|---|
| **Autora** | Florecita Cristel Morales Lux, carnet 5190-21-9572 |
| **Antes** | Commit `0fae5ed` (código original más la configuración de Sonar), análisis del 1 de noviembre de 2026 |
| **Ahora** | Commit `156f49f` (`main` tras el PR #7), análisis del 2 de noviembre de 2026 (UTC) |
| **Alcance del cambio** | 7 pull requests, 20 commits sin contar fusiones; 21 archivos de código de la aplicación modificados o añadidos (322 líneas añadidas, 313 eliminadas) |
| **Fuentes** | SonarQube Cloud (proyecto `Cristelm03_proyectoSqa`), `npm audit`, ESLint, Prettier, Jest y Vitest |

## 1. Resumen

- **Calidad de código (SonarQube):** de 3 bugs, 2 vulnerabilidades y 12 code smells (17 issues) a **0 issues**. Ratings de fiabilidad y seguridad de C a **A**; deuda técnica de 60 minutos a **0**.
- **Pruebas:** de 0 a **123 pruebas automatizadas** (101 casos documentados), todas en verde, con cobertura de líneas de 99.34 % en el backend y 100 % en el frontend.
- **Seguridad:** 0 vulnerabilidades en las dependencias de producción (antes 21, entre ellas 3 críticas y 15 altas); CORS restringido, cabecera `X-Powered-By` oculta y hash de contraseña fuera de las respuestas.
- **Proceso:** `main` solo recibe cambios por pull request y solo si pasan `Build`, `Test` y `Analyze`. El quality gate de Sonar rechazó un cambio real (duplicación) y lo aprobó después de corregirlo.
- **Lo que no mejoró del todo:** la duplicación bajó de 9.9 % a 3.7 %, no a cero (sección 6).

## 2. Comparación general (SonarQube Cloud)

| Métrica | Antes | Ahora | Cambio |
|---|---|---|---|
| Bugs | 3 | **0** | −3 |
| Vulnerabilidades | 2 | **0** | −2 |
| Code smells | 12 | **0** | −12 |
| Issues en total | 17 | **0** | −17 |
| Security Hotspots | 0 | 0 | — |
| Cobertura de pruebas | 0.0 % | **99.5 %** | +99.5 pp |
| Cobertura de líneas / de ramas | 0.0 % / sin medir | 99.7 % / 98.6 % | |
| Duplicación | 9.9 % | **3.7 %** (59 líneas) | −6.2 pp |
| Deuda técnica | 60 min | **0 min** | −60 min |
| Rating de fiabilidad | C | **A** | |
| Rating de seguridad | C | **A** | |
| Rating de mantenibilidad | A | A | |
| Líneas de código (ncloc) | 1 160 en 24 archivos | 1 131 en 28 archivos | |
| Quality Gate | Passed (primer análisis, sin código nuevo que evaluar) | **Passed** | |

En la línea base no había reporte de cobertura, y sin él Sonar no calcula la cobertura de ramas.

El código bajó de 1 160 a 1 131 líneas aunque se añadieron archivos: el formulario de usuarios, que estaba copiado en dos pantallas, ahora es un solo componente (`UserForm`).

## 3. Cómo evolucionó, pull request por pull request

Cada fila es el análisis que Sonar ejecuta sobre `main` después de fusionar el PR indicado.

| Análisis (commit) | Qué se fusionó | Bugs | Vulns. | Smells | Cobertura | Duplicación | Deuda | Gate |
|---|---|---|---|---|---|---|---|---|
| `0fae5ed` | Línea base | 3 | 2 | 12 | 0.0 % | 9.9 % | 60 min | OK ¹ |
| `b7020a1` | PR #1: informe de línea base | 3 | 2 | 12 | 0.0 % | 9.9 % | 60 min | OK |
| `c3d00c9` | PR #2: pruebas del backend | 3 | 2 | 13 | 0.0 % | 6.2 % | 65 min | **ERROR** ² |
| `647a01c` | PR #3: pipeline con gates, CORS y `X-Powered-By` | 3 | **0** | 12 | 62.3 % | 8.9 % | 60 min | OK |
| `4a483b9` | PR #4: ESLint y Prettier en el backend | 3 | 0 | 12 | 62.9 % | 8.9 % | 60 min | OK |
| `6a2458c` | PR #5: pruebas del frontend | 3 | 0 | 12 | 99.8 % | 8.9 % | 60 min | OK |
| `158f2b8` | PR #6: lint del frontend y corrección de bugs y smells | **0** | 0 | **0** | 99.8 % | **3.7 %** | **0 min** | OK |
| `156f49f` | PR #7: dependencias sin vulnerabilidades | 0 | 0 | 0 | 99.5 % | 3.7 % | 0 min | OK |

¹ "Sonar way" solo evalúa el código nuevo; en el primer análisis no hay con qué comparar y pasa aunque la cobertura sea 0 %. Por eso el SQA Plan impone además los umbrales de Jest y Vitest.

² Sonar contaba las pruebas como código de producción (de 1 160 a 1 709 líneas) y no encontraba el reporte de cobertura. Se corrigió en el PR #3 con `sonar.tests`, las exclusiones y el prefijo de rutas del `lcov`.

### Sobre la base de cálculo de la cobertura

La columna de cobertura no se puede comparar fila a fila sin una precaución: cambia **cuántas líneas se cuentan**, no solo cuántas se cubren.

| Análisis | Líneas a cubrir | Por qué |
|---|---|---|
| `0fae5ed` a `4a483b9` | 253 a 269 (638 en `c3d00c9`, donde se contaban las pruebas como código) | Sonar estima las líneas ejecutables de los archivos sin reporte y usa el reporte en los que lo tienen (solo el backend hasta el PR #4) |
| `6a2458c` y `158f2b8` | 757 y 740 | El reporte de cobertura de Vitest 2 con V8 cuenta casi todas las líneas de cada archivo |
| `156f49f` | 295 | Con Vitest 4 (PR #7) solo se cuentan las líneas ejecutables; el código de la aplicación no cambió |

El 99.5 % final está medido sobre la base más fiel al código real (295 líneas, 1 sin cubrir). La bajada de 99.8 % a 99.5 % no es una pérdida de pruebas: es el mismo código medido con una regla más estricta.

## 4. Análisis estático y formato (local, en la etapa `Build`)

| Métrica | Antes | Ahora |
|---|---|---|
| ESLint, backend | 11 errores (todos `no-unused-vars`) ³ | **0** |
| ESLint, frontend | 7 errores y 1 advertencia | **0** |
| Prettier, backend | 5 de 10 archivos sin el formato esperado ³ | **0** |
| Prettier, frontend | 8 de 16 archivos sin el formato esperado ³ | **0** |

³ El backend original no tenía linter y el frontend no tenía Prettier. Para poder comparar, la configuración nueva se aplicó al código del tag `baseline` en un worktree temporal (`Linea-Base-Calidad.md`, sección 3).

Ahora ambas comprobaciones son obligatorias: la etapa `Build` falla si hay un error de ESLint o un archivo sin formato. El pipeline de `main` (CI #11) las pasa.

## 5. Pruebas

| Métrica | Antes | Ahora |
|---|---|---|
| Pruebas automatizadas | 0 (`npm test` era un stub) | **123** (75 backend + 48 frontend) |
| Casos documentados en `Matriz-Pruebas.md` | 0 | 101 (`TC-U`, `TC-I`, `TC-R`, `TC-F`) |
| Archivos de prueba | 0 | 18 |
| Pruebas en verde | — | 123 de 123 |

Cobertura medida el 1 de noviembre de 2026 al ejecutar cada suite sobre `main`:

| Paquete | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| Backend (Jest 29 + Supertest 7) | 99.37 % | 97.72 % | 100 % | 99.34 % |
| Frontend (Vitest 4 + React Testing Library) | 100 % | 100 % | 100 % | 100 % |
| Umbral exigido por el pipeline | 60 % | 60 % | 60 % | 60 % |

La única línea del backend sin cubrir está en `utils/validators/user.js` (línea 17); es la misma línea sin cubrir que reporta Sonar.

**Las pruebas detectan fallos, no solo ejecutan líneas.** Las pruebas de regresión se ejecutaron primero contra el código sin corregir: de las 11 del backend **fallaron 10** (la restante protege la compatibilidad con el frontend) y de las 6 del frontend **fallaron las 6**. Además, al romper el código a propósito dos veces, falló la prueba correspondiente (`Matriz-Pruebas.md`, sección 6).

## 6. Defectos y hallazgos corregidos

### Detectados por SonarQube (17 issues, todos resueltos)

| Regla | Qué era | Cantidad | Corregido en | Cómo se verifica |
|---|---|---|---|---|
| `S5122` | CORS abierto a cualquier origen | 1 | PR #3 | `TC-I25` a `TC-I28` |
| `S5689` | Express revelaba su versión (`X-Powered-By`) | 1 | PR #3 | `TC-I25` a `TC-I28` |
| `S9383` | Promesas sin `await` ni `.catch` | 3 | PR #6 | `TC-F35`, `TC-F06` y `TC-F07` |
| `S6853` | `<label>` sin control asociado | 11 | PR #6 | `TC-F36` a `TC-F39` |
| `S6848` | `Logout` era un elemento no nativo interactivo | 1 | PR #6 | `TC-F40` |

### Detectados al revisar el código (`Linea-Base-Calidad.md`, sección 4)

| # | Defecto | Estado | Prueba |
|---|---|---|---|
| 1 | `createUser`, `updateUser` y `register` devolvían el hash de la contraseña | Corregido (`omitPassword`) | `TC-R01` a `TC-R03` |
| 2 | `findUserById` respondía 200 con `data: null` | Corregido: 404 | `TC-R04` |
| 3 | `updateUser` y `deleteUser` con id inexistente respondían 500 | Corregido: 404 | `TC-R05`, `TC-R06` |
| 4 | El middleware rechazaba `Authorization: Bearer <token>` | Corregido, sin romper el token sin prefijo que usa el frontend | `TC-R07`, `TC-R08` |
| 5 | `index.js` abría el puerto al importarse | Corregido: `app.js` exporta la aplicación | Todas las de integración |
| 6 | Bloque de validación duplicado | **Parcial** (ver abajo) | — |
| 7 | Un id no numérico producía un 500 de Prisma | Corregido: 400 | `TC-R09` |

**Sobre el defecto 6.** La duplicación del frontend se resolvió (`create.jsx` y `edit.jsx` compartían 41 líneas idénticas; ahora comparten `UserForm`). En el backend sigue duplicada la lógica de `register` (`RegisterController.js`) y de `createUser` (`UserController.js`): validación, hash de la contraseña y alta del usuario, 29 y 30 líneas. Son las 59 líneas que explican el 3.7 % de duplicación actual, según Sonar. No se corrigió: las dos rutas difieren en el mensaje de éxito y en el manejo de errores, y ambas tienen pruebas. Queda como deuda aceptada (`SQA-Plan.md`, sección 9).

## 7. Seguridad de las dependencias (`npm audit`)

| Paquete | Alcance | Antes | Ahora |
|---|---|---|---|
| Backend | Producción (`--omit=dev`) | 14 (2 críticas, 10 altas) | **0** |
| Frontend | Producción (`--omit=dev`) | 7 (1 crítica, 5 altas) | **0** |
| Backend | Todo, con herramientas de desarrollo | 14 | 25 (21 moderadas, 4 bajas; **ninguna crítica ni alta**) |
| Frontend | Todo, con herramientas de desarrollo | 24 (1 crítica, 16 altas, 5 moderadas, 2 bajas) | 6 (5 moderadas, 1 baja; **ninguna crítica ni alta**) |

Lo que corrigió las dependencias de producción:

- `bcrypt` 5.1 a 6.0 en el backend: eliminó `@mapbox/node-pre-gyp` y `tar`, que traían las 2 críticas y 10 altas. La API de `hash` y `compare` no cambió.
- `react-router-dom` 6.30 a 7.18 en el frontend: corrige la redirección abierta (*open redirect*) de `react-router`.
- `vite` 5 a 6.4, `vitest` 2 a 4.1 y `@vitejs/plugin-react` 4.3 a 4.7: el entorno de pruebas arrastraba 3 críticas y 1 alta.

**El total del backend subió de 14 a 25** aunque la producción bajó a 0. La diferencia son 25 avisos moderados y bajos de las herramientas de desarrollo que se añadieron (ESLint y Jest), que no se publican con la aplicación. El detalle de esta decisión está en el PR #7.

## 8. Evidencia de que el quality gate bloquea

1. **PR #2 (`c3d00c9`): gate en ERROR.** El primer análisis con pruebas falló porque Sonar contaba los archivos de prueba como código. Se corrigió la configuración (PR #3).
2. **PR #6, CI #7: pipeline en rojo.** La etapa `Analyze` falló con `new_duplicated_lines_density` de **12.8 %** frente al máximo de 3 %. Al modificar `create.jsx` y `edit.jsx`, las 41 líneas copiadas pasaron a contar como código nuevo. El PR no se podía fusionar.
3. **PR #6, CI #8: pipeline en verde.** Tras extraer `UserForm` y `FormField`, la duplicación del código nuevo bajó a **0.0 %**, la cobertura del código nuevo fue 100 % y el gate pasó.

Las tres situaciones están en el historial de Actions y en el historial de análisis de Sonar, y sirven de demostración en el video.

## 9. Limitaciones

- La duplicación sigue en 3.7 % (sección 6, defecto 6).
- Las pruebas del backend simulan Prisma: verifican rutas, validaciones, autenticación y contratos HTTP, pero no el SQL real ni las restricciones de MySQL. Una cobertura de 99 % no significa que la base de datos esté probada.
- No hay pruebas end-to-end con navegador real ni de rendimiento.
- El gate de Sonar evalúa el código nuevo; la cobertura y la duplicación globales las vigilan los umbrales de Jest y Vitest y esta comparación manual.
- La comparación del backend original con ESLint y Prettier se hizo aplicando a posteriori una configuración que el proyecto original no tenía.

## 10. Cómo reproducir esta comparación

```bash
git checkout baseline                      # código original
cd backend-express && npm install && npm audit
cd ../frontend-react && npm install && npm audit && npx eslint .

git checkout main                          # estado final
cd backend-express && npm ci && npm run lint && npm run format:check && npm run test:coverage && npm audit --omit=dev
cd ../frontend-react && npm ci && npm run lint && npm run format:check && npm run test:coverage && npm audit --omit=dev
```

Las métricas de SonarQube Cloud están en el dashboard del proyecto (`Cristelm03_proyectoSqa`), en el historial de análisis de `main`: la revisión `0fae5ed` es el "antes" y la `156f49f` el "ahora".
