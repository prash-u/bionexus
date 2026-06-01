import type { MolecularEdge, MolecularSource } from "@/lib/ontology/types";

const reactome = (id: string, label: string): MolecularSource => ({
  database: "Reactome",
  id,
  label,
  url: `https://reactome.org/content/detail/${id}`
});

const chebi = (id: string, label: string): MolecularSource => ({
  database: "ChEBI",
  id,
  label,
  url: `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${id}`
});

const wiki = (id: string, label: string): MolecularSource => ({
  database: "WikiPathways",
  id,
  label,
  url: `https://www.wikipathways.org/pathways/${id}.html`
});

const curated = (id: string, label: string): MolecularSource => ({
  database: "Curated",
  id,
  label,
  url: "https://github.com/prash-u/bionexus"
});

const assumptions = [
  "Source-backed educational pathway payload",
  "Relative sandbox flux, not patient-specific molecular concentration",
  "Ratios are shown only where the pathway context supports a stable stoichiometric interpretation"
];

const exact = { provenance: "database_exact", ratioBasis: "database_stoichiometry" } as const;
const reactionEquivalent = { provenance: "source_backed", ratioBasis: "reaction_equivalent" } as const;
const relative = { provenance: "source_backed", ratioBasis: "physiological_relative" } as const;
const modulatory = { provenance: "source_backed", ratioBasis: "modulatory_signal" } as const;
const placeholder = { provenance: "curated_approximation", ratioBasis: "curated_placeholder" } as const;

