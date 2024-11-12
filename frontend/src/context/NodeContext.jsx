import { createContext, useState } from "react";

// Create context
export const NodeContext = createContext();

// Create a provider component
export const NodeProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]); // Hold all nodes here
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState([]); // New state for the selected node

  const addNode = (node) => {
    setNodes((prevNodes) => [...prevNodes, node]);
  };

  return (
    <NodeContext.Provider value={{ nodes, setNodes, edges,addNode, setEdges, selectedNode, setSelectedNode }}>
      {children}
    </NodeContext.Provider>
  );
};
