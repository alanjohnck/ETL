import React, { useContext, useState } from 'react';
import { NodeContext } from '../../context/NodeContext';
import * as XLSX from 'xlsx';
import './Sidebar.css';
import ExcelUploader from '../../SideBarComponents/Excel/ExcelUploader';
function Sidebar() {

  return (
    <div className="sideMainBarContainer">
        <ExcelUploader />
    </div>
  );
}

export default Sidebar;
