from fastapi import FastAPI, UploadFile, Form, HTTPException
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import sqlalchemy as sa

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