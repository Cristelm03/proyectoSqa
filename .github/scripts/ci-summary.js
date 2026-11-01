// Genera el resumen en Markdown que se muestra en la pagina de cada ejecucion del CI.
// Lee backend-express/coverage/coverage-summary.json (si existe) y los resultados de los jobs.
const fs = require("fs");

const THRESHOLD = 60;
const SUMMARY_FILE = "backend-express/coverage/coverage-summary.json";

const icon = (result) => (result === "success" ? "✅" : result === "skipped" ? "⏭️" : "❌");

const lines = ["## Resultado del pipeline de calidad", ""];

lines.push("| Etapa | Resultado |", "|---|---|");
lines.push(`| Test (pruebas + umbral de cobertura ${THRESHOLD} %) | ${icon(process.env.TEST_RESULT)} ${process.env.TEST_RESULT} |`);
lines.push(`| Analyze (SonarQube Cloud + quality gate) | ${icon(process.env.ANALYZE_RESULT)} ${process.env.ANALYZE_RESULT} |`);
lines.push("");

if (fs.existsSync(SUMMARY_FILE)) {
  const { total } = JSON.parse(fs.readFileSync(SUMMARY_FILE, "utf8"));
  lines.push("### Cobertura del backend", "", "| Métrica | Cobertura | Umbral |", "|---|---|---|");
  for (const [name, key] of [
    ["Sentencias", "statements"],
    ["Ramas", "branches"],
    ["Funciones", "functions"],
    ["Líneas", "lines"],
  ]) {
    const pct = total[key].pct;
    lines.push(`| ${name} | ${pct} % | ${pct >= THRESHOLD ? "✅" : "❌"} ≥ ${THRESHOLD} % |`);
  }
} else {
  lines.push("_No se generó el reporte de cobertura._");
}

console.log(lines.join("\n"));
