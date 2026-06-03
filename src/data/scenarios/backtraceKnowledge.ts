import type { BacktraceCandidate, BodyRegionId, ScenarioPreset } from "@/lib/ontology/types";

type CandidateSeed = Omit<BacktraceCandidate, "score"> & {
  baseScore: number;
  scenarioIds: string[];
};

const assumptions = [
  "Reverse reasoning candidate, not causal proof",
  "Scores are deterministic sandbox rankings from selected scenario state",
  "Candidate list is hypothesis-generating and requires external scientific review"
];

export const backtraceSeeds: CandidateSeed[] = [
  {
    id: "bt-gapdh-reference-metabolism",
    scenarioIds: ["healthy-baseline"],
    geneSymbol: "GAPDH",
    geneName: "Glyceraldehyde-3-phosphate dehydrogenase",
    direction: "unknown",
    linkedPathways: ["Energy metabolism", "Homeostatic signalling"],
    linkedBodyRegions: ["liver", "muscle", "heart"],
    linkedPhenotypes: ["Reference state"],
    baseScore: 0.42,
    confidence: 0.48,
    evidenceIds: ["curated-reference-baseline"],
    reasoning: "Healthy Baseline uses reference metabolism as a comparison layer before the user adds perturbations.",
    assumptions
  },
  {
    id: "bt-nfkb1-custom-sentinel",
    scenarioIds: ["custom-state"],
    geneSymbol: "NFKB1",
    geneName: "NF-kappa-B p105",
    direction: "unknown",
    linkedPathways: ["User-selected pathway", "Inflammation", "Neural synchrony"],
    linkedBodyRegions: ["immune", "liver", "brain"],
    linkedPhenotypes: ["User-defined phenotype"],
    baseScore: 0.5,
    confidence: 0.42,
    evidenceIds: ["custom-sandbox-assumption"],
    reasoning: "Custom state begins with broad signalling candidates until the user provides more specific evidence or imports.",
    assumptions
  },
  {
    id: "bt-snca-proteostasis",
    scenarioIds: ["parkinsonism-motor-circuit"],
    geneSymbol: "SNCA",
    geneName: "Alpha-synuclein",
    direction: "dysregulated",
    linkedPathways: ["Proteostasis", "Dopaminergic signalling", "Basal ganglia loop"],
    linkedBodyRegions: ["brain", "peripheralNerves", "muscle"],
    linkedPhenotypes: ["Motor output", "Tremor/bradykinesia-style demonstration"],
    baseScore: 0.82,
    confidence: 0.66,
    evidenceIds: ["reactome-neuronal-system", "network-pulse-parkinsonism"],
    reasoning: "Motor circuit stress with proteostasis stress makes SNCA a plausible upstream explanatory candidate in this preset.",
    assumptions
  },
  {
    id: "bt-lrrk2-immune-neural",
    scenarioIds: ["parkinsonism-motor-circuit", "inflammatory-activation"],
    geneSymbol: "LRRK2",
    geneName: "Leucine-rich repeat kinase 2",
    direction: "dysregulated",
    linkedPathways: ["Immune-neural signalling", "Vesicle trafficking", "Proteostasis"],
    linkedBodyRegions: ["brain", "immune"],
    linkedPhenotypes: ["Motor output", "Inflammatory tone"],
    baseScore: 0.68,
    confidence: 0.58,
    evidenceIds: ["network-pulse-parkinsonism"],
    reasoning: "Combined inflammatory and neural stress increases the rank of LRRK2 as a bridge candidate between immune tone and neural pathway load.",
    assumptions
  },
  {
    id: "bt-pink1-mitophagy",
    scenarioIds: ["parkinsonism-motor-circuit"],
    geneSymbol: "PINK1",
    geneName: "PTEN-induced kinase 1",
    direction: "dysregulated",
    linkedPathways: ["Mitophagy", "Mitochondrial function", "Dopaminergic neuron stress"],
    linkedBodyRegions: ["brain", "muscle"],
    linkedPhenotypes: ["Motor output"],
    baseScore: 0.72,
    confidence: 0.6,
    evidenceIds: ["network-pulse-parkinsonism"],
    reasoning: "Mitochondrial stress and motor-output stress suggest mitophagy-linked genes as upstream candidates.",
    assumptions
  },
  {
    id: "bt-insr-insulin",
    scenarioIds: ["metabolic-dysfunction"],
    geneSymbol: "INSR",
    geneName: "Insulin receptor",
    direction: "down",
    linkedPathways: ["Insulin signalling", "Glucose uptake"],
    linkedBodyRegions: ["pancreas", "liver", "muscle", "adipose"],
    linkedPhenotypes: ["Glucose regulation"],
    baseScore: 0.86,
    confidence: 0.72,
    evidenceIds: ["reactome-insulin-signalling", "network-pulse-diabetes"],
    reasoning: "Reduced insulin sensitivity and skeletal-muscle glucose uptake stress point upstream toward insulin receptor signalling.",
    assumptions
  },
  {
    id: "bt-irs1-adapter",
    scenarioIds: ["metabolic-dysfunction"],
    geneSymbol: "IRS1",
    geneName: "Insulin receptor substrate 1",
    direction: "down",
    linkedPathways: ["Insulin signalling", "PI3K-AKT", "Glucose uptake"],
    linkedBodyRegions: ["muscle", "liver", "adipose"],
    linkedPhenotypes: ["Glucose regulation"],
    baseScore: 0.78,
    confidence: 0.68,
    evidenceIds: ["reactome-insulin-signalling"],
    reasoning: "Insulin pathway inefficiency across liver, adipose and skeletal muscle raises IRS1 as an adapter-level candidate.",
    assumptions
  },
  {
    id: "bt-slc2a4-glut4",
    scenarioIds: ["metabolic-dysfunction"],
    geneSymbol: "SLC2A4",
    geneName: "GLUT4 glucose transporter",
    direction: "down",
    linkedPathways: ["Glucose uptake", "Insulin-regulated transport"],
    linkedBodyRegions: ["muscle", "adipose"],
    linkedPhenotypes: ["Glucose regulation"],
    baseScore: 0.74,
    confidence: 0.64,
    evidenceIds: ["reactome-insulin-signalling"],
    reasoning: "Muscle glucose uptake suppression makes GLUT4 transport a plausible downstream/explanatory gene signal.",
    assumptions
  },
  {
    id: "bt-rpe65-retinoid",
    scenarioIds: ["retinal-degeneration"],
    geneSymbol: "RPE65",
    geneName: "Retinoid isomerohydrolase",
    direction: "dysregulated",
    linkedPathways: ["Retinoid cycle", "Phototransduction"],
    linkedBodyRegions: ["eye", "brain"],
    linkedPhenotypes: ["Visual function"],
    baseScore: 0.86,
    confidence: 0.7,
    evidenceIds: ["reactome-phototransduction"],
    reasoning: "Retinal signal stress and retinoid-cycle payload load make RPE65 a high-rank upstream candidate.",
    assumptions
  },
  {
    id: "bt-abca4-retinal-transport",
    scenarioIds: ["retinal-degeneration"],
    geneSymbol: "ABCA4",
    geneName: "Retinal transporter",
    direction: "dysregulated",
    linkedPathways: ["Photoreceptor survival", "Retinal transport"],
    linkedBodyRegions: ["eye"],
    linkedPhenotypes: ["Visual function"],
    baseScore: 0.72,
    confidence: 0.6,
    evidenceIds: ["reactome-phototransduction"],
    reasoning: "Photoreceptor stress with retinal transport context raises ABCA4 as a candidate explanatory gene.",
    assumptions
  },
  {
    id: "bt-il6-cytokine",
    scenarioIds: ["inflammatory-activation", "metabolic-dysfunction"],
    geneSymbol: "IL6",
    geneName: "Interleukin 6",
    direction: "up",
    linkedPathways: ["Cytokine signalling", "JAK-STAT", "Acute-phase signalling"],
    linkedBodyRegions: ["immune", "liver", "lungs", "gut"],
    linkedPhenotypes: ["Systemic inflammatory state"],
    baseScore: 0.9,
    confidence: 0.76,
    evidenceIds: ["reactome-il6-signalling", "network-pulse-inflammation"],
    reasoning: "Immune activation plus liver acute-phase activity strongly ranks IL6 as an upstream signalling candidate.",
    assumptions
  },
  {
    id: "bt-tnf-nfkb",
    scenarioIds: ["inflammatory-activation"],
    geneSymbol: "TNF",
    geneName: "Tumor necrosis factor",
    direction: "up",
    linkedPathways: ["TNF signalling", "NF-kB activation", "Tissue inflammation"],
    linkedBodyRegions: ["immune", "gut", "lungs", "skin"],
    linkedPhenotypes: ["Systemic inflammatory state"],
    baseScore: 0.82,
    confidence: 0.72,
    evidenceIds: ["reactome-tnf-signalling"],
    reasoning: "Distributed inflammatory organ stress and NF-kB context make TNF a likely candidate in the reverse reasoning map.",
    assumptions
  },
  {
    id: "bt-nfkb1-inflammatory-program",
    scenarioIds: ["inflammatory-activation"],
    geneSymbol: "NFKB1",
    geneName: "NF-kappa-B p105",
    direction: "up",
    linkedPathways: ["NF-kB activation", "Innate immune response"],
    linkedBodyRegions: ["immune", "liver", "lungs", "gut"],
    linkedPhenotypes: ["Systemic inflammatory state"],
    baseScore: 0.78,
    confidence: 0.68,
    evidenceIds: ["reactome-tnf-signalling"],
    reasoning: "Cytokine and tissue inflammation activity point toward NF-kB transcriptional regulation as an explanatory layer.",
    assumptions
  }
];

export function scenarioBacktraceSeeds(preset: ScenarioPreset, selectedRegionId?: BodyRegionId) {
  const selected = backtraceSeeds.filter((candidate) => candidate.scenarioIds.includes(preset.id));
  return selected
    .map((candidate) => ({
      ...candidate,
      score: Math.min(1, candidate.baseScore + (selectedRegionId && candidate.linkedBodyRegions.includes(selectedRegionId) ? 0.08 : 0)),
      assumptions: [...candidate.assumptions, `Scenario context: ${preset.shortTitle}`]
    }))
    .sort((a, b) => b.score - a.score);
}
