import React, { useState, useContext } from 'react';
import "./Navbar.css";
import { NodeContext } from '../../context/NodeContext';
import { FileSpreadsheet } from 'lucide-react';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('');
  const { nodes, addNode } = useContext(NodeContext);

  // Define input, preparation, and output options
  const inputOptions = [
    { id: 'excel', icon: <FileSpreadsheet />, image: './excel.png', label: 'Excel File' },
    { id: 'api', icon: '🔗', image: './api.png', label: 'API Input' },
  ];

  const preparationOptions = [
    { id: 'columns', icon: '📊', image: './columns.png', label: 'Columns' },
  ];

  const outputOptions = [
    { id: 'mssql', icon: '📤', image: './mssql.png', label: 'MSSQL' },
  ];

  // Handler to add nodes to canvas with the correct image
  const handleNodeOnCanvas = (id, label, image) => {
    const newNode = {
      id: `${id}`, // Create a unique id
      label: label,
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      image: image, // Use the provided image URL
      type: 'customNode',
    };
    setActiveTab(''); // Close the dropdown
    console.log('Adding Node:', newNode);
    addNode(newNode); // Add node without connecting
  };

  // Common function to render dropdown menu options
  const renderDropdownMenu = (options) => (
    <div className="dropdown-menu">
      <div className="input-options-grid">
        {options.map((option) => (
          <button
            key={option.id}
            className="input-option"
            onClick={() => handleNodeOnCanvas(option.id, option.label, option.image)}
          >
            <span className="option-icon">{option.icon}</span>
            <span className="option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
            onClick={() => setActiveTab(activeTab === 'preparations' ? '' : 'preparations')}
            className={`nav-button ${activeTab === 'preparations' ? 'active' : ''}`}
          >
            Preparation
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'outputs' ? '' : 'outputs')}
            className={`nav-button ${activeTab === 'outputs' ? 'active' : ''}`}
          >
            Outputs
          </button>
        </div>

        {/* Render Dropdown Menus Based on Active Tab */}
        {activeTab === 'inputs' && renderDropdownMenu(inputOptions)}
        {activeTab === 'preparations' && renderDropdownMenu(preparationOptions)}
        {activeTab === 'outputs' && renderDropdownMenu(outputOptions)}
      </div>
    </nav>
  );
};

export default Navbar;
