/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

import { ZetaHelperMain } from "./assets/vendor/zetajs/zetaHelper.js";

let tbDataJs; // toolbar dataset passed from vue.js for plain JS
let letterForeground = true;
let data = [];

const loadingInfo = document.getElementById("loadingInfo");
const canvas = document.getElementById("qtcanvas");
const controlbar = document.getElementById("controlbar");
const controlCell = document.getElementById("controlCell");
const addrNameCell = document.getElementById("addrNameCell");
const canvasCell = document.getElementById("canvasCell");
const btnLetter = document.getElementById("btnLetter");
const btnTable = document.getElementById("btnTable");
const lblUpload = document.getElementById("lblUpload");
const btnUpload = document.getElementById("btnUpload");
const btnReload = document.getElementById("btnReload");
const btnInsert = document.getElementById("btnInsert");
const addrName = document.getElementById("addrName");
const disabledElementsAry = [
  btnLetter,
  btnTable,
  btnUpload,
  btnReload,
  btnInsert,
  addrName,
];
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

// Functions stored below window.* are usually accessed from vue.js.

window.jsPassCtrlBar = (pTbDataJs) => {
  // window....: make it accessible to vue.js
  console.log("jsPassCtrlBar called with:", pTbDataJs);
  tbDataJs = pTbDataJs;
  disabledElementsAry.push(tbDataJs);
  console.log("tbDataJs set, disabled state:", tbDataJs.disabled);
};

window.toggleFormatting = (id, value) => {
  // window....: make it accessible to vue.js
  setToolbarActive(id, !tbDataJs.active[id]);
  zHM.thrPort.postMessage({ cmd: "toggleFormat", id, value });
  // Give focus to the LO canvas to avoid issues with
  // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
  // undone when clicking into non-empty document" when the user would need to click
  // into the canvas to give back focus to it:
  canvas.focus();
};

function setToolbarActive(id, value) {
  tbDataJs.active[id] = value;
  // Need to set "active" on "tbDataJs" to trigger an UI update.
  tbDataJs.active = tbDataJs.active;
}

window.btnSwitchTab = (tab) => {
  // window....: make it accessible to vue.js
  if (tab === "letter") {
    letterForeground = true;
    btnLetter.classList.add("active");
    btnTable.classList.remove("active");
    controlbar.style.display = null;
    btnUpload.accept = ".odt";
    lblUpload.classList.remove("btn-primary");
    lblUpload.classList.add("btn-light");
    btnInsert.disabled = false;
    addrNameCell.style.display = null;
    addrName.style.visibility = null;
    btnReload.classList.remove("mt-2");
    btnReload.classList.add("ms-2");
    canvasCell.classList.remove("col-lg-10");
    canvasCell.classList.add("col-lg-9");
    controlCell.classList.remove("col-lg-2");
    controlCell.classList.add("col-lg-3");
    canvas.style.height = canvas_height + "px";
    canvas.style.width = canvas_width + "px";
  } else {
    // table
    letterForeground = false;
    btnLetter.classList.remove("active");
    btnTable.classList.add("active");
    controlbar.style.display = "none";
    btnUpload.accept = ".ods";
    lblUpload.classList.add("btn-primary");
    lblUpload.classList.remove("btn-light");
    btnInsert.disabled = true;
    addrNameCell.style.display = "none";
    addrName.style.visibility = "hidden";
    btnReload.classList.remove("ms-2");
    btnReload.classList.add("mt-2");
    canvasCell.classList.remove("col-lg-9");
    canvasCell.classList.add("col-lg-10");
    controlCell.classList.remove("col-lg-3");
    controlCell.classList.add("col-lg-2");
    canvas.style.height = canvas_height + 46 + "px";
    canvas.style.width = canvas_width + 100 + "px";
  }
  zHM.thrPort.postMessage({ cmd: "switch_tab", id: tab });
};

window.btnDownloadFunc = (btnId) => {
  // window....: make it accessible to vue.js
  zHM.thrPort.postMessage({ cmd: "download", id: btnId });
};

window.btnUploadFunc = () => {
  // window....: make it accessible to vue.js
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload.classList.add("disabled");
  const filename = letterForeground ? "letter.odt" : "table.ods";
  btnUpload.files[0].arrayBuffer().then((aryBuf) => {
    FS.writeFile("/tmp/" + filename, new Uint8Array(aryBuf));
    btnReloadFunc();
  });
};

window.btnReloadFunc = () => {
  // window....: make it accessible to vue.js
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload.classList.add("disabled");
  loadingInfo.style.display = null;
  canvas.style.visibility = "hidden";
  zHM.thrPort.postMessage({ cmd: "reload", id: letterForeground });
};

window.btnInsertFunc = () => {
  // window....: make it accessible to vue.js
  if (addrName.selectedIndex != -1) {
    const recipient = data[addrName.selectedIndex];
    zHM.thrPort.postMessage({ cmd: "insertAddress", recipient });
  }
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
          console.log("Enabling toolbar and UI elements");
          loadingInfo.style.display = "none";
          canvas.style.visibility = null;
          if (tbDataJs) {
            tbDataJs.font_name_list = e.data.fontsList;
            tbDataJs.disabled = false;
            console.log("Toolbar enabled, font list:", e.data.fontsList);
          } else {
            console.error(
              "tbDataJs is not set! Vue component may not be connected properly."
            );
          }
          for (const elem of disabledElementsAry) elem.disabled = false;
          lblUpload.classList.remove("disabled");
          btnInsert.disabled = !letterForeground;
          console.log("All UI elements enabled");
        }, 1000); // milliseconds
        break;
      case "resizeEvt":
        window.dispatchEvent(new Event("resize"));
        break;
      case "addrData":
        data = e.data.data;
        addrName.innerHTML = "";
        for (const recipient of data) {
          const option = document.createElement("option");
          option.innerHTML = recipient[1];
          addrName.appendChild(option);
        }
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
  getDataFile("./table.ods").then((aryBuf) => {
    zHM.FS.writeFile("/tmp/table.ods", new Uint8Array(aryBuf));
  });
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
