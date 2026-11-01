// Genera el resumen en Markdown que se muestra en la pagina de cada ejecucion del CI.
// Lee los coverage-summary.json del backend y del frontend (si existen) y los resultados de los jobs.
const fs = require("fs");

const THRESHOLD = 60;
const PACKAGES = [
  { name: "backend", file: "backend-express/coverage/coverage-summary.json" },
  { name: "frontend", file: "frontend-react/coverage/coverage-summary.json" },
];
const METRICS = [
  ["Sentencias", "statements"],
  ["Ramas", "branches"],
  ["Funciones", "functions"],
  ["Líneas", "lines"],
];

const icon = (result) => (result === "success" ? "✅" : result === "skipped" ? "⏭️" : "❌");

const lines = ["## Resultado del pipeline de calidad", ""];

lines.push("| Etapa | Resultado |", "|---|---|");
lines.push(
  `| Test (pruebas + umbral de cobertura ${THRESHOLD} %) | ${icon(process.env.TEST_RESULT)} ${process.env.TEST_RESULT} |`
);
lines.push(
  `| Analyze (SonarQube Cloud + quality gate) | ${icon(process.env.ANALYZE_RESULT)} ${process.env.ANALYZE_RESULT} |`
);
lines.push("");

for (const { name, file } of PACKAGES) {
  lines.push(`### Cobertura del ${name}`, "");
  if (!fs.existsSync(file)) {
    lines.push("_No se generó el reporte de cobertura._", "");
    continue;
  }
  const { total } = JSON.parse(fs.readFileSync(file, "utf8"));
  lines.push("| Métrica | Cobertura | Umbral |", "|---|---|---|");
  for (const [label, key] of METRICS) {
    const pct = total[key].pct;
    lines.push(`| ${label} | ${pct} % | ${pct >= THRESHOLD ? "✅" : "❌"} ≥ ${THRESHOLD} % |`);
  }
  lines.push("");
}

console.log(lines.join("\n"));
