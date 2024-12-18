import React, { useContext, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { NodeContext } from '../context/NodeContext';
import '@xyflow/react/dist/style.css';
import CustomNode from '../utils/CustomNode';

const Flow = () => {
  const { nodes, setNodes, edges, setEdges,selectedNode, addNode,setSelectedNode } = useContext(NodeContext);
  const dropRef = useRef(null); // Ref for the drop zone
  const proOptions = { hideAttribution: true };

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

  const [, drop] = useDrop(() => ({
    accept: 'node',
    drop: (item, monitor) => {
      if (!dropRef.current) {
        console.error('Drop ref is not assigned');
        return;
      }

      const clientOffset = monitor.getClientOffset();
      const canvasRect = dropRef.current.getBoundingClientRect();

      if (!clientOffset || !canvasRect) {
        console.error('Invalid clientOffset or canvasRect');
        return;
      }

      const position = {
        x: clientOffset.x - canvasRect.left,
        y: clientOffset.y - canvasRect.top,
      };

      const newNode = {
        id: `${item.id}`,
        type: 'customNode',
        position,
        data: {
          id: item.id,
          label: item.label,
          image: item.image,
        },
      };

      addNode(newNode);
    },
  }));

  drop(dropRef); // Attach drop functionality

  const nodeTypes = {
    customNode: CustomNode,
  };
  const onNodeClick = (_, node) => {
    setSelectedNode(node);

  };
  return (
    <div ref={dropRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        proOptions={proOptions}
      >
        <Controls />
        <Background variant="lines" color="#fff" gap={26} size={3} />
      </ReactFlow>
    </div>
  );
};

export default Flow;
