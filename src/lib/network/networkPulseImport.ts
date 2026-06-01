import type {
  NetworkGeneSignal,
  NetworkInteractionEdge,
  NetworkPathwaySignal,
  NetworkPulseImport,
  ScenarioPreset
} from "@/lib/ontology/types";

export type NetworkPulseCsvInput = {
  label: string;
  source?: string;
  scenarioId: string;
  genesCsv: string;
  edgesCsv?: string;
  pathwaysCsv?: string;
};

export function createNetworkPulseImport(input: NetworkPulseCsvInput): NetworkPulseImport {
  const genes = parseGenesCsv(input.genesCsv);
  const edges = parseEdgesCsv(input.edgesCsv ?? "");
  const pathways = parsePathwaysCsv(input.pathwaysCsv ?? "");
  const retainedSymbols = new Set(genes.map((gene) => gene.symbol));
  const retainedEdges = edges.filter((edge) => retainedSymbols.has(edge.source) && retainedSymbols.has(edge.target));
  const retainedPathways = pathways.map((pathway) => ({
    ...pathway,
    genes: pathway.genes.filter((gene) => retainedSymbols.has(gene))
  }));
  const topGene = [...genes].sort((a, b) => Math.abs(b.log2FC) - Math.abs(a.log2FC))[0];
  const topHub = rankNetworkGenes({ genes, edges: retainedEdges, pathways: retainedPathways })[0];

  return {
    id: `network-${slug(input.label)}-${Date.now().toString(36)}`,
    label: input.label.trim() || "Imported Network Pulse signal",
    source: input.source?.trim() || "Local CSV import",
    importedAt: new Date().toISOString(),
    scenarioId: input.scenarioId,
    genes,
    edges: retainedEdges,
    pathways: retainedPathways,
    summary: `${genes.length} genes, ${retainedEdges.length} retained edges, ${retainedPathways.length} pathway rows. Strongest signal: ${topGene?.symbol ?? "none"}. Top hub: ${topHub?.symbol ?? "none"}.`
  };
}

export function rankNetworkGenes(input: Pick<NetworkPulseImport, "genes" | "edges" | "pathways">) {
  const degreeMap = new Map<string, number>();
  input.edges.forEach((edge) => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1);
  });

  return input.genes
    .map((gene) => {
      const degree = degreeMap.get(gene.symbol) ?? 0;
      const pathwayCount = input.pathways.filter((pathway) => pathway.genes.includes(gene.symbol)).length;
      const pWeight = gene.pAdj > 0 ? Math.min(1, -Math.log10(gene.pAdj) / 12) : 1;
      const score = clamp(Math.abs(gene.log2FC) / 4, 0, 1) * 0.48 + Math.min(degree / 6, 1) * 0.34 + Math.min(pathwayCount / 4, 1) * 0.12 + pWeight * 0.06;
      return { ...gene, degree, pathwayCount, score: round(score) };
    })
    .sort((a, b) => b.score - a.score);
}

export function defaultNetworkPulseCsvForPreset(preset: ScenarioPreset) {
  const rows = preset.keyGenes.map((gene, index) => {
    const sign = index % 3 === 1 ? -1 : 1;
    const log2FC = sign * (2.4 - index * 0.22);
    return `${gene},${gene} signal,${log2FC.toFixed(2)},${(10 ** -(6 - Math.min(index, 4))).toExponential(1)}`;
  });
  const edges = preset.keyGenes.slice(0, -1).map((gene, index) => `${gene},${preset.keyGenes[index + 1]},${(0.92 - index * 0.06).toFixed(2)}`);
  const pathways = preset.keyPathways.map((pathway, index) => `${pathway},${index % 2 ? "Reactome" : "GO:BP"},${(10 ** -(5 - Math.min(index, 3))).toExponential(1)},${preset.keyGenes.slice(0, Math.max(2, preset.keyGenes.length - index)).join("|")}`);

  return {
    genesCsv: ["symbol,name,log2FC,pAdj", ...rows].join("\n"),
    edgesCsv: ["source,target,score", ...edges].join("\n"),
    pathwaysCsv: ["name,source,pValue,genes", ...pathways].join("\n")
  };
}

function parseGenesCsv(raw: string): NetworkGeneSignal[] {
  const lines = nonEmptyLines(raw);
  const dataLines = lines[0]?.toLowerCase().includes("symbol") ? lines.slice(1) : lines;
  const genes = dataLines.map((line) => {
    const [symbol, name, log2FC, pAdj, direction] = splitCsvLine(line);
    const foldChange = Number(log2FC);
    const adjusted = Number(pAdj);
    if (!symbol || !name || Number.isNaN(foldChange) || Number.isNaN(adjusted)) {
      throw new Error(`Invalid gene row: ${line}`);
    }
    const inferredDirection: NetworkGeneSignal["direction"] = direction === "up" || direction === "down" ? direction : foldChange >= 0 ? "up" : "down";
    return {
      symbol: symbol.toUpperCase(),
      name,
      log2FC: foldChange,
      pAdj: adjusted,
      direction: inferredDirection
    };
  });
  if (!genes.length) throw new Error("Import at least one gene row.");
  return genes;
}

function parseEdgesCsv(raw: string): NetworkInteractionEdge[] {
  const lines = nonEmptyLines(raw);
  if (!lines.length) return [];
  const dataLines = lines[0]?.toLowerCase().includes("source") ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const [source, target, score] = splitCsvLine(line);
    const parsedScore = Number(score);
    if (!source || !target || Number.isNaN(parsedScore)) throw new Error(`Invalid edge row: ${line}`);
    return { source: source.toUpperCase(), target: target.toUpperCase(), score: clamp(parsedScore, 0, 1) };
  });
}

function parsePathwaysCsv(raw: string): NetworkPathwaySignal[] {
  const lines = nonEmptyLines(raw);
  if (!lines.length) return [];
  const dataLines = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const [name, source, pValue, genes] = splitCsvLine(line);
    const parsedP = Number(pValue);
    if (!name || !source || Number.isNaN(parsedP)) throw new Error(`Invalid pathway row: ${line}`);
    if (source !== "KEGG" && source !== "Reactome" && source !== "GO:BP" && source !== "Curated") {
      throw new Error(`Invalid pathway source in row: ${line}`);
    }
    return {
      name,
      source,
      pValue: parsedP,
      genes: genes ? genes.split("|").map((gene) => gene.trim().toUpperCase()).filter(Boolean) : []
    };
  });
}

function nonEmptyLines(raw: string) {
  return raw.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
}

function splitCsvLine(line: string) {
  return line.split(",").map((item) => item.trim());
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "signal";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
