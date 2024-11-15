import { useCallback, useContext } from 'react';
import { NodeContext } from '../context/NodeContext';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from '../utils/CustomNode';
function Flow() {
   const { nodes, setNodes, edges, setEdges, setSelectedNode } = useContext(NodeContext);
  
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
    
  );

  // Manual edge creation
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
    console.log(edges);
  };

  const nodeTypes = {
    customNode: CustomNode, // Register your custom node
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
      
     
      >
        <Controls />
        <Background variant='lines' color="#fff" gap={26} size={3}  />
      </ReactFlow>
    </div>
  );
}

export default Flow;
