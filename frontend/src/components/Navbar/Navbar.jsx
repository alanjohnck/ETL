import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './Navbar.css';
import { FileSpreadsheet } from 'lucide-react';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('');

  const inputOptions = [
    { id: 'excel', icon: <FileSpreadsheet />, image: './excel.png', label: 'Excel File' },
  ];

  const preparationOptions = [
    { id: 'columns', icon: '📊', image: './columns.png', label: 'Columns' },
  ];

  const outputOptions = [
    { id: 'mssql', icon: '📤', image: './mssql.png', label: 'MSSQL' },
  ];

  const handleOptionDragged = () => {
    setActiveTab(''); // Reset the active tab when an option is dragged or selected
  };

  const renderDropdownMenu = (options) => (
    <div className="dropdown-menu">
      <div className="input-options-grid">
        {options.map((option) => (
          <DraggableOption key={option.id} option={option} onDrag={handleOptionDragged} />
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

        {activeTab === 'inputs' && renderDropdownMenu(inputOptions)}
        {activeTab === 'preparations' && renderDropdownMenu(preparationOptions)}
        {activeTab === 'outputs' && renderDropdownMenu(outputOptions)}
      </div>
    </nav>
  );
};

const DraggableOption = ({ option, onDrag }) => {
  const [, dragRef] = useDrag(() => ({
    type: 'node',
    item: option,
    end: () => {
      // This triggers when the drag action ends
      onDrag(); // Notify the parent to close the dropdown
    },
  }));

  return (
    <button ref={dragRef} className="input-option">
      <span className="option-icon">{option.icon}</span>
      <span className="option-label">{option.label}</span>
    </button>
  );
};

export default Navbar;
