# Plan de Aseguramiento de la Calidad del Software (SQA Plan)

| | |
|---|---|
| **Proyecto** | Pipeline CI/CD con Aseguramiento de Calidad Integrado |
| **Aplicación intervenida** | Gestión de usuarios con login JWT (React + Express + Prisma + MySQL) |
| **Estudiante** | Florecita Cristel Morales Lux, carnet 5190-21-9572 (trabajo individual) |
| **Curso** | Aseguramiento de la Calidad del Software (SQA) |
| **Versión / fecha** | 1.0 / 1 de noviembre de 2026 |
| **Repositorio** | https://github.com/Cristelm03/proyectoSqa |

## 1. Propósito

Definir cómo se asegura la calidad de la aplicación durante el proyecto: qué se verifica, con qué herramientas, con qué umbrales y qué ocurre cuando un cambio no los cumple. El plan toma como marco de referencia la estructura de **IEEE 730** (procesos de aseguramiento de la calidad del software) y las características del modelo de calidad **ISO/IEC 25010**; se usa como guía, no se declara una certificación.

El objetivo medible es que **ningún cambio llegue a la rama `main` sin pasar automáticamente por pruebas, análisis estático, cobertura mínima y un quality gate**, y demostrar con métricas (antes y después) el efecto de esas actividades sobre el producto.

## 2. Alcance

**Incluye**

- El backend (`backend-express`) y el frontend (`frontend-react`) de la aplicación.
- Pruebas unitarias, de integración y de regresión automatizadas, con cobertura mínima.
- Análisis estático (ESLint, Prettier, SonarQube Cloud) y quality gates.
- Control de configuración: ramas, pull requests obligatorios y protección de `main`.
- Medición de la calidad antes y después de la intervención, y gestión de la deuda técnica.

**No incluye**

- Desarrollar una aplicación nueva: se reutiliza un proyecto open source existente (licencia MIT).
- Pruebas de carga, estrés o rendimiento.
- Pruebas end-to-end con navegador real, contenedores Docker, despliegue automático (CD) y notificaciones. Son opcionales en el enunciado y se dejaron fuera.

### Características de calidad atendidas (ISO/IEC 25010)

| Característica | Cómo se aborda en el proyecto |
|---|---|
| Adecuación funcional | Pruebas unitarias, de integración y de regresión sobre la API y la interfaz |
| Fiabilidad | Bugs de Sonar en cero; manejo de errores y de promesas rechazadas |
| Seguridad | Vulnerabilidades de Sonar y de dependencias en cero en producción; CORS restringido; la API no devuelve el hash de la contraseña |
| Mantenibilidad | Linter y formato obligatorios, duplicación acotada, deuda técnica medida |
| Usabilidad (accesibilidad básica) | Etiquetas asociadas a sus campos y controles nativos (reglas S6853 y S6848 de Sonar) |

## 3. Estándares y referencias

| Referencia | Uso |
|---|---|
| IEEE 730 | Estructura de este plan |
| ISO/IEC 25010 | Características de calidad evaluadas |
| Conventional Commits | Formato de los mensajes de commit (`feat`, `fix`, `test`, `ci`, `docs`, `style`, `refactor`, `chore`) |
| GitHub flow | Una rama por cambio, pull request y merge a `main` |
| Quality gate "Sonar way" | Condiciones de aceptación del código nuevo en SonarQube Cloud |
| Reglas recomendadas de ESLint y estilo de Prettier | Convenciones de código |

## 4. Organización y responsabilidades

El proyecto es individual, así que una sola persona cumple todos los roles. Para que la revisión no dependa solo de ella, se apoya en controles automáticos que no se pueden omitir.

| Rol | Responsable | Qué hace |
|---|---|---|
| Desarrolladora | Florecita Cristel Morales Lux | Escribe código, pruebas y documentación |
| Responsable de calidad | Florecita Cristel Morales Lux | Define umbrales, interpreta métricas y decide qué issues se corrigen |
| Revisora de código | Florecita Cristel Morales Lux + controles automáticos | Revisa el diff de cada pull request y exige los checks en verde |

### Revisión de código

- **Automática (obligatoria):** cada pull request ejecuta `Build`, `Test` y `Analyze`; la protección de `main` impide el merge si alguno falla.
- **Manual:** antes de hacer merge se revisa el diff completo con esta lista:
  1. El cambio tiene pruebas y las pruebas fallan sin el cambio.
  2. No se añaden secretos, contraseñas ni claves al repositorio.
  3. El mensaje de commit sigue Conventional Commits y el PR explica qué cambia y por qué.
  4. La documentación afectada está actualizada.
  5. El análisis de Sonar del PR no introduce issues nuevos.

