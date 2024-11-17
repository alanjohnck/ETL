import React, { useContext, useEffect } from 'react';
import './Sidebar.css';
import ColumnsView from '../../SideBarComponents/Columns/ColumnsView';
import ExcelUploader from '../../SideBarComponents/Excel/ExcelUploader';
import ToMsqlDatabase from '../../SideBarComponents/MSSQL/ToMsqlDatabase';
import { NodeContext } from '../../context/NodeContext';

function Sidebar() {
  const { selectedNode, edges } = useContext(NodeContext);

  useEffect(() => {
    console.log(edges);
  }, [edges]);

  const isEdgeFromExcelToColumns = () => {
    return edges.some(edge => edge.source === 'excel-0' && edge.target === 'columns-1');
  };
  const isEdgeFromColumnsToMssql = () => {
    return edges.some(edge => edge.source === 'columns-1' && edge.target === 'mssql-2');
  };

  return (
    <div className="sideMainBarContainer">
      {selectedNode && selectedNode.label === 'Excel File' && (
        <ExcelUploader />
      )}
      {selectedNode && selectedNode.label === 'Columns' && (
        isEdgeFromExcelToColumns() ? (
          <ColumnsView />
        ) : (
          <p>Please connect the Excel node to the Columns node.</p>
        )
      )}
      {selectedNode && selectedNode.label === 'MSSQL' && (
        <ToMsqlDatabase />
        )  
      }
    </div>
  );
}

export default Sidebar;