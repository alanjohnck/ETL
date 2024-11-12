import React, { useState, useContext } from 'react';
import "./Navbar.css";
import { NodeContext } from '../../context/NodeContext';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('');
  const { nodes, addNode,setSelectedNode } = useContext(NodeContext);

  const inputOptions = [
    { id: 'excel', icon: '📊', label: 'Excel File' },
    { id: 'api', icon: '🔗', label: 'API Input' },
  ];

  const handleNodeOnCanvas = (id) => {
    const newNode = {
      id: `${id}-${nodes.length}`, // Create a unique id
      label: id === 'excel' ? 'Excel File' : 'API Input',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      type: 'default',
    };
    setActiveTab(''); // Close the dropdown
    
    addNode(newNode); // Add node without connecting
  };

  return (
    <nav className="navMainContainer">
      <div className="navbar-container">
        <div className="nav-buttons">
          <button
            onClick={() => setActiveTab(activeTab === 'inputs' ? '' : 'inputs')}
            className={`nav-button ${activeTab === 'inputs' ? 'active' : ''}`}
          >
            Inputs
          </button>
          <button
          onClick={() => setActiveTab(activeTab === 'outputs' ? '' : 'outputs')}
          className={`nav-button ${activeTab === 'outputs' ? 'active' : ''}`}
          >
            Outputs
          </button>
        </div>

        {activeTab === 'inputs' && (
          <div className="dropdown-menu">
            <div className="input-options-grid">
              {inputOptions.map((option) => (
                <button
                  key={option.id}
                  className="input-option"
                  onClick={() => handleNodeOnCanvas(option.id)}
                >
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
