import React from 'react';
import './BottomBar.css';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import { useContext } from 'react';

function BottomBar() {
  const { excelData } = useContext(ExcelDataContext);

  // Check if excelData is available and has content
  if (!excelData || excelData.length === 0) return <p>No data available</p>;

  // Extract the header (first row) and data (subsequent rows)
  const headers = excelData[0]; // Assuming the first row is the header
  const dataRows = excelData.slice(1); // Remaining rows are data

  return (
    <div className='bottomBarContainer'>
      <div className='scrollableContent'>
        <table>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BottomBar;
