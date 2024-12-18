import { createContext, useState } from "react";

// Create context
export const ExcelDataContext = createContext();

// Create context provider
export const ExcelDataProvider = ({ children }) => {
  const [excelData, setExcelData] = useState([]);
  const [columnConfig, setColumnConfig] = useState([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState({});
  const [connectionConfig, setConnectionConfig] = useState({
    serverName: "",
    username: "",
    password: "",
    databaseName: "",
    schemaName: "dbo",
    tableName: "",
    dropAndCreate: false,
    deleteExistingData: false,
    createIfNotExists: true,
  });
  const [uploadState, setUploadState] = useState({
    file: null,
    worksheets: [],
    selectedSheet: "",
    sheetNumber: 0,
    uploading: false,
    progress: 0,
    isFileReady: false,
  });

  // New MSSQL state
  const [mssqlForm, setMssqlForm] = useState({
    serverName: "",
    username: "",
    password: "",
    databaseName: "",
    schemaName: "dbo",
    tableName: "",
    dropAndCreate: false,
    deleteExistingData: false,
    createIfNotExists: true,
    databases: [],
    connectionStatus: "",
    importStatus: "",
  });

  return (
    <ExcelDataContext.Provider
      value={{
        excelData,
        setExcelData,
        columnConfig,
        setColumnConfig,
        selectedDataTypes,
        setSelectedDataTypes,
        connectionConfig,
        setConnectionConfig,
        uploadState,
        setUploadState,
        mssqlForm,
        setMssqlForm, // Add MSSQL form state here
      }}
    >
      {children}
    </ExcelDataContext.Provider>
  );
};
