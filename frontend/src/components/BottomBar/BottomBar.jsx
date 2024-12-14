import React, { useContext, useEffect, useState } from 'react';
import './BottomBar.css';
import { ExcelDataContext } from '../../context/ExcelDataContext';
import { toast } from 'sonner';

function BottomBar() {
  const { excelData } = useContext(ExcelDataContext);
  const [limitedData, setLimitedData] = useState([]); // State for up to 10 rows

  useEffect(() => {
  
    // Extract up to 10 rows for limited display
    const displayRows = excelData.slice(0, 10);
    setLimitedData(displayRows);
  }, [excelData]);

  // Guard clause: Don't render anything if there's no valid data
  if (!limitedData || limitedData.length === 0) {
    return null;
  }

  // Extract the header (first row) and data (remaining rows)
  const headers = limitedData[0]; // Assuming the first row contains column headers
  const dataRows = limitedData.slice(1); // Remaining rows are data

  return (
    <div className='bottomBarContainer'>
      <table className='data-table'>
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
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BottomBar;
