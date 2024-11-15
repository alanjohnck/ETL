import React, { useContext, useState } from 'react';
import { NodeContext } from '../../context/NodeContext';
import * as XLSX from 'xlsx';
import { useEffect } from 'react';
import './Sidebar.css';
import ColumnsView from '../../SideBarComponents/Columns/ColumnsView';
import ExcelUploader from '../../SideBarComponents/Excel/ExcelUploader';
import ToMsqlDatabase from '../../SideBarComponents/MSSQL/ToMsqlDatabase';
function Sidebar() {
  const { selectedNode,edge } = useContext(NodeContext);
  useEffect(() => {
    console.log(edge);
  },[edge]);
  return (
    <div className="sideMainBarContainer">
        {selectedNode.label === 'Excel File' ? (
            <ExcelUploader />
        ) : selectedNode.label === 'Columns' ? (
            <ColumnsView />
        ) : selectedNode.label === 'MSSQL' ? (
            <ToMsqlDatabase />
        ) : null
        }
    </div>
  );
}

export default Sidebar;
