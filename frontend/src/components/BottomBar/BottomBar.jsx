import React from 'react';
import './BottomBar.css';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import { useContext, useEffect, useState } from 'react';

function BottomBar() {
  const { excelData } = useContext(ExcelDataContext);
  const [limitedData, setLimitedData] = useState([]); // State for 50 rows


  useEffect(() => {
    if (!excelData || excelData.length === 0) return;

    // Extract 50 rows for limited display
    const displayRows = excelData.slice(0, 10); 
    setLimitedData(displayRows);
  }, [excelData]); 
  if (!limitedData || limitedData.length === 0) return <p className='selectTheInput'>No data available. Select the inputs</p>;

  // Extract the header (first row) and data (subsequent rows)
  const headers = limitedData[0]; // Assuming the first row is the header
  const dataRows = limitedData.slice(1); // Remaining rows are data

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
