import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { NodeContext } from "../../context/NodeContext";
import { Columns3, FileOutput, FileSpreadsheet } from "lucide-react";
import { useDrag } from "react-dnd";

const DraggableOption = ({ option }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "BOX",
    item: {
      id: option.id,
      label: option.label,
      image: option.image,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      key={option.id}
      className={`sidebar-option ${isDragging ? "dragging" : ""}`}
    >
      <span>{option.icon}</span>
      <span>{option.label}</span>
    </div>
  );
};

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("");
  const sidebarRef = useRef(null); // Reference to the sidebar element

  const inputOptions = [
    {
      id: "excel",
      icon: <FileSpreadsheet />,
      image: "./excel.png",
      label: "Excel File",
    },
  ];

  const preparationOptions = [
    {
      id: "columns",
      icon: <Columns3 />,
      image: "./columns.png",
      label: "Columns",
    },
  ];

  const outputOptions = [
    {
      id: "mssql",
      icon:<FileOutput />,
      image: "./mssql.png",
      label: "MSSQL",
    },
  ];

  // Close the sidebar when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveTab(""); // Close the sidebar if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderSidebar = (options, title) => (
    <div className={`sidebar ${activeTab ? "active" : ""}`} ref={sidebarRef}>
      <div className="sidebar-header">{title}</div>
      <div className="sidebar-options">
        {options.map((option) => (
          <DraggableOption key={option.id} option={option} />
        ))}
      </div>
    </div>
  );

  return (
    <nav className="navMainContainer" onClick={() => setActiveTab("")}>
      <div className="navbar-container" onClick={(e) => e.stopPropagation()}>
        <div className="nav-buttons">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(activeTab === "inputs" ? "" : "inputs");
            }}
            className={`nav-button ${activeTab === "inputs" ? "active" : ""}`}
          >
            Inputs
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(activeTab === "preparations" ? "" : "preparations");
            }}
            className={`nav-button ${activeTab === "preparations" ? "active" : ""}`}
          >
            Preparation
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(activeTab === "outputs" ? "" : "outputs");
            }}
            className={`nav-button ${activeTab === "outputs" ? "active" : ""}`}
          >
            Outputs
          </button>

        </div>
       
      </div>

      {activeTab === "inputs" && renderSidebar(inputOptions, "Inputs")}
      {activeTab === "preparations" && renderSidebar(preparationOptions, "Preparation")}
      {activeTab === "outputs" && renderSidebar(outputOptions, "Outputs")}
      <div>
          <button className="nav-button reset" onClick={()=>{
            window.location.reload();
          }}>Reset</button>
        </div>
    </nav>
  );
};

export default Navbar;
