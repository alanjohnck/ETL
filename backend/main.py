from fastapi import FastAPI, UploadFile, Form
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

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
