import React, { useContext, useState, useEffect } from 'react';
import { NodeContext } from '../../context/NodeContext';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import './ExcelUploader.css'; 
import * as XLSX from 'xlsx';

function ExcelUploader() {
  const { selectedNode } = useContext(NodeContext);
  const { setExcelData } = useContext(ExcelDataContext);
  const [file, setFile] = useState(null);
  const [worksheets, setWorksheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetNumber, setSheetNumber] = useState(0);

  // Handle file upload and read the data
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const data = await uploadedFile.arrayBuffer(); // Convert file to ArrayBuffer
      const workbook = XLSX.read(data, { sheetRows: 10 }); // Use XLSX.read instead of XLSX.readFile
      setWorksheets(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0]);
      setSheetNumber(0); // Default sheet selection (first sheet)
    }
  };

  // Handle sheet selection change and load the data for the selected sheet
  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    const sheetIndex = worksheets.findIndex((sheet) => sheet === sheetName);
    setSheetNumber(sheetIndex);
  };

  // Effect to load the data of the selected sheet whenever sheetNumber changes
  useEffect(() => {
    if (file && worksheets.length > 0 && sheetNumber !== null) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const arrayBuffer = fileReader.result;
        const workbook = XLSX.read(arrayBuffer, { sheetRows: 10 });
        const worksheet = workbook.Sheets[worksheets[sheetNumber]];
        const newJsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        setExcelData(newJsonData); // Update the context with the new data
      };
      fileReader.readAsArrayBuffer(file);
    }
  }, [file, sheetNumber, worksheets, setExcelData]);

  return (
    <div className='excelMainContainer'>

        <div className="excelUploader">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
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

    </div>
  );
}

export default ExcelUploader;
