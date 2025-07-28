import React from "react";

export function TestComponent() {
  return (
    <div className="test-container" style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "20px", 
      padding: "40px",
      backgroundColor: "#f5f5f5",
      minHeight: "100vh"
    }}>
      {/* Header Section */}
      <div className="header-section" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: "bold", 
          color: "#333333",
          margin: "0"
        }}>
          Extension Test Component
        </h1>
        <button style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Test Button
        </button>
      </div>

      {/* 3x3 Grid Container */}
      <div className="grid-container" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "16px",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        
        {/* Grid Item 1 - Top Left */}
        <div className="grid-item-1" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#ff6b6b",
          borderRadius: "8px",
          color: "white",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Item 1</h3>
          <p style={{ margin: "0", fontSize: "14px" }}>Top Left</p>
        </div>

        {/* Grid Item 2 - Top Center */}
        <div className="grid-item-2" style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#4ecdc4",
          borderRadius: "8px",
          color: "white"
        }}>
          <span style={{ fontSize: "14px" }}>Left</span>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>Item 2</span>
          <span style={{ fontSize: "14px" }}>Right</span>
        </div>

        {/* Grid Item 3 - Top Right */}
        <div className="grid-item-3" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          padding: "20px",
          backgroundColor: "#45b7d1",
          borderRadius: "8px",
          color: "white"
        }}>
          <div style={{ fontSize: "12px", marginBottom: "8px" }}>Top Right</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>Item 3</div>
        </div>

        {/* Grid Item 4 - Middle Left */}
        <div className="grid-item-4" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          padding: "20px",
          backgroundColor: "#96ceb4",
          borderRadius: "8px",
          color: "white",
          minHeight: "120px"
        }}>
          <div style={{ fontSize: "14px", textAlign: "center" }}>Top</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", textAlign: "center" }}>Item 4</div>
          <div style={{ fontSize: "14px", textAlign: "center" }}>Bottom</div>
        </div>

        {/* Grid Item 5 - Center */}
        <div className="grid-item-5" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
          backgroundColor: "#feca57",
          borderRadius: "8px",
          color: "#333333",
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>Center</h2>
          <p style={{ margin: "0", fontSize: "14px" }}>Main Item</p>
          <div style={{ 
            marginTop: "10px", 
            padding: "8px", 
            backgroundColor: "rgba(255,255,255,0.3)", 
            borderRadius: "4px",
            fontSize: "12px"
          }}>
            Highlighted
          </div>
        </div>

        {/* Grid Item 6 - Middle Right */}
        <div className="grid-item-6" style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#ff9ff3",
          borderRadius: "8px",
          color: "white",
          gap: "10px"
        }}>
          <span style={{ fontSize: "14px" }}>←</span>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>Item 6</span>
          <span style={{ fontSize: "14px" }}>→</span>
        </div>

        {/* Grid Item 7 - Bottom Left */}
        <div className="grid-item-7" style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#54a0ff",
          borderRadius: "8px",
          color: "white",
          gap: "8px"
        }}>
          <div style={{ 
            width: "12px", 
            height: "12px", 
            backgroundColor: "white", 
            borderRadius: "50%" 
          }}></div>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>Item 7</span>
        </div>

        {/* Grid Item 8 - Bottom Center */}
        <div className="grid-item-8" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#5f27cd",
          borderRadius: "8px",
          color: "white",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "14px", marginBottom: "8px" }}>Bottom Center</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>Item 8</div>
        </div>

        {/* Grid Item 9 - Bottom Right */}
        <div className="grid-item-9" style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#ff6348",
          borderRadius: "8px",
          color: "white"
        }}>
          <span style={{ fontSize: "12px" }}>BL</span>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>Item 9</span>
          <span style={{ fontSize: "12px" }}>BR</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="footer-section" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <p style={{ 
          margin: "0", 
          color: "#666666", 
          fontSize: "14px",
          textAlign: "center"
        }}>
          Use the Chrome extension to modify any of these elements!
        </p>
      </div>
    </div>
  );
} 