import type { BodyRegionId, BiologicalLayer, ScenarioPreset } from "@/lib/ontology/types";

const assumptions = ["Exploratory relationship map", "Demo-level curated biology", "No patient-specific inference"];

const trace = (sourceEntityId: string, scenarioContext: string, confidence = 0.62) => ({
  sourceEntityId,
  confidence,
  evidenceIds: ["ev-demo-hypothesis"],
  scenarioContext,
  assumptions
});

export const biologicalLayers: BiologicalLayer[] = [
  "genes",
  "proteins",
  "pathways",
  "cells",
  "tissues",
  "organs",
  "systems",
  "phenotypes",
  "interventions"
];

export const bodyRegionLabels: Record<BodyRegionId, string> = {
  brain: "Brain / CNS",
  eye: "Eye / Retina",
  thyroid: "Thyroid",
  heart: "Heart",
  lungs: "Lungs",
  liver: "Liver",
  stomach: "Stomach",
  pancreas: "Pancreas",
  intestine: "Intestine",
  gut: "Gut",
  spleen: "Spleen",
  adipose: "Adipose",
  kidney: "Kidney",
  muscle: "Skeletal Muscle",
  boneMarrow: "Bone Marrow",
  skin: "Skin",
  immune: "Immune / Blood",
  peripheralNerves: "Peripheral Nerves"
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "healthy-baseline",
    title: "Healthy Baseline",
    shortTitle: "Healthy Baseline",
    category: "custom",
    description: "A low-pressure reference state for building a custom biological model before adding predispositions, perturbations or what-if interventions.",
    affectedSystems: ["Whole-body homeostasis", "System stability"],
    affectedRegions: ["brain", "heart", "lungs", "liver", "kidney", "muscle", "immune"],
    keyGenes: ["GAPDH", "ACTB", "INSR", "NFKB1"],
    keyPathways: ["Homeostatic signalling", "Energy metabolism", "Oxygen transport", "Immune surveillance"],
    baselineProfile: { id: "baseline-healthy", label: "Healthy reference", description: "Low-pressure baseline for exploratory state building.", assumptions },
    predispositions: [],
    perturbations: [],
    interventions: [],
    reasoningTrail: { id: "trail-healthy", steps: ["Baseline: no disease-centered preset selected", "Observe: body systems remain near reference pressure", "Understand: homeostatic pathways provide comparison context", "Perturb: add custom changes only when testing a what-if"] },
    organEffects: [
      { organ: "heart", label: "Reference cardiac support", direction: "baseline", magnitude: 20, ...trace("scenario-healthy", "Healthy baseline") },
      { organ: "lungs", label: "Reference oxygen exchange", direction: "baseline", magnitude: 18, ...trace("scenario-healthy", "Healthy baseline") },
      { organ: "liver", label: "Reference metabolic buffering", direction: "baseline", magnitude: 22, ...trace("scenario-healthy", "Healthy baseline") },
      { organ: "immune", label: "Reference immune surveillance", direction: "baseline", magnitude: 18, ...trace("scenario-healthy", "Healthy baseline") }
    ],
    systemEffects: [
      { system: "Whole-body homeostasis", label: "Stable reference state", status: "stable", magnitude: 18, ...trace("scenario-healthy", "Healthy baseline") }
    ],
    phenotypeEffects: [
      { phenotype: "Reference state", label: "No dominant phenotype pressure", direction: "baseline", magnitude: 16, ...trace("scenario-healthy", "Healthy baseline") }
    ],
    limitations: ["Reference educational state only", "Not a claim of individual health"]
  },
  {
    id: "custom-state",
    title: "Custom biological state",
    shortTitle: "Custom",
    category: "custom",
    description: "A blank-but-functional sandbox state for modelling the user's example from whichever layer they have data for.",
    affectedSystems: ["User-defined system", "Body-scale consequence map"],
    affectedRegions: ["brain", "liver", "immune", "muscle", "heart", "eye"],
    keyGenes: ["NFKB1", "INSR", "PINK1", "RPE65"],
    keyPathways: ["User-selected pathway", "Inflammation", "Metabolic regulation", "Neural synchrony"],
    baselineProfile: { id: "baseline-custom", label: "Custom reference", description: "Start from observed evidence and tune the body state.", assumptions },
    predispositions: [
      { id: "pred-custom", label: "User-provided predisposition", targetLayer: "systems", description: "Placeholder for the user's selected upstream assumption.", confidence: 0.42 }
    ],
    perturbations: [
      { id: "pert-custom", label: "User-provided perturbation", targetLayer: "pathways", direction: "modulate", description: "Placeholder for the biological change being tested.", magnitude: 42 }
    ],
    interventions: [],
    reasoningTrail: { id: "trail-custom", steps: ["Configure: choose what layer the user has data for", "Observe: tune body attributes and affected systems", "Understand: trace upstream and downstream mechanisms", "Perturb: open intervention only for explicit what-if testing"] },
    organEffects: [
      { organ: "brain", label: "Custom neural context", direction: "baseline", magnitude: 26, ...trace("scenario-custom", "Custom biological state") },
      { organ: "liver", label: "Custom metabolic context", direction: "baseline", magnitude: 26, ...trace("scenario-custom", "Custom biological state") },
      { organ: "immune", label: "Custom immune context", direction: "baseline", magnitude: 26, ...trace("scenario-custom", "Custom biological state") }
    ],
    systemEffects: [
      { system: "Custom sandbox state", label: "User-configured pressure", status: "modulated", magnitude: 28, ...trace("scenario-custom", "Custom biological state") }
    ],
    phenotypeEffects: [
      { phenotype: "User-defined phenotype", label: "Custom observed example", direction: "modulates", magnitude: 28, ...trace("scenario-custom", "Custom biological state") }
    ],
    limitations: ["Depends on user-selected assumptions", "Hypothesis-generating sandbox state only"]
  },
  {
    id: "parkinsonism-motor-circuit",
    title: "Parkinson's / motor circuit disruption",
    shortTitle: "Parkinson's",
    category: "neural",
    description: "A neural systems scenario for exploring dopaminergic pathway stress, basal ganglia circuitry, motor phenotype emergence and exploratory modulation.",
    affectedSystems: ["Central nervous system", "Motor control", "Peripheral movement"],
    affectedRegions: ["brain", "peripheralNerves", "muscle", "boneMarrow"],
    keyGenes: ["SNCA", "LRRK2", "GBA1", "PINK1"],
    keyPathways: ["Dopaminergic signalling", "Proteostasis", "Mitophagy", "Basal ganglia loop"],
    baselineProfile: { id: "baseline-neural", label: "Adult neural reference", description: "Reference motor-circuit sandbox baseline.", assumptions },
    predispositions: [
      { id: "pred-synuclein", label: "Synuclein/proteostasis susceptibility", targetLayer: "proteins", description: "Raises attention on protein handling and neuronal stress.", confidence: 0.62 },
      { id: "pred-mito", label: "Mitochondrial stress susceptibility", targetLayer: "pathways", description: "Adds vulnerability in energy and mitophagy reasoning.", confidence: 0.55 }
    ],
    perturbations: [
      { id: "pert-dopamine", label: "Dopamine pathway suppression", targetLayer: "pathways", direction: "decrease", description: "Conceptually reduces motor-circuit signalling tone.", magnitude: 68 },
      { id: "pert-loop", label: "Motor loop synchrony increase", targetLayer: "systems", direction: "stimulate", description: "Increases oscillatory motor circuit behaviour in the demo.", magnitude: 58 }
    ],
    interventions: [
      { id: "int-dbs", label: "DBS / stimulation modulation", category: "DBS", targetLayer: "systems", affectedPathwayOrSystem: "Basal ganglia motor loop", expectedDirection: "modulate", uncertainty: 42, safetyLanguage: "Exploratory circuit modulation example only; no programming guidance.", relatedScenarioIds: ["parkinsonism-motor-circuit"] },
      { id: "int-exercise-neural", label: "Exercise adaptation", category: "Exercise", targetLayer: "systems", affectedPathwayOrSystem: "Motor and metabolic support", expectedDirection: "stabilise", uncertainty: 48, safetyLanguage: "Educational physiological modulation example only.", relatedScenarioIds: ["parkinsonism-motor-circuit", "metabolic-dysfunction"] },
      { id: "int-ambroxol", label: "Ambroxol repositioning example", category: "Drug", targetLayer: "pathways", affectedPathwayOrSystem: "Lysosomal/proteostasis reasoning", expectedDirection: "modulate", uncertainty: 68, safetyLanguage: "Exploratory repositioning example only, not a recommendation.", relatedScenarioIds: ["parkinsonism-motor-circuit"] }
    ],
    reasoningTrail: { id: "trail-parkinsonism", steps: ["Predisposition: proteostasis and mitochondrial susceptibility", "Pathway perturbation: dopaminergic signalling and protein clearance stress", "Tissue/organ consequence: basal ganglia circuit instability", "Phenotype: tremor/bradykinesia-style motor output in the demo model", "Intervention modulation: DBS, exercise or lysosomal examples as exploratory perturbations"] },
    organEffects: [
      { organ: "brain", label: "Motor circuit stress", direction: "stress", magnitude: 82, ...trace("pathway-dopamine", "Parkinson's motor circuit preset") },
      { organ: "peripheralNerves", label: "Motor output coupling", direction: "activation", magnitude: 48, ...trace("system-motor", "Parkinson's motor circuit preset") },
      { organ: "muscle", label: "Movement phenotype readout", direction: "stress", magnitude: 42, ...trace("phenotype-tremor", "Parkinson's motor circuit preset") }
    ],
    systemEffects: [
      { system: "Motor control", label: "Oscillatory control pressure", status: "stressed", magnitude: 78, ...trace("system-motor", "Parkinson's motor circuit preset") }
    ],
    phenotypeEffects: [
      { phenotype: "Motor output", label: "Tremor/bradykinesia-style demonstration", direction: "emerges", magnitude: 64, ...trace("phenotype-tremor", "Parkinson's motor circuit preset") }
    ],
    limitations: ["Conceptual motor-circuit map only", "No clinical programming or patient-specific interpretation"]
  },
  {
    id: "metabolic-dysfunction",
    title: "Metabolic dysfunction / type 2 diabetes style scenario",
    shortTitle: "Metabolic dysfunction",
    category: "metabolic",
    description: "A body-scale glucose regulation scenario spanning insulin signalling, pancreas, liver, muscle, gut and adipose-like storage logic.",
    affectedSystems: ["Endocrine metabolism", "Liver metabolism", "Skeletal muscle uptake"],
    affectedRegions: ["pancreas", "liver", "muscle", "intestine", "adipose", "kidney", "heart"],
    keyGenes: ["INSR", "IRS1", "SLC2A4", "PPARG"],
    keyPathways: ["Insulin signalling", "Glucose uptake", "Hepatic gluconeogenesis", "Inflammatory-metabolic crosstalk"],
    baselineProfile: { id: "baseline-metabolic", label: "Adult metabolic reference", description: "Reference glucose-regulation sandbox baseline.", assumptions },
    predispositions: [
      { id: "pred-insulin-resistance", label: "Insulin signalling resistance", targetLayer: "pathways", description: "Adds reduced signalling efficiency across liver and muscle.", confidence: 0.66 }
    ],
    perturbations: [
      { id: "pert-glucose", label: "Glucose regulation load", targetLayer: "systems", direction: "increase", description: "Raises conceptual post-prandial handling pressure.", magnitude: 72 }
    ],
    interventions: [
      { id: "int-exercise-metabolic", label: "Exercise-driven glucose uptake", category: "Exercise", targetLayer: "systems", affectedPathwayOrSystem: "Skeletal muscle glucose uptake", expectedDirection: "stabilise", uncertainty: 36, safetyLanguage: "Educational adaptation model only.", relatedScenarioIds: ["metabolic-dysfunction"] },
      { id: "int-diet-metabolic", label: "Dietary load modifier", category: "Diet", targetLayer: "systems", affectedPathwayOrSystem: "Glucose availability", expectedDirection: "modulate", uncertainty: 44, safetyLanguage: "Scenario modifier only, not nutrition advice.", relatedScenarioIds: ["metabolic-dysfunction"] }
    ],
    reasoningTrail: { id: "trail-metabolic", steps: ["Predisposition: reduced insulin signalling efficiency", "Pathway perturbation: glucose uptake and hepatic output imbalance", "Organ consequence: pancreas/liver/muscle workload", "Phenotype: glucose regulation pressure in the demo model", "Intervention modulation: exercise and diet as exploratory system modifiers"] },
    organEffects: [
      { organ: "pancreas", label: "Insulin demand pressure", direction: "stress", magnitude: 74, ...trace("scenario-metabolic", "Metabolic dysfunction preset") },
      { organ: "liver", label: "Hepatic glucose output", direction: "activation", magnitude: 70, ...trace("scenario-metabolic", "Metabolic dysfunction preset") },
      { organ: "muscle", label: "Glucose uptake resistance", direction: "suppression", magnitude: 62, ...trace("scenario-metabolic", "Metabolic dysfunction preset") },
      { organ: "intestine", label: "Nutrient input modifier", direction: "activation", magnitude: 44, ...trace("scenario-metabolic", "Metabolic dysfunction preset") },
      { organ: "adipose", label: "Adipose-metabolic signalling", direction: "activation", magnitude: 52, ...trace("scenario-metabolic", "Metabolic dysfunction preset") }
    ],
    systemEffects: [
      { system: "Metabolic regulation", label: "Glucose handling stress", status: "stressed", magnitude: 76, ...trace("scenario-metabolic", "Metabolic dysfunction preset") }
    ],
    phenotypeEffects: [
      { phenotype: "Glucose regulation", label: "Elevated regulation pressure", direction: "emerges", magnitude: 68, ...trace("scenario-metabolic", "Metabolic dysfunction preset") }
    ],
    limitations: ["No glucose prediction", "No medication or lifestyle recommendation"]
  },
  {
    id: "retinal-degeneration",
    title: "Retinal degeneration / ocular gene therapy style scenario",
    shortTitle: "Retinal degeneration",
    category: "ocular",
    description: "An ocular scenario for reasoning about photoreceptor stress, retinal tissue effects and gene therapy mechanism-of-action demonstrations.",
    affectedSystems: ["Visual system", "Retinal tissue", "Gene delivery"],
    affectedRegions: ["eye", "brain"],
    keyGenes: ["RPE65", "ABCA4", "RPGR", "CEP290"],
    keyPathways: ["Phototransduction", "Retinoid cycle", "Photoreceptor survival", "Vector delivery"],
    baselineProfile: { id: "baseline-ocular", label: "Visual system reference", description: "Reference retina and visual processing sandbox baseline.", assumptions },
    predispositions: [
      { id: "pred-retinal-gene", label: "Inherited retinal vulnerability", targetLayer: "genes", description: "Adds gene-linked retinal stress context.", confidence: 0.58 }
    ],
    perturbations: [
      { id: "pert-photoreceptor", label: "Photoreceptor stress", targetLayer: "cells", direction: "damage", description: "Conceptually reduces retinal signal integrity.", magnitude: 70 }
    ],
    interventions: [
      { id: "int-ocular-gene-therapy", label: "Ocular gene therapy MOA placeholder", category: "Gene Therapy", targetLayer: "genes", affectedPathwayOrSystem: "Retinal gene expression / photoreceptor support", expectedDirection: "modulate", uncertainty: 55, safetyLanguage: "Mechanism demonstration only; not a therapy recommendation.", relatedScenarioIds: ["retinal-degeneration"] }
    ],
    reasoningTrail: { id: "trail-retina", steps: ["Predisposition: inherited retinal vulnerability", "Pathway perturbation: phototransduction or retinoid cycle stress", "Tissue/organ consequence: photoreceptor and retinal signal pressure", "Phenotype: visual function stress in the educational model", "Intervention modulation: ocular gene therapy as mechanism-of-action placeholder"] },
    organEffects: [
      { organ: "eye", label: "Retinal signal stress", direction: "stress", magnitude: 86, ...trace("scenario-retina", "Retinal degeneration preset") },
      { organ: "brain", label: "Visual processing downstream", direction: "suppression", magnitude: 34, ...trace("scenario-retina", "Retinal degeneration preset") }
    ],
    systemEffects: [
      { system: "Visual system", label: "Retinal input pressure", status: "stressed", magnitude: 82, ...trace("scenario-retina", "Retinal degeneration preset") }
    ],
    phenotypeEffects: [
      { phenotype: "Visual function", label: "Reduced signal integrity demonstration", direction: "emerges", magnitude: 72, ...trace("scenario-retina", "Retinal degeneration preset") }
    ],
    limitations: ["No visual acuity prediction", "No gene therapy suitability assessment"]
  },
  {
    id: "inflammatory-activation",
    title: "Inflammatory activation",
    shortTitle: "Inflammation",
    category: "immune",
    description: "A whole-body immune activation scenario for exploring cytokine signalling, tissue inflammation and systemic phenotype consequences.",
    affectedSystems: ["Immune system", "Vascular signalling", "Tissue stress"],
    affectedRegions: ["immune", "boneMarrow", "spleen", "lungs", "intestine", "skin", "liver", "kidney", "heart"],
    keyGenes: ["IL6", "TNF", "NFKB1", "CXCL8"],
    keyPathways: ["Cytokine signalling", "NF-kB activation", "Innate immune response", "Tissue repair"],
    baselineProfile: { id: "baseline-immune", label: "Immune reference", description: "Reference inflammatory signalling sandbox baseline.", assumptions },
    predispositions: [
      { id: "pred-inflammatory-tone", label: "Higher inflammatory tone", targetLayer: "systems", description: "Raises baseline immune activation in the sandbox.", confidence: 0.6 }
    ],
    perturbations: [
      { id: "pert-cytokine", label: "Cytokine signalling activation", targetLayer: "pathways", direction: "increase", description: "Increases systemic inflammatory pathway pressure.", magnitude: 76 }
    ],
    interventions: [
      { id: "int-sleep-immune", label: "Sleep disruption / restoration modifier", category: "Sleep", targetLayer: "systems", affectedPathwayOrSystem: "Inflammatory tone", expectedDirection: "modulate", uncertainty: 52, safetyLanguage: "Scenario modifier only, not medical advice.", relatedScenarioIds: ["inflammatory-activation"] },
      { id: "int-environment", label: "Environmental exposure modifier", category: "Environmental Modifier", targetLayer: "systems", affectedPathwayOrSystem: "Immune activation context", expectedDirection: "uncertain", uncertainty: 65, safetyLanguage: "Exploratory environmental modifier only.", relatedScenarioIds: ["inflammatory-activation"] }
    ],
    reasoningTrail: { id: "trail-inflammation", steps: ["Predisposition: higher inflammatory tone", "Pathway perturbation: cytokine and NF-kB activation", "Tissue consequence: distributed inflammatory pressure", "Phenotype: systemic fatigue/pain-style demonstration language", "Intervention modulation: sleep and environment as exploratory modifiers"] },
    organEffects: [
      { organ: "immune", label: "Immune activation", direction: "activation", magnitude: 88, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "lungs", label: "Barrier tissue inflammation", direction: "stress", magnitude: 48, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "intestine", label: "Mucosal immune crosstalk", direction: "activation", magnitude: 52, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "spleen", label: "Immune relay activation", direction: "activation", magnitude: 58, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "boneMarrow", label: "Hematopoietic immune pressure", direction: "activation", magnitude: 54, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "skin", label: "Barrier tissue context", direction: "stress", magnitude: 34, ...trace("scenario-immune", "Inflammatory activation preset") },
      { organ: "liver", label: "Acute-phase signalling context", direction: "activation", magnitude: 56, ...trace("scenario-immune", "Inflammatory activation preset") }
    ],
    systemEffects: [
      { system: "Immune activation", label: "Cytokine pathway pressure", status: "activated", magnitude: 84, ...trace("scenario-immune", "Inflammatory activation preset") }
    ],
    phenotypeEffects: [
      { phenotype: "Systemic inflammatory state", label: "Fatigue/pain-style demo readout", direction: "emerges", magnitude: 62, ...trace("scenario-immune", "Inflammatory activation preset") }
    ],
    limitations: ["No immune diagnosis", "No treatment or medication recommendation"]
  }
];
