import { createContext, useState } from "react";

// Create context
export const ExcelDataContext = createContext();
// Create context provider
export const ExcelDataProvider = ({ children }) => {
    const [excelData, setExcelData] = useState([]);
    return (
        <ExcelDataContext.Provider value={{ excelData, setExcelData }}>
            {children}
        </ExcelDataContext.Provider>
        );
 };