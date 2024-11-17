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
    return edges.some(edge => edge.source === 'excel' && edge.target === 'columns');
  };
  const isEdgeFromColumnsToMssql = () => {
    return edges.some(edge => edge.source === 'columns' && edge.target === 'mssql');
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
        isEdgeFromColumnsToMssql() ? (

        <ToMsqlDatabase />
        ) : (
          <p>Please connect the Columns node to the MSSQL node.</p>

        )  
      )
      }
    </div>
  );
}

export default Sidebar;