## 5. Actividades de SQA

| # | Actividad | Herramienta | Cuándo | Evidencia |
|---|---|---|---|---|
| 1 | Pruebas unitarias | Jest, Vitest, React Testing Library | En cada pull request y en cada push a `main` | `Matriz-Pruebas.md`, etapa `Test` |
| 2 | Pruebas de integración | Supertest sobre la API real con Prisma simulado | Ídem | `Matriz-Pruebas.md` |
| 3 | Pruebas de regresión | Jest (casos `TC-R`) y Vitest (`TC-F35` a `TC-F40`) | Ídem | Fallan contra el código original y pasan tras la corrección |
| 4 | Cobertura con umbral | Jest `--coverage`, Vitest `--coverage` (V8) | Ídem | Reporte en el resumen del workflow |
| 5 | Análisis estático | ESLint 9, Prettier 3, SonarQube Cloud | Ídem | Etapas `Build` y `Analyze` |
| 6 | Quality gate | SonarQube Cloud (`sonar.qualitygate.wait=true`) | Ídem | La etapa `Analyze` falla si el gate no pasa |
| 7 | Control de configuración | Git, GitHub, ruleset "Proteger main" | Siempre | Historial de PR numerados |
| 8 | Medición antes y después | Tag `baseline`, SonarQube Cloud, `npm audit` | Línea base y cierre | `Linea-Base-Calidad.md`, `Reporte-Mejora.md` |
| 9 | Gestión de deuda técnica | Deuda estimada de Sonar y `npm audit` | Fase 4 y cierre | Sección 9 y `Reporte-Mejora.md` |

## 6. Métricas y umbrales (quality gates)

Cada umbral se evalúa de forma automática. Si no se cumple, **el pipeline falla y el pull request no puede aceptarse**.

| Métrica | Umbral | Quién lo evalúa | Línea base |
|---|---|---|---|
| Pruebas | 100 % de las pruebas pasan | Jest y Vitest | 0 pruebas |
| Cobertura global (sentencias, ramas, funciones y líneas) | ≥ 60 % en **cada** paquete | `jest.config.js` y `vitest.config.js` | 0 % |
| Cobertura del código nuevo | ≥ 80 % | Quality gate de Sonar | — |
| Bugs, vulnerabilidades y code smells nuevos | Rating A en fiabilidad, seguridad y mantenibilidad del código nuevo | Quality gate de Sonar | 3 bugs, 2 vulnerabilidades, 12 smells |
| Duplicación del código nuevo | ≤ 3 % | Quality gate de Sonar | 9.9 % |
| Security hotspots del código nuevo | 100 % revisados | Quality gate de Sonar | 0 |
| ESLint | 0 errores | Etapa `Build` | Backend 11, frontend 7 (más 1 advertencia) |
| Prettier | 0 archivos sin formato | Etapa `Build` | Backend 5 de 10, frontend 8 de 16 |
| Vulnerabilidades de dependencias de producción (`npm audit --omit=dev`) | 0 críticas y 0 altas | Revisión manual en cada cierre | Backend 14, frontend 7 |

**Definición de la cobertura mínima.** El 60 % se exige sobre las cuatro métricas (sentencias, ramas, funciones y líneas) de cada paquete por separado. SonarQube Cloud informa además su cobertura combinada, pero el umbral que hace fallar el pipeline es el de Jest y Vitest, porque es el más estricto.

## 7. Herramientas

| Herramienta | Versión | Para qué |
|---|---|---|
| GitHub y GitHub Actions | — | Repositorio, pull requests y pipeline CI/CD |
| Node.js | 20 | Entorno de ejecución del pipeline |
| Jest | 29 | Pruebas del backend |
| Supertest | 7 | Pruebas de integración de la API |
| Vitest con V8 | 4 | Pruebas y cobertura del frontend |
| React Testing Library, jsdom | 16 / 25 | Pruebas de componentes |
| ESLint | 9 | Análisis estático de código |
| Prettier | 3 | Formato obligatorio |
| SonarQube Cloud (plan Free) | — | Análisis estático, cobertura y quality gate |
| `npm audit` | — | Vulnerabilidades de dependencias |

## 8. Pipeline y protección de la rama principal

El pipeline `.github/workflows/ci.yml` se ejecuta en cada pull request hacia `main` y en cada push a `main`:

