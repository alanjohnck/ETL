import React, { useState, useContext, useEffect, useRef } from 'react';
import './ColumnsView.css';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import { toast } from 'sonner';

function ColumnsView() {
  const { excelData, setColumnConfig } = useContext(ExcelDataContext);
  const [isConfirmed, setIsConfirmed] = useState(false); // State to track confirmation

  // Ref to track if the toast has been shown
  const toastShown = useRef(false);

  // Define user-friendly and corresponding MSSQL datatype mappings
  const dataTypeOptions = [
    { label: 'String', mssqlType: 'VARCHAR(MAX)' },
    { label: 'Integer', mssqlType: 'INT' },
    { label: 'Double', mssqlType: 'FLOAT' },
    { label: 'Date', mssqlType: 'DATE' },
    { label: 'Boolean', mssqlType: 'BIT' },
  ];

  // State to store user-selected datatypes for each column
  const [selectedDataTypes, setSelectedDataTypes] = useState({});

  // Guard clause: Show a toast only once if no data is available
  useEffect(() => {
    if (!excelData || excelData.length === 0) {
      if (!toastShown.current) {
        toast.info('No data available. Select the inputs');
        toastShown.current = true; // Mark toast as shown
      }
    }
  }, [excelData]); // Only re-run if excelData changes

  // If no data is available, don't render the sidebar
  if (!excelData || excelData.length === 0) {
    return null; // This hides the sidebar
  }

  // Extract the header (first row)
  const headers = excelData[0] || [];

  // Handler for dropdown change
  const handleDataTypeChange = (header, selectedType) => {
    setSelectedDataTypes((prevSelected) => ({
      ...prevSelected,
      [header]: selectedType,
    }));
  };

  // Function to get the MSSQL data type
  const getMssqlType = (label) => {
    const selectedOption = dataTypeOptions.find((option) => option.label === label);
    return selectedOption ? selectedOption.mssqlType : 'VARCHAR(MAX)';
  };

  // Function to log selected headers and MSSQL datatypes
  const handleConfirm = () => {
    const mappedDataTypes = headers.map((header) => ({
      header: header,
      userSelected: selectedDataTypes[header] || 'String',
      mssqlType: getMssqlType(selectedDataTypes[header] || 'String'),
    }));

    console.log('Selected Data Types:', mappedDataTypes);
    setColumnConfig(mappedDataTypes);
    setIsConfirmed(true); // Set confirmation state to true
  };

  return (
    <div className='columnSideBarContainer'>
      <h3>Select Data Types for Each Column</h3>
      {headers.map((header, index) => (
        <div key={index} className='column-row'>
          <span className='column-name'>{header}</span>
          <select
            className='data-type-dropdown'
            value={selectedDataTypes[header] || 'String'}
            onChange={(e) => handleDataTypeChange(header, e.target.value)}
            disabled={isConfirmed} // Disable the select if confirmed
          >
            {dataTypeOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        className='confirm-button'
        onClick={handleConfirm}
        disabled={isConfirmed} // Disable the button if confirmed
      >
        {isConfirmed ? 'Confirmed' : 'Confirm Selection'}
      </button>
    </div>
  );
}

export default ColumnsView;
