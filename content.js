const DELAY_EXPORT_IN_MSEC = 1000*60*1; // Delay before saving the next logs
const DELAY_EXPORT_IN_MSEC_QUICK = 100  // In case of an error or app not initialized 
var exportLogs = true; // State of log export
var doOnce = false; // One time initializations
var exportButton = null; //Export logs button
var eventLoopTimer = null; //Event loop timer

function setEventLoopTimer(value){
  eventLoopTimer ? clearTimeout(eventLoopTimer) : null;
  eventLoopTimer = setTimeout(transferLog, value);
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
      setEventLoopTimer(DELAY_EXPORT_IN_MSEC_QUICK); 
    } else {
      document.getElementById("exportLogButton").innerHTML = "START LOG EXPORT";
    }
  }

  doOnce = true;
}

// Convert HTLM logs to txt logs
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
  setEventLoopTimer(DELAY_EXPORT_IN_MSEC);

  // If export logs is disabled skip rest of the actions
  if (!exportLogs) return;

  // Initialization of GUI and other stuff which needs to run once
  doOnceFn();

  // If the application isn't installed yet, wait for it to get ready
  if(typeof chrome.app.isInstalled === undefined  || 
     document.getElementsByClassName("wt-logs-list-container")[0] === undefined ||
     document.getElementsByClassName("wt-icon-261")[0] ===  undefined ){
      setEventLoopTimer(DELAY_EXPORT_IN_MSEC_QUICK); 
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
  chrome.runtime.sendMessage({"blob": url, "blob_size": blob.size});
};

// Start the event loop to send the logs to file
transferLog();

