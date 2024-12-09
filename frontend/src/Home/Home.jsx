import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Canvas from '../components/Canvas/Canvas';
import { NodeProvider } from '../context/NodeContext';
import "./Home.css";
import Sidebar from '../components/Sidebar/Sidebar';
import BottomBar from '../components/BottomBar/BottomBar';
import {  ExcelDataProvider } from '../context/ExcelDataContext';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
function Home() {
  return (
    <NodeProvider>
     <ExcelDataProvider >
      <DndProvider backend={HTML5Backend}>
      <div className='mainContainer'>
        <div className='topContainer'>
          <Navbar />
        </div>
        <div className='middleContainer'>
          <div className='sideBarContainer'>
             <Sidebar />
          </div>
          <div className='canvasContainer'>
            <Canvas />
            <div className='bottomContainer'>
               <BottomBar />
            </div>
          </div>
        </div>
      </div>
       </DndProvider>
      </ExcelDataProvider>
    </NodeProvider>
  );
}

export default Home;
