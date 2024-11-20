import React, { createContext, useState } from 'react';

// Create context
export const NodeContext = createContext();

// Provider component
export const NodeProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const addNode = (node) => {
    const newNode = {
      id: node.id ,
      type: node.type || 'default',
      position: node.position || { x: 0, y: 0 },
      data: {
        id: node.id,
        label: node.data?.label || 'Default Label',
        image: node.data?.image || 'Default Image',
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  return (
    <NodeContext.Provider value={{ nodes, setNodes, edges, setEdges, addNode, selectedNode, setSelectedNode }}>
      {children}
    </NodeContext.Provider>
  );
};
