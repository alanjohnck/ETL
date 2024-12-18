import React, { useContext, useEffect } from 'react';
import './Sidebar.css';
import ColumnsView from '../../SideBarComponents/Columns/ColumnsView';
import ExcelUploader from '../../SideBarComponents/Excel/ExcelUploader';
import ToMsqlDatabase from '../../SideBarComponents/MSSQL/ToMsqlDatabase';
import { NodeContext } from '../../context/NodeContext';

function Sidebar() {
  const { selectedNode, edges } = useContext(NodeContext);
;

  const isEdgeFromExcelToColumns = () => {
    return edges.some(edge => edge.source === 'excel' && edge.target === 'columns');
  };
  const isEdgeFromColumnsToMssql = () => {
    return edges.some(edge => edge.source === 'columns' && edge.target === 'mssql');
  };

  return (
    <div className="sideMainBarContainer">
      {selectedNode && selectedNode.data.label === 'Excel File' && (
        <ExcelUploader />
      )}
      {selectedNode && selectedNode.data.label === 'Columns' && (
        isEdgeFromExcelToColumns() ? (
          <ColumnsView />
        ) : (
          <p className='info-message'>Please connect the Excel node to the Columns node.</p>
        )
      )}
      {selectedNode && selectedNode.data.label === 'MSSQL' && (
        isEdgeFromColumnsToMssql() ? (

        <ToMsqlDatabase />
        ) : (
          <p className='info-message'>Please connect the Columns node to the MSSQL node.</p>

        )  
      )
      }
    </div>
  );
}

export default Sidebar;