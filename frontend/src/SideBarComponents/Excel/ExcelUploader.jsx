import React, { useContext } from 'react';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import './ExcelUploader.css';
import * as XLSX from 'xlsx';

function ExcelUploader() {
  const { 
    setExcelData,
    uploadState,
    setUploadState
  } = useContext(ExcelDataContext);

  const MAX_CHUNK_SIZE_MB = 5 * 1024 * 1024; // 5MB in bytes

  // Reset uploader state
  const resetUploader = () => {
    setUploadState({
      file: null,
      worksheets: [],
      selectedSheet: '',
      sheetNumber: 0,
      uploading: false,
      progress: 0,
      isFileReady: false
    });
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    resetUploader();
    const uploadedFile = e.target.files[0];
    
    if (uploadedFile) {
      try {
        const data = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(data);

        setUploadState(prev => ({
          ...prev,
          file: uploadedFile,
          worksheets: workbook.SheetNames,
          selectedSheet: workbook.SheetNames[0],
          sheetNumber: 0,
          isFileReady: true
        }));
      } catch (error) {
        console.error('Error reading file:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  // Handle worksheet selection
  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    const sheetIndex = uploadState.worksheets.findIndex((sheet) => sheet === sheetName);
    
    setUploadState(prev => ({
      ...prev,
      selectedSheet: sheetName,
      sheetNumber: sheetIndex
    }));
  };

  // Clear previous data from the server
  const clearPreviousData = async () => {
    try {
      const response = await fetch('https://etl-latest.onrender.com/clear-data', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to clear previous data');
      }
    } catch (error) {
      console.error('Error clearing previous data:', error);
      throw error;
    }
  };

  // Calculate chunk sizes for data upload
  const calculateChunkSize = (data, maxChunkSize) => {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const row of data) {
      const rowSize = new Blob([JSON.stringify(row)]).size;

      if (currentSize + rowSize > maxChunkSize) {
        chunks.push(currentChunk);
        currentChunk = [row];
        currentSize = rowSize;
      } else {
        currentChunk.push(row);
        currentSize += rowSize;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  };

  // Send data chunk to server
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

      const newProgress = Math.round(((currentChunk + 1) / totalChunks) * 100);
      setUploadState(prev => ({
        ...prev,
        progress: newProgress
      }));

      return true;
    } catch (error) {
      console.error('Error uploading data chunk:', error);
      return false;
    }
  };

  // Handle the create/upload button click
  const handleCreateClick = async () => {
    if (!uploadState.file || !uploadState.selectedSheet) return;

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0
    }));

    try {
      await clearPreviousData();

      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result;
          const workbook = XLSX.read(arrayBuffer);
          const worksheet = workbook.Sheets[uploadState.worksheets[uploadState.sheetNumber]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          setExcelData(jsonData);

          const chunks = calculateChunkSize(jsonData, MAX_CHUNK_SIZE_MB);
          const totalChunks = chunks.length;

          for (let i = 0; i < totalChunks; i++) {
            const success = await sendDataToServer(chunks[i], i, totalChunks);
            if (!success) {
              throw new Error('Upload failed at chunk ' + i);
            }
          }

          // Set progress to 100% when complete
          setUploadState(prev => ({
            ...prev,
            progress: 100
          }));

          // Reset upload state after successful completion
          setTimeout(() => {
            setUploadState(prev => ({
              ...prev,
              uploading: false,
              progress: 0
            }));
          }, 1000);
        } catch (error) {
          console.error('Error processing file:', error);
          setUploadState(prev => ({
            ...prev,
            uploading: false,
            progress: 0
          }));
        }
      };

      fileReader.readAsArrayBuffer(uploadState.file);
    } catch (error) {
      console.error('Upload process failed:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0
      }));
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

        {uploadState.file && (
          <div className="fileInfo">
            <p className="fileName">Selected file: {uploadState.file.name}</p>
            <select
              value={uploadState.selectedSheet}
              onChange={handleSheetChange}
              className="sheetSelect"
            >
              {uploadState.worksheets.map((sheet, index) => (
                <option key={index} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>

            {uploadState.isFileReady && (
              <button
                onClick={handleCreateClick}
                className="createButton"
                disabled={uploadState.uploading}
              >
                Upload
              </button>
            )}
          </div>
        )}

        {uploadState.uploading && (
          <div className="uploadProgressContainer">
            <div className="progressLabel">
              {uploadState.progress === 100 ? 'Upload Complete!' : 'Uploading...'}
            </div>
            <div className="progressBar">
              <div
                className="progress"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <p className="progressPercentage">{uploadState.progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelUploader;