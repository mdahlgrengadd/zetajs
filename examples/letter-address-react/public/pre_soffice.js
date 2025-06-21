/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

import { ZetaHelperMain } from "./assets/vendor/zetajs/zetaHelper.js";

let tbDataJs; // toolbar dataset passed from React for plain JS

const loadingInfo = document.getElementById("loadingInfo");
const canvas = document.getElementById("qtcanvas");
const controlbar = document.getElementById("controlbar");
const controlCell = document.getElementById("controlCell");
const canvasCell = document.getElementById("canvasCell");
const lblUpload = document.getElementById("lblUpload");
const btnUpload = document.getElementById("btnUpload");
const btnReload = document.getElementById("btnReload");
const disabledElementsAry = [btnUpload, btnReload];
const canvas_height = parseInt(canvas.style.height);
const canvas_width = parseInt(canvas.style.width);

// IMPORTANT:
// Set base URL to the soffice.* files.
// Use an empty string if those files are in the same directory.
let wasmPkg;
try {
  wasmPkg = "url:" + config_soffice_base_url; // May fail. config.js is optional.
} catch {}
const zHM = new ZetaHelperMain("office_thread.js", {
  threadJsType: "module",
  wasmPkg,
});

// Functions stored below window.* are usually accessed from React.

window.jsPassCtrlBar = (pTbDataJs) => {
  // window....: make it accessible to React
  console.log("jsPassCtrlBar called with:", pTbDataJs);
  tbDataJs = pTbDataJs;
  disabledElementsAry.push(tbDataJs);
  console.log("tbDataJs set, disabled state:", tbDataJs.state?.disabled);
};

window.toggleFormatting = (id, value) => {
  // window....: make it accessible to React
  setToolbarActive(id, !tbDataJs.state.active[id]);
  zHM.thrPort.postMessage({ cmd: "toggleFormat", id, value });
  // Give focus to the LO canvas to avoid issues with
  // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
  // undone when clicking into non-empty document" when the user would need to click
  // into the canvas to give back focus to it:
  canvas.focus();
};

function setToolbarActive(id, value) {
  if (tbDataJs && tbDataJs.setState) {
    tbDataJs.setState((prevState) => ({
      ...prevState,
      active: {
        ...prevState.active,
        [id]: value,
      },
    }));
  }
}

window.btnDownloadFunc = (btnId) => {
  // window....: make it accessible to React
  zHM.thrPort.postMessage({ cmd: "download", id: btnId });
};

window.btnUploadFunc = () => {
  // window....: make it accessible to React
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload?.classList.add("disabled");
  const filename = "letter.odt";
  btnUpload.files[0].arrayBuffer().then((aryBuf) => {
    zHM.FS.writeFile("/tmp/" + filename, new Uint8Array(aryBuf));
    btnReloadFunc();
  });
};

window.btnReloadFunc = () => {
  // window....: make it accessible to React
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload?.classList.add("disabled");
  if (loadingInfo) loadingInfo.style.display = null;
  if (canvas) canvas.style.visibility = "hidden";
  zHM.thrPort.postMessage({ cmd: "reload", id: true });
};

async function getDataFile(file_url) {
  const response = await fetch(file_url);
  return response.arrayBuffer();
}

zHM.start(() => {
  zHM.thrPort.onmessage = (e) => {
    switch (e.data.cmd) {
      case "ui_ready":
        console.log("UI ready event received");
        // Trigger resize of the embedded window to match the canvas size.
        // May somewhen be obsoleted by:
        //   https://gerrit.libreoffice.org/c/core/+/174040
        window.dispatchEvent(new Event("resize"));
        setTimeout(() => {
          // display Office UI properly
          console.log("Enabling toolbar and UI elements"); // Handle loading info and canvas visibility - word editor only
          const currentCanvas = document.getElementById("qtcanvas");
          const currentLoading = document.getElementById("loadingInfo");

          if (currentLoading) currentLoading.style.display = "none";
          if (currentCanvas) currentCanvas.style.visibility = null;

          if (tbDataJs && tbDataJs.setState) {
            tbDataJs.setState((prevState) => ({
              ...prevState,
              font_name_list: e.data.fontsList,
              disabled: false,
            }));
            console.log("Toolbar enabled, font list:", e.data.fontsList);
          } else {
            console.error(
              "tbDataJs is not set! React component may not be connected properly."
            );
          }
          for (const elem of disabledElementsAry) {
            if (elem) elem.disabled = false;
          }
          lblUpload?.classList.remove("disabled");
          // Remove btnInsert reference since we removed address functionality
          console.log("All UI elements enabled");
        }, 1000); // milliseconds
        break;
      case "resizeEvt":
        window.dispatchEvent(new Event("resize"));
        break;
      case "setFormat":
        setToolbarActive(e.data.id, e.data.state);
        break;
      case "download":
        const bytes = zHM.FS.readFile("/tmp/output");
        const format = e.data.id === "btnOdt" ? "odt" : "pdf";
        const blob = new Blob([bytes], { type: "application/" + format });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "letter." + format;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        break;
      default:
        throw Error("Unknown message command: " + e.data.cmd);
    }
  };
  getDataFile("./letter.odt").then((aryBuf) => {
    zHM.FS.writeFile("/tmp/letter.odt", new Uint8Array(aryBuf));
  });
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
