import { Plus } from "lucide-react";
import { useState } from "react";
import { entityTypeLabels } from "@/data/ontology/entityTypes";
import { relationshipTypeLabels } from "@/data/ontology/relationshipTypes";
import type { EntityType, RelationshipType } from "@/lib/ontology/types";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function EntityAuthoringPanel() {
  const { workspace, addEntity, addRelationship } = useWorkspace();
  const [entityType, setEntityType] = useState<EntityType>("pathway");
  const [entityName, setEntityName] = useState("");
  const [entityDescription, setEntityDescription] = useState("");
  const [sourceId, setSourceId] = useState(workspace.selectedEntityId);
  const [targetId, setTargetId] = useState(workspace.entities[0]?.id ?? "");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("affects");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [relationshipNotes, setRelationshipNotes] = useState("");
  const [confidence, setConfidence] = useState(55);

  const createEntity = () => {
    if (!entityName.trim() || !entityDescription.trim()) return;
    addEntity({
      type: entityType,
      name: entityName.trim(),
      shortName: entityName.trim().slice(0, 16),
      description: entityDescription.trim(),
      tags: "user-authored"
    });
    setEntityName("");
    setEntityDescription("");
  };

  const createRelationship = () => {
    if (!sourceId || !targetId || !relationshipLabel.trim() || !relationshipNotes.trim()) return;
    addRelationship({
      sourceId,
      targetId,
      type: relationshipType,
      label: relationshipLabel.trim(),
      notes: relationshipNotes.trim(),
      confidence
    });
    setRelationshipLabel("");
    setRelationshipNotes("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
        <h3 className="text-base font-semibold text-white">Add biological object</h3>
        <div className="mt-4 grid gap-3">
          <select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={entityType} onChange={(event) => setEntityType(event.target.value as EntityType)}>
            {Object.entries(entityTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Object name" value={entityName} onChange={(event) => setEntityName(event.target.value)} />
          <textarea className="min-h-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="What does this object mean in the map?" value={entityDescription} onChange={(event) => setEntityDescription(event.target.value)} />
          <button className="nexus-button" onClick={createEntity}><Plus className="h-4 w-4" /> Add object</button>
        </div>
      </div>
      <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
        <h3 className="text-base font-semibold text-white">Connect two objects</h3>
        <div className="mt-4 grid gap-3">
          <select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
            {workspace.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.shortName ?? entity.name}</option>)}
          </select>
          <select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={relationshipType} onChange={(event) => setRelationshipType(event.target.value as RelationshipType)}>
            {Object.entries(relationshipTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            {workspace.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.shortName ?? entity.name}</option>)}
          </select>
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Relationship label" value={relationshipLabel} onChange={(event) => setRelationshipLabel(event.target.value)} />
          <textarea className="min-h-20 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Why does this relationship matter?" value={relationshipNotes} onChange={(event) => setRelationshipNotes(event.target.value)} />
          <label className="text-xs text-slate-400">Confidence: {confidence}%</label>
          <input type="range" min="1" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} />
          <button className="nexus-button" onClick={createRelationship}><Plus className="h-4 w-4" /> Add relationship</button>
        </div>
      </div>
    </div>
  );
}
