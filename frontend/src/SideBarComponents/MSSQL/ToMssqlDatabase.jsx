import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import "./ToMsqlDatabase.css";
import { ExcelDataContext } from '../../context/ExcelDataContext';
import { Toaster, toast } from 'sonner'

function ToMssqlDatabase() {
  // Initialize state with values from localStorage if they exist
  const [serverName, setServerName] = useState(() => localStorage.getItem('mssql_serverName') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('mssql_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('mssql_password') || '');
  const [databaseName, setDatabaseName] = useState(() => localStorage.getItem('mssql_databaseName') || '');
  const [schemaName, setSchemaName] = useState(() => localStorage.getItem('mssql_schemaName') || 'dbo');
  const [tableName, setTableName] = useState(() => localStorage.getItem('mssql_tableName') || '');
  const [dropAndCreate, setDropAndCreate] = useState(() => localStorage.getItem('mssql_dropAndCreate') === 'true');
  const [deleteExistingData, setDeleteExistingData] = useState(() => localStorage.getItem('mssql_deleteExistingData') === 'true');
  const [createIfNotExists, setCreateIfNotExists] = useState(() => localStorage.getItem('mssql_createIfNotExists') === 'true' || true);
  const [databases, setDatabases] = useState([]);
  const [importStatus, setImportStatus] = useState('import data to mssql');
  const [uploading, setUploading] = useState(false);
  const { columnConfig } = useContext(ExcelDataContext);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mssql_serverName', serverName);
    localStorage.setItem('mssql_username', username);
    localStorage.setItem('mssql_password', password);
    localStorage.setItem('mssql_databaseName', databaseName);
    localStorage.setItem('mssql_schemaName', schemaName);
    localStorage.setItem('mssql_tableName', tableName);
    localStorage.setItem('mssql_dropAndCreate', dropAndCreate);
    localStorage.setItem('mssql_deleteExistingData', deleteExistingData);
    localStorage.setItem('mssql_createIfNotExists', createIfNotExists);
  }, [serverName, username, password, databaseName, schemaName, tableName, dropAndCreate, deleteExistingData, createIfNotExists]);

  // Check MSSQL Connection
  const handleConnect = async () => {
    const connectingToast = toast.loading('Connecting to database...');

    try {
      const response = await axios.post('https://etl-latest.onrender.com/check-mssql-connection', {
        username,
        password,
        serverName
      });

      if (response.data.connectionStatus === 'success') {
        setDatabases(response.data.databases);
        toast.dismiss(connectingToast);
        toast.success('Connected successfully');
      }
    } catch (error) {
        toast.dismiss(connectingToast);
        toast.error('Connection failed', {
          duration: 5000,
        });
    }
  };

  // Import Data to MSSQL
  const handleImportData = async () => {
    if (!columnConfig) {
      setImportStatus("Column configuration is missing.");
      toast.error('Column configuration is missing');
      return;
    }
    
    const importDataRequest = {
      dbConfig: {
        username,
        password,
        server: serverName,
        databaseName,
        schemaName,
        tableName,
      },
      options: {
        dropAndCreate,
        deleteExistingData,
        createIfNotExists,
      },
      columnConfig,
    };
    const connectingToast = toast.loading('Importing to database...');
    setUploading(true);
    try {
      const response = await axios.post('https://etl-latest.onrender.com/import-data-to-mssql', importDataRequest);
      setImportStatus(`Import Successful: ${response.data.message}`);
      setUploading(false)
      toast.dismiss(connectingToast);
      toast.success('Import Successful');
    } catch (error) {
      setImportStatus(`Import Failed: ${error.response?.data?.detail || error.message}`);
      setUploading(false)
      toast.dismiss(connectingToast);
      toast.error('Import Failed', {
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    // Reset the connection status and databases when the server name or credentials change
    setDatabases([]);
  }, [serverName, username, password]);

  return (
    <div className="mssqlMainContainer">
      <div className="mssqlConnectionForm">
        <h3 className="formHeader">Connection Form</h3>
        <input
          className="inputField"
          type="text"
          placeholder="Enter Server Name"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
        />
        <input
          className="inputField"
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="inputField"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Toaster position="top-right" richColors />
        <button className="primaryButton" onClick={handleConnect}>Connect</button>
      </div>

      <div className='mssqlDetailForm'>
        <div className="mssqlDatabases">
          <h4 className="databaseHeader">Available Databases</h4>
          <select
            className="selectField"
            onChange={(e) => setDatabaseName(e.target.value)}
            value={databaseName}
          >
            <option value="">Select Database</option>
            {databases.map((db, index) => (
              <option key={index} value={db}>{db}</option>
            ))}
          </select>
        </div>

        <input
          className="inputField"
          type="text"
          placeholder="Enter Table Name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />

        <div className="optionsContainer">
          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={dropAndCreate}
              onChange={(e) => setDropAndCreate(e.target.checked)}
            />
            Drop and Create Table
          </label>

          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={deleteExistingData}
              onChange={(e) => setDeleteExistingData(e.target.checked)}
            />
            Delete Existing Data
          </label>

          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={createIfNotExists}
              onChange={(e) => setCreateIfNotExists(e.target.checked)}
            />
            Create If Not Exists
          </label>
        </div>
      </div>
      <button disabled={uploading} className="primaryButton" onClick={handleImportData}>
        {uploading ? 'Importing.' : 'Import Data to MSSQL'}
      </button>
    </div>
  );
}

export default ToMssqlDatabase;