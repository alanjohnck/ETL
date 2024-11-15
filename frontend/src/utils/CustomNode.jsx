import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNode.css'; // Import the CSS file

const CustomNode = ({ id, data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} id="a" />
      <div className="node-label">
        {data.label || 'Default Label'}
      </div>
      <div className="node-image">
        <img src={data.image} alt="Node" />
      </div>
      <Handle type="source" position={Position.Right} id="b" />
    </div>
  );
};

export default CustomNode;
