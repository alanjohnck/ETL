import React, { useContext, useState } from 'react';
import { NodeContext } from '../../context/NodeContext';
import * as XLSX from 'xlsx';
import './Sidebar.css';

function Sidebar() {
  const { selectedNode } = useContext(NodeContext);

  const [file, setFile] = useState(null);
  const [worksheets, setWorksheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetNames = workbook.SheetNames;
        setWorksheets(sheetNames);
        setSelectedSheet(sheetNames[0]); // Set the first sheet as default
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  const handleSheetChange = (e) => {
    setSelectedSheet(e.target.value);
  };

  return (
    <div className="sideMainBarContainer">
    
      {selectedNode.label === 'Excel File' && (
       
        <div className="excelUploader">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="fileInput"
          />
          {file && (
            <div className="fileInfo">
              <p className="fileName">Selected file: {file.name}</p>
              <select
                value={selectedSheet}
                onChange={handleSheetChange}
                className="sheetSelect"
              >
                {worksheets.map((sheet, index) => (
                  <option key={index} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
