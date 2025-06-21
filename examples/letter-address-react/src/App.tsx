import React, { useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ControlBar } from '@/components/ControlBar'
import './index.css'

declare global {
  interface Window {
    reactControlBarComponent: any;
    jsPassCtrlBar: (component: any) => void;
    btnSwitchTab: (tab: string) => void;
    btnUploadFunc: () => void;
    btnReloadFunc: () => void;
    btnInsertFunc: () => void;
  }
}

const App: React.FC = () => {
  const controlBarRef = useRef<any>(null);

  useEffect(() => {
    // Store reference to this component globally so pre_soffice.js can access it
    window.reactControlBarComponent = controlBarRef.current;

    // Load config.js (optional)
    const configScript = document.createElement('script');
    configScript.src = './config.js';
    document.body.appendChild(configScript);

    // Load pre_soffice.js
    const preSofficeScript = document.createElement('script');
    preSofficeScript.type = 'module';
    preSofficeScript.src = './pre_soffice.js';
    preSofficeScript.onload = () => {
      console.log('pre_soffice.js loaded');
      // Try to connect the React component if it's available
      if (window.reactControlBarComponent && window.jsPassCtrlBar) {
        console.log('Connecting React component to pre_soffice.js');
        window.jsPassCtrlBar(window.reactControlBarComponent);
      }
    };
    document.body.appendChild(preSofficeScript);

    return () => {
      // Cleanup scripts on unmount
      document.body.removeChild(configScript);
      document.body.removeChild(preSofficeScript);
    };
  }, []);

  return (
    <div id="app" className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-0">
        <div className="mt-6 mb-4">
          <h1 className="text-3xl font-bold">ZetaJS: Letter Address React</h1>
        </div>
        
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="editor" id="btnLetter">
              Editor
            </TabsTrigger>
            <TabsTrigger value="addresses" id="btnTable">
              Addresses  
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-4 space-y-4 border border-border rounded-lg p-4">
            <ControlBar ref={controlBarRef} id="controlbar" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div id="canvasCell" className="lg:col-span-3">
                <div className="canvas-container relative">
                  <div id="loadingInfo" className="loading-info">
                    <div className="spinner"></div>
                    <h2 className="text-2xl font-semibold">ZetaOffice is loading...</h2>
                  </div>
                  <canvas
                    id="qtcanvas"
                    contentEditable="true"
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => e.preventDefault()}
                    style={{ width: '870px', height: '500px', visibility: 'hidden' }}
                    className="qt-canvas"
                  />
                </div>
              </div>
              
              <div id="controlCell" className="lg:col-span-1 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Document</h4>
                  <div className="space-y-2">
                    <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none" id="lblUpload">
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
                      onClick={() => window.btnInsertFunc?.()}
                      disabled
                    >
                      Insert Address
                    </button>
                  </div>
                  <select
                    className="flex h-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="addrName"
                    size={13}
                    autoFocus
                    disabled
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses" className="mt-4 border border-border rounded-lg p-4">
            <div id="canvasCell" className="w-full">
              <div className="canvas-container relative">
                <div id="loadingInfo" className="loading-info">
                  <div className="spinner"></div>
                  <h2 className="text-2xl font-semibold">ZetaOffice is loading...</h2>
                </div>
                <canvas
                  id="qtcanvas"
                  contentEditable="true"
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => e.preventDefault()}
                  style={{ width: '870px', height: '546px', visibility: 'hidden' }}
                  className="qt-canvas"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
