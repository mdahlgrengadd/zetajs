import "./index.css";

import React, { useEffect, useRef, useState } from "react";

import { ControlBar } from "@/components/ControlBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

declare global {
  interface Window {
    reactControlBarComponent: any;
    reactAppComponent: any;
    jsPassCtrlBar: (component: any) => void;
    btnSwitchTab: (tab: string) => void;
    btnUploadFunc: () => void;
    btnReloadFunc: () => void;
    btnInsertFunc: () => void;
  }
}

const App: React.FC = () => {
  const controlBarRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [addressData, setAddressData] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number>(-1);

  useEffect(() => {
    // Store reference to this component globally so pre_soffice.js can access it
    window.reactControlBarComponent = controlBarRef.current;

    // Store reference to the App component for address data updates
    window.reactAppComponent = {
      setAddressData,
      setSelectedAddress,
      addressData,
      selectedAddress,
    };

    // Only load scripts once
    if (!document.querySelector('script[src="./config.js"]')) {
      // Load config.js (optional)
      const configScript = document.createElement("script");
      configScript.src = "./config.js";
      document.body.appendChild(configScript);
    }

    if (!document.querySelector('script[src="./pre_soffice.js"]')) {
      // Load pre_soffice.js
      const preSofficeScript = document.createElement("script");
      preSofficeScript.type = "module";
      preSofficeScript.src = "./pre_soffice.js";
      preSofficeScript.onload = () => {
        console.log("pre_soffice.js loaded");
        // Try to connect the React component if it's available
        if (window.reactControlBarComponent && window.jsPassCtrlBar) {
          console.log("Connecting React component to pre_soffice.js");
          window.jsPassCtrlBar(window.reactControlBarComponent);
        }
      };
      document.body.appendChild(preSofficeScript);
    }

    return () => {
      // Cleanup on unmount - but don't remove scripts as they're shared
    };
  }, []); // Empty dependency array to run only once
  // Update the global reference when state changes
  useEffect(() => {
    if (window.reactAppComponent) {
      window.reactAppComponent.addressData = addressData;
      window.reactAppComponent.selectedAddress = selectedAddress;
    }
  }, [addressData, selectedAddress]);

  // Only set selectedAddress to 0 when we first get address data and no selection exists
  useEffect(() => {
    if (addressData.length > 0 && selectedAddress === -1) {
      setSelectedAddress(0);
    } else if (addressData.length === 0) {
      setSelectedAddress(-1);
    }
  }, [addressData.length]); // Only depend on length, not the entire array

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);

    // Call the global tab switch function
    if (window.btnSwitchTab) {
      const tabName = value === "editor" ? "letter" : "table";
      window.btnSwitchTab(tabName);
    }
  };

  const handleInsertAddress = () => {
    console.log("Insert address clicked, selectedAddress:", selectedAddress);
    if (window.btnInsertFunc) {
      window.btnInsertFunc();
    }
  };

  return (
    <div id="app" className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-0">
        <div className="mt-6 mb-4">
          <h1 className="text-3xl font-bold">ZetaJS: Letter Address React</h1>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="editor" id="btnLetter">
              Editor
            </TabsTrigger>
            <TabsTrigger value="addresses" id="btnTable">
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="editor"
            className="mt-4 space-y-4 border border-border rounded-lg p-4"
          >
            <ControlBar ref={controlBarRef} id="controlbar" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div id="canvasCell" className="lg:col-span-3">
                <div className="canvas-container relative">
                  <div id="loadingInfo" className="loading-info">
                    <div className="spinner"></div>
                    <h2 className="text-2xl font-semibold">
                      ZetaOffice is loading...
                    </h2>
                  </div>
                  <canvas
                    id="qtcanvas"
                    contentEditable="true"
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.preventDefault()}
                    style={{
                      width: "870px",
                      height: "500px",
                      visibility: "hidden",
                    }}
                    className="qt-canvas"
                  />
                </div>
              </div>

              <div id="controlCell" className="lg:col-span-1 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Document</h4>
                  <div className="space-y-2">
                    <label
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      id="lblUpload"
                    >
                      Upload new file
                      <input
                        accept=".odt"
                        className="file-input"
                        type="file"
                        id="btnUpload"
                        onChange={() => window.btnUploadFunc?.()}
                        disabled
                      />
                    </label>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 ml-2 disabled:opacity-50 disabled:pointer-events-none"
                      id="btnReload"
                      onClick={() => window.btnReloadFunc?.()}
                      disabled
                    >
                      Reload file
                    </button>
                  </div>
                </div>

                <div id="addrNameCell">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold">Recipient</h4>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3 disabled:opacity-50 disabled:pointer-events-none"
                      id="btnInsert"
                      onClick={handleInsertAddress}
                      disabled={
                        addressData.length === 0 ||
                        selectedAddress < 0 ||
                        selectedAddress >= addressData.length
                      }
                    >
                      Insert Address
                    </button>
                  </div>{" "}
                  <select
                    className="flex h-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="addrName"
                    size={13}
                    autoFocus
                    value={
                      selectedAddress >= 0 ? selectedAddress.toString() : ""
                    }
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        console.log(
                          "Address selection changed to index:",
                          value,
                          "name:",
                          addressData[value]?.[1]
                        );
                        setSelectedAddress(value);
                      }
                    }}
                    disabled={addressData.length === 0}
                  >
                    {" "}
                    {addressData.map((address, index) => (
                      <option key={index} value={index.toString()}>
                        {address[1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="addresses"
            className="mt-4 border border-border rounded-lg p-4"
          >
            <div id="canvasCell" className="w-full">
              <div className="canvas-container relative">
                <div id="loadingInfo-table" className="loading-info">
                  <div className="spinner"></div>
                  <h2 className="text-2xl font-semibold">
                    ZetaOffice is loading...
                  </h2>
                </div>
                <canvas
                  id="qtcanvas-table"
                  contentEditable="true"
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => e.preventDefault()}
                  style={{
                    width: "970px",
                    height: "546px",
                    visibility: "hidden",
                  }}
                  className="qt-canvas"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
