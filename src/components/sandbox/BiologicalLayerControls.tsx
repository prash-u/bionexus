import { biologicalLayers } from "@/data/scenarios/presets";
import type { BiologicalLayer } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const labels: Record<BiologicalLayer, string> = {
  genes: "Genes",
  proteins: "Proteins",
  pathways: "Pathways",
  cells: "Cells",
  tissues: "Tissues",
  organs: "Organs",
  systems: "Systems",
  phenotypes: "Phenotypes",
  interventions: "Interventions"
};

export function BiologicalLayerControls() {
  const { sandbox, toggleLayer } = useSandbox();
  return (
    <div className="flex flex-wrap gap-2">
      {biologicalLayers.map((layer) => {
        const active = sandbox.activeLayers.includes(layer);
        return (
          <button
            key={layer}
            className={active ? "nexus-button px-3 py-1.5 text-xs" : "nexus-button-secondary px-3 py-1.5 text-xs"}
            onClick={() => toggleLayer(layer)}
          >
            {labels[layer]}
          </button>
        );
      })}
    </div>
  );
}
