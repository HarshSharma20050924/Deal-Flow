import { useState, useCallback } from "react";
import { ReactFlow, Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Settings, Play, ArrowRight, GitBranch } from "lucide-react";
import { useToast } from "./ToastContext";

// Minimal Deal Flow theme nodes
const initialNodes = [
  { 
    id: "1", 
    position: { x: 250, y: 50 }, 
    data: { label: "TRIGGER: Lead Identified" },
    type: 'input',
    style: { 
      border: "1px solid #E6E6E6", 
      borderRadius: "0", 
      padding: "16px", 
      background: "#fff", 
      fontSize: "12px", 
      fontWeight: 500,
      width: 240,
    }
  },
  { 
    id: "2", 
    position: { x: 250, y: 150 }, 
    data: { label: "Wait exactly 3 days" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderLeft: "2px solid #0A8356",
      borderRadius: "0", 
      padding: "16px", 
      background: "#FAFAFA", 
      fontSize: "12px", 
      color: "#666",
      width: 240,
    }
  },
  { 
    id: "3", 
    position: { x: 250, y: 250 }, 
    data: { label: "CONDITION: Did lead open email?" },
    style: { 
      border: "1px solid #0A8356", 
      borderRadius: "0", 
      padding: "16px", 
      background: "#fff", 
      fontSize: "12px", 
      color: "#0A8356",
      fontWeight: 500,
      width: 240,
    }
  },
  { 
    id: "4", 
    position: { x: 100, y: 350 }, 
    data: { label: "YES: Send Sequence B" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderRadius: "0", 
      padding: "16px", 
      background: "#fff", 
      fontSize: "12px",
      width: 220,
    }
  },
  { 
    id: "5", 
    position: { x: 400, y: 350 }, 
    data: { label: "NO: Send Sequence C" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderRadius: "0", 
      padding: "16px", 
      background: "#fff", 
      fontSize: "12px", 
      width: 220,
    }
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#0A8356", strokeWidth: 1.5 } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "#E6E6E6", strokeWidth: 1.5 } },
  { id: "e3-4", source: "3", target: "4", label: "Opened", style: { stroke: "#0A8356", strokeWidth: 1.5 }, labelStyle: { fill: '#0A8356', fontSize: 11, fontWeight: 500 }, labelBgStyle: { fill: '#fff' } },
  { id: "e3-5", source: "3", target: "5", label: "Ignored", style: { stroke: "#E6E6E6", strokeWidth: 1.5 }, labelStyle: { fill: '#666', fontSize: 11 }, labelBgStyle: { fill: '#fff' } },
];

export function Workflows() {
  const [nodes, setNodes] = useState<any[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isDeploying, setIsDeploying] = useState(false);
  const { addToast } = useToast();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: false, style: { stroke: '#E6E6E6', strokeWidth: 1.5 } } as unknown as Edge, eds)),
    [setEdges]
  );

  const handleAddAction = () => {
    const newNodeId = `node_${nodes.length + 1}`;
    setNodes((nds) => [
      ...nds,
      {
        id: newNodeId,
        position: { x: 250, y: 450 },
        data: { label: "ACTION: Send Follow Up" },
        style: {
          border: "1px solid #E6E6E6", 
          borderRadius: "0", 
          padding: "16px", 
          background: "#fff", 
          fontSize: "12px", 
          fontWeight: 500,
          width: 240,
        }
      }
    ]);
    addToast("New Action Node added to workspace.", "info");
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    addToast("Validating flow architecture...", "info");
    setTimeout(() => {
      setIsDeploying(false);
      addToast("Workflow deployed to active pool.", "success");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-end p-12 shrink-0 border-b border-border-subtle bg-bg-base z-10 relative">
        <div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">Workflows</h1>
          <p className="text-sm text-text-secondary">Visual sequence and logic builder.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center border border-border-subtle bg-bg-workspace p-1">
              <button onClick={handleAddAction} className="flex items-center text-[10px] uppercase tracking-wider font-medium hover:text-brand-accent transition-colors px-3 py-1 text-text-secondary">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Action
              </button>
              <div className="w-px h-4 bg-border-subtle" />
              <button className="flex items-center text-[10px] uppercase tracking-wider font-medium hover:text-brand-accent transition-colors px-3 py-1 text-text-secondary">
                <GitBranch className="w-3.5 h-3.5 mr-1.5" /> Condition
              </button>
           </div>
           
           <button 
             onClick={handleDeploy}
             disabled={isDeploying}
             className="flex items-center text-sm font-medium transition-colors bg-brand-accent text-white hover:bg-brand-accent-hover px-6 py-2 disabled:opacity-50"
           >
             {isDeploying ? (
               <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
             ) : (
               <Play className="w-4 h-4 mr-2" />
             )}
             {isDeploying ? "Deploying..." : "Deploy Config"}
           </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative bg-bg-workspace">
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#E6E6E6" gap={24} size={1} />
          <Controls className="!bg-bg-base !border-border-subtle !rounded-none !shadow-none [&>button]:!border-b-border-subtle [&>button]:!rounded-none" showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
