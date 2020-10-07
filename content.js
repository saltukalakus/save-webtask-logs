const TRANSFER_LOOP_QUICK = 100  // Error and start up polling interval in msec
const CONF_OPTIONS_CHECK = 1000*3 // Polling interval in msec for configuration changes

var delayExportInMSec = 1000*60*1; // Delay before saving the next logs in msec
var refreshAfter = 5; // Refresh screen when reached to prevent Webtask log extenion to timeout.
var exportLogs = true; // State of log export
var doOnce = false; // One time initializations
var exportButton = null; //Export logs button
var transferLogTimer = null; //Transfer log timer for polling
var optionsTimer = null; //Extensions option polling
var startTransferLog = true; //Flag to initiate log transfell polling

function setOptionsTimer(value){
  optionsTimer ? clearTimeout(optionsTimer) : null;
  optionsTimer = setTimeout(transferLog, value);
}

function setTransferLogTimer(value){
  transferLogTimer ? clearTimeout(transferLogTimer) : null;
  transferLogTimer = setTimeout(transferLog, value);
}

function doOnceFn() {
  // App not loaded yet
  if (document.getElementsByClassName("content-header")[1] === "undefined") {
    return;
  }

  if (doOnce) return;

  // DOM magic to add the "Export log button"
  var contentHeader = document.getElementsByClassName("content-header")[1];
  exportButton = document.createElement("button");
  exportButton.className = "btn btn-default pull-right";
  exportButton.id = "exportLogButton";
  var text = document.createTextNode("STOP LOG EXPORT");
  exportButton.appendChild(text);
  contentHeader.appendChild(exportButton);

  // Button logic to start/stop saving logs
  exportButton.onclick = function (e) {
    exportLogs = !exportLogs;
    if (exportLogs) {
      document.getElementById("exportLogButton").innerHTML = "STOP LOG EXPORT";
      // quickly send the available logs
      setTransferLogTimer(TRANSFER_LOOP_QUICK); 
    } else {
      document.getElementById("exportLogButton").innerHTML = "START LOG EXPORT";
    }
  }

  doOnce = true;
}

// Convert HTLM logs to text based logs
function converToTXT(htmlLogs) {
  try {
    var txtLogs = htmlLogs.replace(/<div class="wt-logs-item ">/g,'\r\n\r\n')
    .replace(/<div class="wt-logs-item-time">/g,'')
    .replace(/<div class="wt-logs-item wt-logs-connected">/g, '')
    .replace(/<!-- [/]react-text -->/g, '')
    .replace(/<div class="wt-logs-item-description">/g, '')
    .replace(/<!-- react-text:(.*?)-->/g, '')
    .replace(/<[/]div>/g, '')
    .replace(/<span>/g, '')
    .replace(/<[/]span>/g, '')
    .replace(/&nbsp;/g, '');
  }
  catch (problem){
    console.log(problem);
    // Incase conversion fails make sure we log the Html version
    txtLogs = htmlLogs;
  }
  return txtLogs;
}

// Grab the logs from screen and send to background job
function transferLog() {

  // Schedule a repeat
  setTransferLogTimer(delayExportInMSec);

  // If export logs is disabled skip rest of the actions
  if (!exportLogs) return;

  // Initialization of GUI and other stuff which needs to run once
  doOnceFn();

  // If the application isn't installed yet, wait for it to get ready
  if(typeof chrome.app.isInstalled === undefined  || 
     document.getElementsByClassName("wt-logs-list-container")[0] === undefined ||
     document.getElementsByClassName("wt-icon-261")[0] ===  undefined ){
      setTransferLogTimer(TRANSFER_LOOP_QUICK); 
      return;
  }

  // Read the logs from HTML
  var htmlLogs = document.getElementsByClassName("wt-logs-list-container")[0].innerHTML.toString();

  // Clear the logs by clicking the extension's clear button
  document.getElementsByClassName("wt-icon-261")[0].click();

  // Convert logs to a human readable version
  var txtLogs = converToTXT(htmlLogs);

  // Store the logs in the Blob
  var blob = new Blob( [txtLogs], {type: "text/plain"});
  var url = URL.createObjectURL(blob);

  // Send the blob to background job
  console.log("Send blob: " + url + " blob_size: " + blob.size);
  chrome.runtime.sendMessage({"blob": url, "blob_size": blob.size, "refresh_after": refreshAfter});
};

function readOptions() {
  chrome.storage.sync.get({
    exportTime: '60',
    refreshAfter: '5',
  }, function(items) {
    if (delayExportInMSec !==  Number(items.exportTime) * 1000) {
      delayExportInMSec = Number(items.exportTime) * 1000;
      setTransferLogTimer(delayExportInMSec);
    }

    refreshAfter !== Number(items.refreshAfter) ? refreshAfter = Number(items.refreshAfter) : null;

    if (startTransferLog) {
      transferLog();
      startTransferLog = false;
    }
    setOptionsTimer(CONF_OPTIONS_CHECK);

  });
}

// Start the loop
readOptions()



