from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sqlalchemy as sa
from sqlalchemy import create_engine, types, inspect
from typing import Dict, Optional, List, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage for uploaded data
uploaded_data = []

class ExcelDataChunk(BaseModel):
    data: List[List[Any]]

class DbConfig(BaseModel):
    username: str
    password: str
    server: str
    databaseName: str
    schemaName: str
    tableName: str

class Options(BaseModel):
    dropAndCreate: bool
    deleteExistingData: bool
    createIfNotExists: bool

class ColumnType(BaseModel):
    header: str
    userSelected: str
    mssqlType: str

class ImportDataRequest(BaseModel):
    dbConfig: DbConfig
    options: Options
    columnConfig: List[Dict[str, str]]

@app.post("/check-mssql-connection")
def connect_to_sql_server(request: dict):
    username = request.get("username")
    password = request.get("password")
    server_name = request.get("serverName")
    
    # Connection string
    conn_string = f"mssql+pyodbc://{username}:{password}@{server_name}/master?driver=ODBC+Driver+17+for+SQL+Server"

    # Create the engine
    engine = sa.create_engine(conn_string)

    try:
        # Test the connection
        with engine.connect() as conn:
            # Get a list of databases
            result = conn.execute(sa.text("SELECT name FROM sys.databases"))
            databases = [row[0] for row in result]

        return {
            "connectionStatus": "success",
            "databases": databases
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    

uploaded_data = []  # Temporary storage for uploaded data

# Define request models
class ExcelDataChunk(BaseModel):
    data: List[List[Any]]

class DbConfig(BaseModel):
    username: str
    password: str
    server: str
    databaseName: str
    schemaName: str
    tableName: str

class Options(BaseModel):
    dropAndCreate: bool
    deleteExistingData: bool
    createIfNotExists: bool

class ColumnConfigItem(BaseModel):
    header: str
    userSelected: str
    mssqlType: str

class ImportDataRequest(BaseModel):
    dbConfig: DbConfig
    options: Options
    columnConfig: List[Dict[str, str]]

# Function to get SQLAlchemy data type based on MSSQL type
def get_sqlalchemy_type(mssql_type: str):
    type_mapping = {
        'VARCHAR(MAX)': types.Text,
        'INT': types.Integer,
        'DECIMAL': types.DECIMAL,
        'FLOAT': types.Float,
        'DATE': types.Date,
        'DATETIME': types.DateTime,
        'BIT': types.Boolean,
    }
    
    # Handle VARCHAR with specific length
    if mssql_type.startswith('VARCHAR(') and mssql_type != 'VARCHAR(MAX)':
        length = int(mssql_type[8:-1])
        return types.String(length=length)
    
    # Default to Text type
    return type_mapping.get(mssql_type, types.Text)

@app.post("/import-data-to-mssql")
async def import_data(request: ImportDataRequest):
    try:
        # Ensure data is uploaded
        if not uploaded_data:
            raise HTTPException(status_code=400, detail="No data has been uploaded")
        
        # Convert uploaded data to DataFrame, skip header row
        df = pd.DataFrame(uploaded_data[1:], columns=[col['header'].strip() for col in request.columnConfig])
        
        # Data Cleaning
        for config in request.columnConfig:
            header = config['header'].strip()
            userSelectedType = config['userSelected']
            mssqlType = config['mssqlType']
            
            # Convert numeric columns to appropriate types
            if userSelectedType in ['Integer', 'Double']:
                df[header] = pd.to_numeric(df[header], errors='coerce')
            elif userSelectedType == 'Boolean':
                df[header] = df[header].map({'True': True, 'False': False, '1': True, '0': False}).astype(bool)
        
        # Handle Year column as an example of Integer conversion
        if 'Year' in df.columns:
            df['Year'] = pd.to_numeric(df['Year'], errors='coerce')  # Convert Year to numeric
            df.dropna(subset=['Year'], inplace=True)  # Drop rows where Year is NaN
            df['Year'] = df['Year'].astype(int)  # Convert back to integer
        
        # Create column mapping for SQLAlchemy
        column_types = {config['header'].strip(): get_sqlalchemy_type(config['mssqlType']) for config in request.columnConfig}

        # Connection string for MSSQL
        conn_string = (
            f"mssql+pyodbc://{request.dbConfig.username}:{request.dbConfig.password}"
            f"@{request.dbConfig.server}/{request.dbConfig.databaseName}?driver=ODBC+Driver+17+for+SQL+Server"
        )
        
        # Initialize SQLAlchemy engine
        engine = create_engine(conn_string)
        
        # Determine behavior based on options
        if_exists = 'fail'
        if request.options.dropAndCreate:
            if_exists = 'replace'
        elif request.options.deleteExistingData:
            with engine.connect() as connection:
                connection.execute(sa.text(
                    f"DELETE FROM {request.dbConfig.schemaName}.{request.dbConfig.tableName}"
                ))
            if_exists = 'append'
        elif request.options.createIfNotExists:
            if_exists = 'append'
        
        # Print debug information
        print("DataFrame before uploading:")
        print(df.head())
        print("Column types mapping:", column_types)
        
        # Upload DataFrame to MSSQL table
        df.to_sql(
            name=request.dbConfig.tableName,
            con=engine,
            if_exists=if_exists,
            index=False,
            schema=request.dbConfig.schemaName,
            dtype=column_types
        )
        
        # Return success response
        return {
            "status": "success",
            "message": f"Successfully imported {len(df)} rows",
            "details": {
                "table": request.dbConfig.tableName,
                "schema": request.dbConfig.schemaName,
                "database": request.dbConfig.databaseName,
                "columns": list(column_types.keys())
            }
        }
        
    except Exception as e:
        # Detailed error logging
        print("Error details:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/upload-excel-chunk")
async def upload_excel_chunk(chunk: ExcelDataChunk):
    try:
        uploaded_data.extend(chunk.data)
        return {
            "status": "success",
            "message": f"Received chunk with {len(chunk.data)} rows.",
            "total_rows": len(uploaded_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear-data")
async def clear_data():
    global uploaded_data
    uploaded_data = []
    return {"status": "success", "message": "Data cleared successfully"}

@app.get("/get-uploaded-data")
async def get_uploaded_data():
    return {"uploaded_data": uploaded_data}