| Etapa | Qué hace | Falla si |
|---|---|---|
| `Build` | Instala dependencias, ejecuta ESLint y Prettier en backend y frontend, y compila el frontend | Hay errores de lint, formato o compilación |
| `Test` | Ejecuta las pruebas con cobertura de backend y frontend | Una prueba falla o la cobertura queda bajo 60 % |
| `Analyze` | Envía código y cobertura a SonarQube Cloud y espera el quality gate | El gate no pasa |
| `Report` | Resume resultados y cobertura en la página del workflow | (siempre se ejecuta) |

La ruleset **"Proteger main"** está activa, sin lista de excepciones: exige pull request, exige que `Build`, `Test` y `Analyze` pasen, y bloquea los force push y el borrado de la rama.

## 9. Gestión de la deuda técnica

- **Cómo se mide:** la deuda estimada y los ratings de mantenibilidad de SonarQube Cloud, más los resultados de `npm audit`.
- **Política:** no se acepta código nuevo con issues nuevos (el gate lo impone) y los issues heredados se corrigen en la Fase 4, de mayor a menor severidad.
- **Deuda reconocida y aceptada** al cierre:

| Elemento | Motivo por el que se acepta | Plan |
|---|---|---|
| Avisos moderados y bajos de `npm audit` en herramientas de desarrollo (ESLint, Jest): 25 en el backend y 6 en el frontend, ninguno crítico ni alto | No se publican con la aplicación; los arreglos requieren saltos de versión mayor de las herramientas | Revisar en cada cierre y actualizar cuando haya un arreglo compatible |
| Duplicación de 3.7 % (59 líneas): la lógica de alta de usuario está repetida en `register` (`RegisterController.js`) y en `createUser` (`UserController.js`) | Las dos rutas difieren en el mensaje de éxito y en el manejo de errores, y ambas tienen pruebas; el gate solo exige ≤ 3 % en el código nuevo | Extraer una función común si se vuelve a tocar esa zona |
| Las pruebas de integración usan Prisma simulado | Evita depender de una base de datos en el pipeline | Añadir pruebas contra MySQL real si el proyecto continúa |
| Las acciones de GitHub declaran Node 20, ya en desuso | Solo genera advertencias | Subir versiones de las acciones cuando existan |

## 10. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Una cobertura alta sobre pruebas con base de datos simulada da una falsa sensación de seguridad | Media | Medio | Documentar la limitación; la regresión y la integración verifican contratos HTTP y reglas de negocio |
| Pérdida de acceso a SonarQube Cloud (sesión, límites del plan Free: 50 mil líneas privadas) | Baja | Medio | El repo es público; el umbral de Jest y Vitest sigue fallando el pipeline sin Sonar |
| Filtración de secretos en el repositorio público | Baja | Alto | El historial se revisó antes de publicarlo; el token vive en GitHub Secrets; `.env` está en `.gitignore` |
| Vulnerabilidades en dependencias | Media | Alto | `npm audit` en cada cierre; se actualizaron bcrypt, react-router-dom, Vite y Vitest |
| Cambios que tocan código sin pruebas bloquean el gate de Sonar | Media | Bajo | Escribir las pruebas primero, sin tocar el código fuente; así ocurrió con el frontend |
| Cambios de saltos de línea entre Windows y Linux rompen el formato | Media | Bajo | `endOfLine: "auto"` en Prettier |
| Entrega fuera de fecha | Baja | Alto | Plan por fases y terminar antes del 5 de noviembre |

## 11. Fases y cronograma

| Fase | Contenido | Estado |
|---|---|---|
| 1. Planeación y preparación | Selección de la aplicación, SQA Plan, entorno y línea base | Completada |
| 2. Pruebas automatizadas | Matriz de pruebas, unitarias, integración, regresión y cobertura | Completada |
| 3. Pipeline CI/CD | Pipeline, análisis estático, quality gates y protección de ramas | Completada |
| 4. Análisis y mejora | Corrección de issues, métricas y comparativa antes y después | Completada |
| 5. Cierre y presentación | Documentación, presentación en PDF, video y entrega | En curso; entrega el 5 de noviembre de 2026 |

## 12. Criterios de aceptación del proyecto

Un cambio se considera terminado cuando cumple **todo** lo siguiente:

1. Tiene pruebas y todas pasan.
2. La cobertura de cada paquete es de al menos 60 %.
3. ESLint y Prettier no reportan problemas.
4. El quality gate de SonarQube Cloud está en OK.
5. Pasó por un pull request y los tres checks obligatorios están en verde.

## 13. Control de cambios del documento

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 1 de noviembre de 2026 | Versión inicial, redactada con la línea base medida y los umbrales ya aplicados por el pipeline |
