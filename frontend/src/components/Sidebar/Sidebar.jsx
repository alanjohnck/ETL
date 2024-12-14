import React, { useContext, useEffect, useRef } from 'react';
import './Sidebar.css';
import ColumnsView from '../../SideBarComponents/Columns/ColumnsView';
import ExcelUploader from '../../SideBarComponents/Excel/ExcelUploader';
import { NodeContext } from '../../context/NodeContext';
import ToMssqlDatabase from '../../SideBarComponents/Mssql/ToMssqlDatabase';
import { Toaster, toast } from 'sonner';

function Sidebar() {
  const { selectedNode, edges } = useContext(NodeContext);
  const previousNode = useRef(null);

  const isEdgeFromExcelToColumns = () => {
    return edges.some(edge =>
      edge.source.startsWith('excel') && edge.target.startsWith('columns')
    );
  };

  const isEdgeFromColumnsToMssql = () => {
    return edges.some(edge =>
      edge.source.startsWith('columns') && edge.target.startsWith('mssql')
    );
  };

  useEffect(() => {
    if (!selectedNode || !selectedNode.data) {
      previousNode.current = null;
      return;
    }

    // Only show toast if it's a new node selection (prevents toast on move)
    if (previousNode.current?.id !== selectedNode.id) {
      if (selectedNode.type === 'customNode') {
        if (selectedNode.data.label === 'Columns' && !isEdgeFromExcelToColumns()) {
          toast.error('Please connect the Excel File node to the Columns node.', {
            id: 'columns-connection',  // Unique ID prevents duplicate toasts
          });
        } else if (selectedNode.data.label === 'MSSQL' && !isEdgeFromColumnsToMssql()) {
          toast.error('Please connect the Columns node to the MSSQL node.', {
            id: 'mssql-connection',  // Unique ID prevents duplicate toasts
          });
        }
      }
    }

    previousNode.current = selectedNode;
  }, [selectedNode, edges]);

  const renderComponent = () => {
    if (!selectedNode || !selectedNode.data) return null;
    const label = selectedNode.data.label;

    switch (label) {
      case 'Excel File':
        return <ExcelUploader />;
      case 'Columns':
        return isEdgeFromExcelToColumns() ? <ColumnsView /> : null;
      case 'MSSQL':
        return isEdgeFromColumnsToMssql() ? <ToMssqlDatabase /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="sideMainBarContainer">
      {renderComponent()}
    
    </div>
  );
}

export default Sidebar;