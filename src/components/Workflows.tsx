import { useState, useCallback, useEffect } from "react";
import { ReactFlow, Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Settings, Play, ArrowRight, GitBranch } from "lucide-react";
import { useToast } from "./ToastContext";
import { WorkflowRepository } from "../repositories/workflow.repository";

// High-fidelity production nodes
const initialNodes = [
  { 
    id: "1", 
    position: { x: 250, y: 0 }, 
    data: { label: "TRIGGER: New Market Brief" },
    type: 'input',
    style: { 
      border: "1px solid #000", 
      borderRadius: "0", 
      padding: "20px", 
      background: "#fff", 
      fontSize: "11px", 
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      width: 260,
    }
  },
  { 
    id: "2", 
    position: { x: 250, y: 120 }, 
    data: { label: "ACTION: Google Maps Discovery" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderLeft: "3px solid #0A8356",
      borderRadius: "0", 
      padding: "20px", 
      background: "#FAFAFA", 
      fontSize: "11px", 
      color: "#1A1A1A",
      fontWeight: 600,
      width: 260,
    }
  },
  { 
    id: "3", 
    position: { x: 250, y: 240 }, 
    data: { label: "ACTION: AI Ghostwriter Synthesis" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderLeft: "3px solid #0A8356",
      borderRadius: "0", 
      padding: "20px", 
      background: "#FAFAFA", 
      fontSize: "11px", 
      color: "#1A1A1A",
      fontWeight: 600,
      width: 260,
    }
  },
  { 
    id: "4", 
    position: { x: 250, y: 360 }, 
    data: { label: "CONDITION: Score > 80%" },
    style: { 
      border: "1px solid #0A8356", 
      borderRadius: "0", 
      padding: "20px", 
      background: "#fff", 
      fontSize: "11px", 
      color: "#0A8356",
      fontWeight: 700,
      textTransform: "uppercase",
      width: 260,
    }
  },
  { 
    id: "5", 
    position: { x: 50, y: 480 }, 
    data: { label: "YES: Auto-Deploy to Gmail" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderRadius: "0", 
      padding: "20px", 
      background: "#fff", 
      fontSize: "11px",
      fontWeight: 500,
      width: 200,
    }
  },
  { 
    id: "6", 
    position: { x: 450, y: 480 }, 
    data: { label: "NO: Manual Review Queue" },
    style: { 
      border: "1px solid #E6E6E6", 
      borderRadius: "0", 
      padding: "20px", 
      background: "#fff", 
      fontSize: "11px", 
      fontWeight: 500,
      width: 200,
    }
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#000", strokeWidth: 1.5 } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#0A8356", strokeWidth: 1.5 } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "#E6E6E6", strokeWidth: 1.5 } },
  { id: "e4-5", source: "4", target: "5", label: "Qualified", style: { stroke: "#0A8356", strokeWidth: 1.5 }, labelStyle: { fill: '#0A8356', fontSize: 10, fontWeight: 700 }, labelBgStyle: { fill: '#fff' } },
  { id: "e4-6", source: "4", target: "6", label: "Low Intent", style: { stroke: "#E6E6E6", strokeWidth: 1.5 }, labelStyle: { fill: '#666', fontSize: 10 }, labelBgStyle: { fill: '#fff' } },
];

export function Workflows() {
  const [nodes, setNodes] = useState<any[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isDeploying, setIsDeploying] = useState(false);
  const { addToast } = useToast();
  const workflowRepo = new WorkflowRepository();

  useEffect(() => {
    workflowRepo.getLatestWorkflow().then(data => {
      if (data && data.metadata) {
        setNodes(data.metadata.nodes || initialNodes);
        setEdges(data.metadata.edges || initialEdges);
      }
    });
  }, []);

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

  const handleDeploy = async () => {
    setIsDeploying(true);
    addToast("Validating flow architecture...", "info");
    
    try {
      await workflowRepo.saveWorkflow("Main Production Flow", nodes, edges);
      addToast("Workflow deployed to active pool.", "success");
    } catch (error: any) {
      addToast(`Deployment failed: ${error.message}`, "error");
    } finally {
      setIsDeploying(false);
    }
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
