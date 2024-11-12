import React from 'react';
import './BottomBar.css';

function BottomBar() {
  return (
    <div className='bottomBarContainer'>
      <div className='scrollableContent'>
        {/* Example content to demonstrate scrolling */}
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
              <th>Header 3</th>
              <th>Header 4</th>
              <th>Header 5</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 50 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <td key={colIndex}>Row {rowIndex + 1}, Col {colIndex + 1}</td>
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