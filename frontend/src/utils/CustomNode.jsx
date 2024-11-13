import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Custom node component
const CustomNode = () => {
    const {selectedNode, setSelectedNode} = useContext(NodeContext);
  return (
    <div className="custom-node" style={{ padding: '10px', border: '2px solid #ddd', borderRadius: '5px' }}>
      <div className="node-label" style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
        {selectedNode.label}
      </div>
      {/* Add handles for connections */}
      <Handle type="target" position={Position.Top} id="a" />
      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  );
};

export default CustomNode;
