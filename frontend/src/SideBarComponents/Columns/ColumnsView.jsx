import React, { useState, useContext, useEffect } from 'react';
import './ColumnsView.css';
import { ExcelDataContext } from '../../context/ExcelDataContext';

function ColumnsView() {
  const { excelData, selectedDataTypes, setSelectedDataTypes, setColumnConfig } = useContext(ExcelDataContext);

  // Define user-friendly and corresponding MSSQL datatype mappings
  const dataTypeOptions = [
    { label: 'String', mssqlType: 'VARCHAR(MAX)' },
    { label: 'Integer', mssqlType: 'INT' },
    { label: 'Double', mssqlType: 'FLOAT' },
    { label: 'Date', mssqlType: 'DATE' },
    { label: 'Boolean', mssqlType: 'BIT' },
  ];

  // Check if excelData is available and has content
  if (!excelData || excelData.length === 0) return <p className='info-message'>No data available</p>;

  // Extract the header (first row)
  const headers = excelData[0];

  // Handler for dropdown change
  const handleDataTypeChange = (header, selectedType) => {
    setSelectedDataTypes((prevSelected) => {
      const updatedDataTypes = { ...prevSelected, [header]: selectedType };
      // Automatically save data when a new data type is selected
      updateColumnConfig(updatedDataTypes);
      return updatedDataTypes;
    });
  };

  // Function to get the MSSQL data type
  const getMssqlType = (label) => {
    const selectedOption = dataTypeOptions.find((option) => option.label === label);
    return selectedOption ? selectedOption.mssqlType : 'VARCHAR(MAX)';
  };

  // Function to automatically update column configuration
  const updateColumnConfig = (updatedDataTypes) => {
    const mappedDataTypes = headers.map((header) => ({
      header: header,
      userSelected: updatedDataTypes[header] || 'String',
      mssqlType: getMssqlType(updatedDataTypes[header] || 'String'),
    }));
    setColumnConfig(mappedDataTypes);
  };

  useEffect(() => {
    // Initialize the column config based on the current selectedDataTypes state
    updateColumnConfig(selectedDataTypes);
  }, [selectedDataTypes, headers, setColumnConfig]);

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
          >
            {dataTypeOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default ColumnsView;
