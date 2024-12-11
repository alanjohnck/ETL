// FileUpload.js
import React, { useState } from "react";
import Home from "./Home/Home";
import { Toaster,toast } from "sonner";

function App() {
 return(
    <div>
      
      <Toaster position="top-right" />
      <Home /> 
    </div>
 );

}

export default App;
