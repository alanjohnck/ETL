import { createContext, useState } from "react";

// Create context
export const ExcelDataContext = createContext();
// Create context provider
export const ExcelDataProvider = ({ children }) => {
    const [excelData, setExcelData] = useState([]);
    const [columnConfig, setColumnConfig] = useState([]);
    return (
        <ExcelDataContext.Provider value={{ excelData, setExcelData,columnConfig,setColumnConfig }}>
            {children}
        </ExcelDataContext.Provider>
        );
 };