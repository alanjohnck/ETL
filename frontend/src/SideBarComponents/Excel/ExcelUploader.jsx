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

  // Reset uploader state when new file is uploaded
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

  // Handle file upload and extract sheet names
  const handleFileUpload = async (e) => {
    resetUploader();

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

  // Handle sheet change
  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    const sheetIndex = worksheets.findIndex((sheet) => sheet === sheetName);
    setSheetNumber(sheetIndex);
  };

  // Clear previous data on the server
  const clearPreviousData = async () => {
    try {
      await fetch('https://etl-latest.onrender.com/clear-data', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error clearing previous data:', error);
    }
  };

  // Send chunk of data to the server
  const sendDataToServer = async (dataChunk, currentChunk, totalChunks) => {
    try {
      const response = await fetch('https://etl-latest.onrender.com/upload-excel-chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataChunk }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload data chunk');
      }

      return true;
    } catch (error) {
      console.error('Error uploading data chunk:', error);
      return false;
    }
  };

  // Upload file and send data in 5MB chunks
  const handleCreateClick = async () => {
    if (!file || !selectedSheet) return;

    setUploading(true);
    setProgress(0);

    try {
      await clearPreviousData();

      const fileReader = new FileReader();

      fileReader.onload = async () => {
        const arrayBuffer = fileReader.result;
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[worksheets[sheetNumber]];
        const newJsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        setExcelDataState(newJsonData);
        setExcelData(newJsonData);

        const maxChunkSize = 5 * 1024 * 1024; // 5MB in bytes
        let currentChunk = [];
        let currentSize = 0;
        let totalSize = JSON.stringify(newJsonData).length;
        let chunksSent = 0;

        // Function to send a chunk
        const sendCurrentChunk = async () => {
          if (currentChunk.length > 0) {
            const success = await sendDataToServer(currentChunk, chunksSent, Math.ceil(totalSize / maxChunkSize));
            if (!success) throw new Error('Upload failed at chunk ' + chunksSent);
            currentChunk = [];
            currentSize = 0;
            chunksSent++;
            setProgress(Math.round((chunksSent * maxChunkSize) / totalSize * 100));
          }
        };

        for (const row of newJsonData) {
          const rowSize = JSON.stringify(row).length; // Approximate size of the current row
          if (currentSize + rowSize > maxChunkSize) {
            await sendCurrentChunk(); // Send the current chunk when size exceeds 5MB
          }
          currentChunk.push(row);
          currentSize += rowSize;
        }

        // Send any remaining rows
        await sendCurrentChunk();
        setProgress(100);
        setUploading(false);
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
                upload
              </button>
            )}
          </div>
        )}

        {uploading && (
          <div className="uploadProgressContainer">
            <div className="progressLabel">
              {progress === 100 ? 'Upload Completed' : 'Uploading...'}
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
