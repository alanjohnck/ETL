import { useCallback, useContext } from 'react';
import { NodeContext } from '../context/NodeContext';
import { useDrop } from 'react-dnd';
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
  const { nodes, setNodes,addNode , edges, setEdges, setSelectedNode } = useContext(NodeContext);
  const proOptions = { hideAttribution: true };

  const [{ isOver }, drop] = useDrop({
    accept: 'BOX',
    drop: (item, monitor) => {
      const position = monitor.getClientOffset();
      const dropPosition = project({
        x: position.x,
        y: position.y,
      });
    
      const newNode = {
        id: item.id,
        type: 'customNode',
        position: dropPosition,
        data: {
          label: item.label,
          image: item.image,
        },
      };
    
      addNode(newNode); // Handles updating the `nodes` state
      setSelectedNode(newNode); // Updates the selected node
    },
    
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Helper function to project screen coordinates to flow coordinates
  const project = (position) => {
    const reactFlowBounds = document.querySelector('.react-flow').getBoundingClientRect();
    const scale = 1; // If you're using zoom, you'll need to get the actual scale
    
    return {
      x: (position.x - reactFlowBounds.left) / scale,
      y: (position.y - reactFlowBounds.top) / scale,
    };
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const nodeTypes = {
    customNode: CustomNode,
  };

  return (
    <div 
      ref={drop} 
      style={{ width: '100%', height: '100%' }}
      className={`react-flow-wrapper ${isOver ? 'drag-over' : ''}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
      >
        <Controls />
        <Background color="#162B4C" gap={26} size={3} />
      </ReactFlow>
    </div>
  );
}

export default Flow;