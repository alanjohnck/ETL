import React, { useState } from 'react';
import axios from 'axios';
import "./ToMsqlDatabase.css";

function ToMsqlDatabase() {
  const [serverName, setServerName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [databases, setDatabases] = useState([]);

  // Function to handle the connection form submission
  const handleConnect = async () => {
    try {
      const response = await axios.post('http://localhost:8000/check-mssql-connection', {
        username,
        password,
        serverName
      });

      if (response.data.connectionStatus === 'success') {
        setConnectionStatus('Connected successfully');
        setDatabases(response.data.databases);
      }
    } catch (error) {
      setConnectionStatus(`Connection failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className='mssqlMainContainer'>
      <div className='mssqlConnectionForm'>
        <div className='mssqlConnectionFormHeader'>
          <h3>Connection Form</h3>
        </div>
        <div className='mssqlConnectionFormBody'>
          <div className='mssqlConnectionFormBodyItem'>
            <input 
              type='text' 
              placeholder='Enter Server Name' 
              value={serverName} 
              onChange={(e) => setServerName(e.target.value)} 
            />
          </div>
          <div className='mssqlConnectionFormBodyItem'>
            <input 
              type='text' 
              placeholder='Enter Username' 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className='mssqlConnectionFormBodyItem'>
            <input 
              type='password' 
              placeholder='Enter Password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div className='mssqlConnectionFormBodyItem'>
            <button onClick={handleConnect}>Connect</button>
          </div>
        </div>
      </div>

      <div className='mssqlConnectionStatus'>
        {connectionStatus && <p>{connectionStatus}</p>}
      </div>

      <div className='mssqlDatabases'>
        <h4>Available Databases</h4>
        <ul>
          {databases.map((db, index) => (
            <li key={index}>{db}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ToMsqlDatabase;