export const molecularEdges: MolecularEdge[] = [
  {
    id: "edge-gut-liver-glucose",
    scenarioIds: ["healthy-baseline", "custom-state", "metabolic-dysfunction", "inflammatory-activation"],
    sourceRegionId: "intestine",
    targetRegionId: "liver",
    label: "Enterohepatic glucose and nutrient delivery",
    edgeKind: "transport",
    pathwayContext: "Glucose uptake, hepatic glycogen/gluconeogenesis context",
    baseFlux: 0.62,
    scenarioModifier: 0.28,
    notes: "Transport edge uses molecule identity references and relative physiological flux.",
    payloads: [
      {
        molecule: "D-glucose",
        moleculeClass: "small_molecule",
        direction: "source_to_target",
        ratio: "1 glucose transport equivalent",
        ...relative,
        unit: "relative portal flux",
        sourceCompartment: "intestinal lumen / enterocyte",
        targetCompartment: "portal circulation / hepatocyte",
        sources: [chebi("CHEBI:17234", "D-glucose"), reactome("R-HSA-189085", "Digestion and absorption")],
        confidence: 0.78,
        assumptions
      },
      {
        molecule: "L-lactate",
        moleculeClass: "small_molecule",
        direction: "bidirectional",
        ratio: "2 lactate equivalents per glucose-derived glycolytic endpoint",
        ...reactionEquivalent,
        unit: "reaction stoichiometry equivalent",
        sourceCompartment: "enterocyte / peripheral tissue",
        targetCompartment: "liver",
        sources: [chebi("CHEBI:16651", "L-lactate"), reactome("R-HSA-70171", "Glycolysis")],
        confidence: 0.72,
        assumptions
      }
    ]
  },
  {
    id: "edge-pancreas-muscle-insulin",
    scenarioIds: ["metabolic-dysfunction"],
    sourceRegionId: "pancreas",
    targetRegionId: "muscle",
    label: "Insulin signal to skeletal muscle glucose uptake",
    edgeKind: "endocrine",
    pathwayContext: "Insulin receptor / PI3K-AKT / GLUT4 translocation",
    baseFlux: 0.56,
    scenarioModifier: -0.18,
    notes: "Endocrine signal edge; ratio represents ligand-receptor signalling direction rather than molar dosing.",
    payloads: [
      {
        molecule: "Insulin",
        moleculeClass: "peptide_hormone",
        direction: "source_to_target",
        ratio: "1 ligand signal -> insulin receptor activation event",
        ...modulatory,
        unit: "relative receptor signal",
        sourceCompartment: "pancreatic beta-cell secretion",
        targetCompartment: "skeletal muscle insulin receptor",
        sources: [reactome("R-HSA-74752", "Insulin receptor signalling cascade"), wiki("WP481", "Insulin signalling")],
        confidence: 0.8,
        assumptions
      },
      {
        molecule: "D-glucose",
        moleculeClass: "small_molecule",
        direction: "source_to_target",
        ratio: "GLUT4-mediated uptake rises with insulin signal",
        ...relative,
        unit: "relative uptake",
        sourceCompartment: "blood",
        targetCompartment: "myocyte cytosol",
        sources: [chebi("CHEBI:17234", "D-glucose"), reactome("R-HSA-74752", "Insulin receptor signalling cascade")],
        confidence: 0.76,
        assumptions
      }
    ]
  },
  {
    id: "edge-lungs-heart-gas",
    scenarioIds: ["healthy-baseline", "custom-state", "metabolic-dysfunction", "inflammatory-activation"],
    sourceRegionId: "lungs",
    targetRegionId: "heart",
    label: "Pulmonary gas exchange supporting cardiac oxygen delivery",
    edgeKind: "transport",
    pathwayContext: "Oxygen transport and oxidative phosphorylation demand",
    baseFlux: 0.7,
    scenarioModifier: 0.12,
    notes: "Gas edge uses exact molecule identifiers; tissue flux remains relative.",
    payloads: [
      {
        molecule: "Oxygen",
        moleculeClass: "gas",
        direction: "source_to_target",
        ratio: "6 O2 per glucose complete oxidation reference",
        ...exact,
        unit: "stoichiometric respiration equivalent",
        sourceCompartment: "alveolar gas exchange",
        targetCompartment: "cardiac/peripheral circulation",
        sources: [chebi("CHEBI:15379", "dioxygen"), reactome("R-HSA-163200", "Respiratory electron transport")],
        confidence: 0.82,
        assumptions
      },
      {
        molecule: "Carbon dioxide",
        moleculeClass: "gas",
        direction: "target_to_source",
        ratio: "6 CO2 per glucose complete oxidation reference",
        ...exact,
        unit: "stoichiometric respiration equivalent",
        sourceCompartment: "tissue mitochondria",
        targetCompartment: "alveolar clearance",
        sources: [chebi("CHEBI:16526", "carbon dioxide"), reactome("R-HSA-163200", "Respiratory electron transport")],
        confidence: 0.82,
        assumptions
      }
    ]
  },
  {
    id: "edge-brain-muscle-neural-drive",
    scenarioIds: ["parkinsonism-motor-circuit"],
    sourceRegionId: "brain",
    targetRegionId: "muscle",
    label: "Motor circuit output to skeletal muscle readout",
    edgeKind: "neural",
    pathwayContext: "Basal ganglia motor loop and neuromuscular output",
    baseFlux: 0.58,
    scenarioModifier: 0.32,
    notes: "Neural edge is electrical/modulatory; no molar molecule ratio is implied.",
    payloads: [
      {
        molecule: "Dopamine",
        moleculeClass: "neurotransmitter",
        direction: "modulatory",
        ratio: "modulatory tone, not transport stoichiometry",
        ...modulatory,
        unit: "relative signalling tone",
        sourceCompartment: "nigrostriatal signalling context",
        targetCompartment: "basal ganglia motor loop",
        sources: [chebi("CHEBI:18243", "dopamine"), reactome("R-HSA-112316", "Neuronal System")],
        confidence: 0.68,
        assumptions
      },
      {
        molecule: "Electrical modulation",
        moleculeClass: "electrical_modulation",
        direction: "modulatory",
        ratio: "frequency x amplitude modulation envelope",
        ...placeholder,
        unit: "relative circuit modulation",
        sourceCompartment: "DBS / stimulation sandbox",
        targetCompartment: "motor circuit oscillation model",
        sources: [curated("bionexus-neural-modulation", "BioNexus conceptual DBS modulation layer")],
        confidence: 0.52,
        assumptions
      }
    ]
  },
  {
    id: "edge-eye-brain-retinoid-signal",
    scenarioIds: ["retinal-degeneration"],
    sourceRegionId: "eye",
    targetRegionId: "brain",
    label: "Retinal phototransduction to visual processing",
    edgeKind: "reaction",
    pathwayContext: "Retinoid cycle and phototransduction signal propagation",
    baseFlux: 0.5,
    scenarioModifier: -0.3,
    notes: "Visual signal edge combines source-backed retinoid chemistry with relative neural signal integrity.",
    payloads: [
      {
        molecule: "11-cis-retinal",
        moleculeClass: "small_molecule",
        direction: "modulatory",
        ratio: "1 photon-isomerizable chromophore per opsin activation event",
        ...reactionEquivalent,
        unit: "phototransduction event equivalent",
        sourceCompartment: "retinal pigment epithelium / photoreceptor",
        targetCompartment: "photoreceptor outer segment",
        sources: [chebi("CHEBI:16066", "11-cis-retinal"), reactome("R-HSA-2187338", "Visual phototransduction")],
        confidence: 0.74,
        assumptions
      },
      {
        molecule: "AAV gene-vector payload",
        moleculeClass: "nucleic_acid",
        direction: "source_to_target",
        ratio: "vector genome copy concept, scenario placeholder",
        ...placeholder,
        unit: "relative delivery payload",
        sourceCompartment: "gene therapy mechanism sandbox",
        targetCompartment: "retinal cell expression context",
        sources: [curated("bionexus-ocular-gene-vector", "BioNexus retinal gene-delivery mechanism placeholder")],
        confidence: 0.48,
        assumptions
      }
    ]
  },
  {
    id: "edge-immune-liver-cytokine",
    scenarioIds: ["custom-state", "inflammatory-activation", "metabolic-dysfunction"],
    sourceRegionId: "immune",
    targetRegionId: "liver",
    label: "Cytokine signalling to hepatic acute-phase context",
    edgeKind: "immune",
    pathwayContext: "IL-6, TNF and NF-kB/JAK-STAT inflammatory relay",
    baseFlux: 0.58,
    scenarioModifier: 0.34,
    notes: "Cytokine signal edge uses protein/cytokine identities and relative inflammatory pressure.",
    payloads: [
      {
        molecule: "IL-6",
        moleculeClass: "cytokine",
        direction: "source_to_target",
        ratio: "1 cytokine ligand signal -> receptor pathway activation event",
        ...modulatory,
        unit: "relative cytokine signal",
        sourceCompartment: "immune/blood signalling context",
        targetCompartment: "hepatocyte JAK-STAT / acute-phase context",
        sources: [reactome("R-HSA-1059683", "Interleukin-6 signaling"), wiki("WP364", "IL-6 signaling pathway")],
        confidence: 0.78,
        assumptions
      },
      {
        molecule: "TNF",
        moleculeClass: "cytokine",
        direction: "source_to_target",
        ratio: "1 cytokine ligand signal -> TNF receptor/NF-kB activation event",
        ...modulatory,
        unit: "relative cytokine signal",
        sourceCompartment: "immune/blood signalling context",
        targetCompartment: "tissue inflammatory response",
        sources: [reactome("R-HSA-75893", "TNF signaling"), wiki("WP231", "TNF alpha signaling pathway")],
        confidence: 0.74,
        assumptions
      }
    ]
  },
  {
    id: "edge-liver-kidney-redox-clearance",
    scenarioIds: ["metabolic-dysfunction", "inflammatory-activation"],
    sourceRegionId: "liver",
    targetRegionId: "kidney",
    label: "Hepatorenal redox and clearance coupling",
    edgeKind: "transport",
    pathwayContext: "Redox buffering, urea cycle and xenobiotic handling context",
    baseFlux: 0.44,
    scenarioModifier: 0.18,
    notes: "Clearance edge is relative and intended for exploratory systems reasoning.",
    payloads: [
      {
        molecule: "Glutathione",
        moleculeClass: "small_molecule",
        direction: "modulatory",
        ratio: "2 GSH + peroxide -> GSSG + 2 H2O reference",
        ...reactionEquivalent,
        unit: "redox reaction equivalent",
        sourceCompartment: "hepatic redox buffer",
        targetCompartment: "systemic oxidative stress context",
        sources: [chebi("CHEBI:16856", "glutathione"), reactome("R-HSA-3299685", "Detoxification of Reactive Oxygen Species")],
        confidence: 0.68,
        assumptions
      },
      {
        molecule: "Urea",
        moleculeClass: "small_molecule",
        direction: "source_to_target",
        ratio: "1 urea output per nitrogen disposal product",
        ...relative,
        unit: "relative renal clearance",
        sourceCompartment: "hepatic urea cycle",
        targetCompartment: "renal excretion context",
        sources: [chebi("CHEBI:16199", "urea"), reactome("R-HSA-70635", "Urea cycle")],
        confidence: 0.7,
        assumptions
      }
    ]
  }
];
