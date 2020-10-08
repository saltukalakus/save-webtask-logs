const SAVE_LOG_LOOP_QUICK = 100;  // Error and start up polling interval in msec
const CONF_OPTIONS_CHECK = 1000 * 3; // Polling interval in msec for configuration changes
const REFRESH_SCREEN_IN_MSEC = 1000 * 60 * 6;

var saveInMSec = 1000 * 60 * 1;
var refreshAfter = 5; // Refresh screen when reached to prevent Webtask log extenion to timeout.
var saveLogs = true; // Current state of log saving
var doOnce = false; // One time initializations
var saveButton = null;
var saveLogTimer = null;
var optionsTimer = null; //Extensions option polling
var startSavingLogs = true; //Flag to initiate log saving

function setOptionsTimer(value){
  optionsTimer ? clearTimeout(optionsTimer) : null;
  optionsTimer = setTimeout(optionsTimer, value);
}

function setSaveLogTimer(value){
  saveLogTimer ? clearTimeout(saveLogTimer) : null;
  saveLogTimer = setTimeout(saveLog, value);
}

function doOnceFn() {
  // App not loaded yet
  if (document.getElementsByClassName("content-header")[1] === "undefined") {
    return;
  }

  if (doOnce) return;

  // DOM magic to add the "Export log button"
  var contentHeader = document.getElementsByClassName("content-header")[1];
  saveButton = document.createElement("button");
  saveButton.className = "btn btn-default pull-right";
  saveButton.id = "saveLogButton";
  var text = document.createTextNode("STOP LOG EXPORT");
  saveButton.appendChild(text);
  contentHeader.appendChild(saveButton);

  // Button logic to start/stop saving logs
  saveButton.onclick = function (e) {
    saveLogs = !saveLogs;
    if (saveLogs) {
      document.getElementById("saveLogButton").innerHTML = "STOP SAVING LOGS";
      // quickly send the available logs
      setSaveLogTimer(SAVE_LOG_LOOP_QUICK); 
    } else {
      document.getElementById("saveLogButton").innerHTML = "START SAVING LOGS";
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
function saveLog() {

  // Schedule a repeat
  setSaveLogTimer(saveInMSec);

  // If saving logs is disabled skip rest of the actions
  if (!saveLogs) return;

  // Initialization of GUI and other stuff which needs to run once
  doOnceFn();

  // If the application isn't installed yet, wait for it to get ready
  if(typeof chrome.app.isInstalled === undefined  || 
     document.getElementsByClassName("wt-logs-list-container")[0] === undefined ||
     document.getElementsByClassName("wt-icon-261")[0] ===  undefined ){
      setSaveLogTimer(SAVE_LOG_LOOP_QUICK); 
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
    saveInSec: '60',
  }, function(items) {
    if (saveInMSec !==  Number(items.saveInSec) * 1000) {
      saveInMSec = Number(items.saveInSec) * 1000;
      setSaveLogTimer(saveInMSec);
    }

    // Tab refresh doesn't have a separate timer but uses file save events
    // With this line, we ensure that screen refresh every REFRESH_SCREEN_IN_MSEC
    refreshAfter = Math.ceil(REFRESH_SCREEN_IN_MSEC / saveInMSec);

    if (startSavingLogs) {
      saveLog();
      startSavingLogs = false;
    }
    setOptionsTimer(CONF_OPTIONS_CHECK);

  });
}

// Start the loop
console.log("SAVE WEBTASK LOGS START..");
readOptions()



