from fastapi import FastAPI, UploadFile, Form, HTTPException
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import sqlalchemy as sa
from typing import Dict, Optional
from sqlalchemy import create_engine, types, inspect

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
class ExcelData(BaseModel):
    file: bytes
    sheet_name: str

@app.post("/upload-excel")
async def upload_excel(file: UploadFile, sheet_name: str = Form(...)):
    # Read the Excel file from the request
    df = pd.read_excel(await file.read(), sheet_name=sheet_name)

    # Get the first 10 rows and the header
    header = list(df.columns)
    rows = df.head(10).to_dict('records')

    return {
        "header": header,
        "rows": rows
    }

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
    
    







class DatabaseConfig(BaseModel):
    server: str = "localhost\\SQLEXPRESS"
    database_name: str
    username: str
    password: str
    schema_name: str = "dbo"
    table_name: str
    create_if_not_exists: bool = True  # Matches "Create Table If Not Exist" checkbox
    drop_and_create: bool = False      # Matches "Drop Table Then Create" checkbox
    delete_existing_data: bool = False  # Matches "Delete Existing Data" checkbox

class ColumnConfig(BaseModel):
    type: str
    params: Optional[Dict] = None

class ImportDataRequest(BaseModel):
    db_config: DatabaseConfig
    column_config: Dict[str, ColumnConfig]

def get_sqlalchemy_type(column_type: ColumnConfig):
    type_mapping = {
        "INTEGER": types.INTEGER,
        "VARCHAR": types.VARCHAR,
        "DECIMAL": types.DECIMAL,
        "FLOAT": types.FLOAT,
        "DATE": types.DATE,
        "DATETIME": types.DATETIME,
        "BOOLEAN": types.BOOLEAN,
        "TEXT": types.TEXT
    }
    try:
        if column_type.params:
            return type_mapping[column_type.type](**column_type.params)
        else:
            return type_mapping[column_type.type]()
    except TypeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameters for type {column_type.type}: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating SQLAlchemy type: {e}")

def table_exists(engine, schema, table):
    inspector = inspect(engine)
    return table in inspector.get_table_names(schema=schema)

@app.post("/import-data-to-mssql/")
async def import_data(request: ImportDataRequest):
    engine = None
    try:
        sqlalchemy_types = {col: get_sqlalchemy_type(request.column_config[col]) for col in request.column_config}
        data = pd.read_csv("exp3.csv")   #this csv
        data = data[list(request.column_config.keys())]
        
        conn_string = (
            f"mssql+pyodbc://{request.db_config.username}:{request.db_config.password}"
            f"@{request.db_config.server}/{request.db_config.database_name}?"
            "driver=ODBC+Driver+17+for+SQL+Server"
        )
        engine = create_engine(conn_string)
        
        # Determine if_exists behavior based on config options
        if_exists = 'fail'  # default behavior
        
        table_check = table_exists(engine, request.db_config.schema_name, request.db_config.table_name)
        
        if table_check:
            if request.db_config.drop_and_create:
                if_exists = 'replace'
            elif request.db_config.delete_existing_data:
                # Delete existing data but keep the table structure
                with engine.connect() as connection:
                    connection.execute(f"DELETE FROM {request.db_config.schema_name}.{request.db_config.table_name}")
                if_exists = 'append'
            elif request.db_config.create_if_not_exists:
                if_exists = 'append'
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Table already exists and no action specified"
                )
        else:
            if request.db_config.create_if_not_exists:
                if_exists = 'replace'  # Will create new table
            else:
                raise HTTPException(
                    status_code=404,
                    detail="Table does not exist and create_if_not_exists is False"
                )
        
        data.to_sql(
            name=request.db_config.table_name,
            con=engine,
            if_exists=if_exists,
            index=False,
            schema=request.db_config.schema_name,
            dtype=sqlalchemy_types
        )
        
        return {
            "status": "success",
            "message": f"Imported {len(data)} rows to {request.db_config.table_name}",
            "details": {
                "server": request.db_config.server,
                "database": request.db_config.database_name,
                "schema": request.db_config.schema_name,
                "table": request.db_config.table_name,
                "action_taken": if_exists,
                "columns": {col: str(sqlalchemy_types[col]) for col in request.column_config}
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if engine is not None:
            engine.dispose()    