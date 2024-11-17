import React, { useContext, useState, useEffect } from 'react';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import './ExcelUploader.css';
import * as XLSX from 'xlsx';

function ExcelUploader() {
  const { setExcelData } = useContext(ExcelDataContext);
  const [file, setFile] = useState(null);
  const [worksheets, setWorksheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetNumber, setSheetNumber] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [excelData, setExcelDataState] = useState([]);
  const [isFileReady, setIsFileReady] = useState(false);


  //for resetting the state when is there any other file uploaded after uploading one file
  const resetUploader = () => {
    setFile(null);
    setWorksheets([]);
    setSelectedSheet('');
    setSheetNumber(0);
    setUploading(false);
    setProgress(0);
    setExcelDataState([]);
    setIsFileReady(false);
  };

  const handleFileUpload = async (e) => {
    resetUploader(); // Reset state when new file is selected
    
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      setWorksheets(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0]);
      setSheetNumber(0);
      setIsFileReady(true);
    }
  };
  //for changing the sheet and setting the sheet
  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    const sheetIndex = worksheets.findIndex((sheet) => sheet === sheetName);
    setSheetNumber(sheetIndex);
  };

  // Clear previous data from backend before starting new upload
  const clearPreviousData = async () => {
    try {
      await fetch('http://localhost:8000/clear-data', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error clearing previous data:', error);
    }
  };

  const sendDataToServer = async (dataChunk, currentChunk, totalChunks) => {
    try {
      const response = await fetch('http://localhost:8000/upload-excel-chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataChunk }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload data chunk');
      }

      const newProgress = Math.round(((currentChunk + 1) / totalChunks) * 100);
      setProgress(newProgress);

      return true;
    } catch (error) {
      console.error('Error uploading data chunk:', error);
      return false;
    }
  };

  const handleCreateClick = async () => {
    if (!file || !selectedSheet) return;

    setUploading(true);
    setProgress(0);

    try {
      // Clear previous data first
      await clearPreviousData();

      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const arrayBuffer = fileReader.result;
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[worksheets[sheetNumber]];
        const newJsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        setExcelDataState(newJsonData);
        setExcelData(newJsonData);

        const chunkSize = 1000;
        const totalChunks = Math.ceil(newJsonData.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          const chunk = newJsonData.slice(i * chunkSize, (i + 1) * chunkSize);
          const success = await sendDataToServer(chunk, i, totalChunks);

          if (!success) {
            throw new Error('Upload failed at chunk ' + i);
          }
        }

        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 1000);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Upload process failed:', error);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="excelMainContainer">
      <div className="excelUploader">
        <div className="uploadArea">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="fileInput"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="uploadLabel">
            <p>Drag and drop your Excel or CSV file here</p>
            <p>or click to browse</p>
          </label>
        </div>

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
            
            {isFileReady && (
              <button
                onClick={handleCreateClick}
                className="createButton"
                disabled={uploading}
              >
                Upload
              </button>
            )}
          </div>
        )}

        {uploading && (
          <div className="uploadProgressContainer">
            <div className="progressLabel">
              {progress === 100 ? 'Upload Complete!' : 'Uploading...'}
            </div>
            <div className="progressBar">
              <div
                className="progress"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progressPercentage">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelUploader;