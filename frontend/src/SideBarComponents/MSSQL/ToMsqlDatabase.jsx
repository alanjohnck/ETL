import React, { useContext } from "react";
import axios from "axios";
import "./ToMsqlDatabase.css";
import { ExcelDataContext } from "../../context/ExcelDataContext";

function ToMssqlDatabase() {
  const { mssqlForm, setMssqlForm, columnConfig } = useContext(ExcelDataContext);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMssqlForm({
      ...mssqlForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleConnect = async () => {
    try {
      const response = await axios.post("https://etl-latest.onrender.com/check-mssql-connection", {
        username: mssqlForm.username,
        password: mssqlForm.password,
        serverName: mssqlForm.serverName,
      });

      if (response.data.connectionStatus === "success") {
        setMssqlForm({
          ...mssqlForm,
          connectionStatus: "Connected successfully",
          databases: response.data.databases,
        });
      }
    } catch (error) {
      setMssqlForm({
        ...mssqlForm,
        connectionStatus: "Connection failed",
      });
    }
  };

  const handleImportData = async () => {
    if (!columnConfig) {
      setMssqlForm({
        ...mssqlForm,
        importStatus: "Column configuration is missing.",
      });
      return;
    }

    const importDataRequest = {
      dbConfig: {
        username: mssqlForm.username,
        password: mssqlForm.password,
        server: mssqlForm.serverName,
        databaseName: mssqlForm.databaseName,
        schemaName: mssqlForm.schemaName,
        tableName: mssqlForm.tableName,
      },
      options: {
        dropAndCreate: mssqlForm.dropAndCreate,
        deleteExistingData: mssqlForm.deleteExistingData,
        createIfNotExists: mssqlForm.createIfNotExists,
      },
      columnConfig,
    };

    try {
      const response = await axios.post("https://etl-latest.onrender.com/import-data-to-mssql", importDataRequest);
      setMssqlForm({
        ...mssqlForm,
        importStatus: `Import Successful: ${response.data.message}`,
      });
    } catch (error) {
      setMssqlForm({
        ...mssqlForm,
        importStatus: `Import Failed: ${error.response?.data?.detail || error.message}`,
      });
    }
  };

  return (
    <div className="mssqlMainContainer">
      <div className="mssqlConnectionForm">
        <h3 className="formHeader">Connection Form</h3>
        <input
          className="inputField"
          type="text"
          placeholder="Enter Server Name"
          name="serverName"
          value={mssqlForm.serverName}
          onChange={handleInputChange}
        />
        <input
          className="inputField"
          type="text"
          placeholder="Enter Username"
          name="username"
          value={mssqlForm.username}
          onChange={handleInputChange}
        />
        <input
          className="inputField"
          type="password"
          placeholder="Enter Password"
          name="password"
          value={mssqlForm.password}
          onChange={handleInputChange}
        />
        <button className="primaryButton" onClick={handleConnect}>
          Connect
        </button>
        {mssqlForm.connectionStatus && (
          <div className={`infoBox ${mssqlForm.connectionStatus.includes("failed") ? "error" : "success"}`}>
            {mssqlForm.connectionStatus}
          </div>
        )}
      </div>

      <div className="mssqlDetailForm">
        <h3 className="formHeader">MSSQL Details</h3>
        <label>Available Databases</label>
        <select
          className="selectField"
          name="databaseName"
          value={mssqlForm.databaseName}
          onChange={handleInputChange}
        >
          <option value="">Select Database</option>
          {mssqlForm.databases.map((db, index) => (
            <option key={index} value={db}>
              {db}
            </option>
          ))}
        </select>

        <input
          className="inputField"
          type="text"
          placeholder="Enter Table Name"
          name="tableName"
          value={mssqlForm.tableName}
          onChange={handleInputChange}
        />

<div className="checkboxContainer">
  <input
    type="checkbox"
    name="dropAndCreate"
    checked={mssqlForm.dropAndCreate}
    onChange={handleInputChange}
  />
  <label>Drop and Create Table</label>
</div>

<div className="checkboxContainer">
  <input
    type="checkbox"
    name="deleteExistingData"
    checked={mssqlForm.deleteExistingData}
    onChange={handleInputChange}
  />
  <label>Delete Existing Data</label>
</div>

<div className="checkboxContainer">
  <input
    type="checkbox"
    name="createIfNotExists"
    checked={mssqlForm.createIfNotExists}
    onChange={handleInputChange}
  />
  <label>Create If Not Exists</label>
</div>


        <button className="primaryButton" onClick={handleImportData}>
          Import Data
        </button>
        {mssqlForm.importStatus && (
          <div className={`infoBox ${mssqlForm.importStatus.includes("Failed") ? "error" : "success"}`}>
            {mssqlForm.importStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default ToMssqlDatabase;
