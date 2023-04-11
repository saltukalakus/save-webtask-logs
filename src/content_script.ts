let saveInMSec = 1000 * 15;
let saveLogs = true; // Current state of log saving
let setup = false; // One time initializations
let saveLogTimer: ReturnType<typeof setTimeout> | null = null;
let optionsTimer: ReturnType<typeof setTimeout> | null = null; //Extensions option polling
let startSavingLogs = true; //Flag to initiate log saving
let allLogs = '';

function setOptionsTimer(timeout: number) {
  optionsTimer && clearTimeout(optionsTimer);
  optionsTimer = setTimeout(readOptions, timeout);
}

function setSaveLogTimer(timeout: number) {
  saveLogTimer && clearTimeout(saveLogTimer);
  saveLogTimer = setTimeout(saveLog, timeout);
}

function doSetup() {
  // App not loaded yet
  const contentHeaders = document.getElementsByClassName('content-header');
  if (contentHeaders.length < 2) {
    return;
  }

  if (setup) {
    return;
  }

  // Clear allLogs
  allLogs = '';

  // DOM magic to add the "Export log button"
  const contentHeader = contentHeaders[1];
  const saveButton = document.createElement('button');
  saveButton.className = 'btn btn-default pull-right';
  saveButton.id = 'saveLogButton';
  saveButton.textContent = 'STOP LOG EXPORT';
  contentHeader.appendChild(saveButton);

  // Button logic to start/stop saving logs
  saveButton.onclick = function (e) {
    saveLogs = !saveLogs;
    if (saveLogs) {
      saveButton.textContent = 'STOP SAVING LOGS';
      // quickly send the available logs
      setSaveLogTimer(100);
    } else {
      saveButton.textContent = 'START SAVING LOGS';
    }
  };

  setup = true;
}

function cleanText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }

  return text.replace(/^<!--.*-->$/g, '');
}

// Convert HTML logs to text based logs
function convertToTXT(logItems: Element[]) {
  try {
    return logItems
      .map((el) => {
        const timeEl = el.querySelector('.wt-logs-item-time');
        const time = cleanText(timeEl?.textContent);

        const logEl = el.querySelector('.wt-logs-item-description span');
        const log = cleanText(logEl?.textContent);

        return `${time} ${log}`;
      })
      .join('\n');
  } catch (error) {
    console.error('Error while parsing the html logs', error);
  }

  return logItems
    .map((el) => el.textContent)
    .filter(Boolean)
    .join('\n');
}

// Grab the logs from screen and send to background job
function saveLog() {
  // Schedule a repeat
  setSaveLogTimer(saveInMSec);

  // If saving logs is disabled skip rest of the actions
  if (!saveLogs) {
    return;
  }

  // Initialization of GUI and other stuff which needs to run once
  doSetup();

  const logListContainer = document.querySelector('.wt-logs-list-container');
  const clearLogsBtn =
    document.querySelector<HTMLButtonElement>('.wt-icon-261');

  // If the application isn't installed yet, wait for it to get ready
  if (!logListContainer || !clearLogsBtn) {
    console.warn('Missing the log list or clear logs btn');
    setSaveLogTimer(100);
    return;
  }

  // Read the logs from HTML
  const logItems = logListContainer.querySelectorAll(
    '.wt-logs-item:not(.wt-logs-connected)'
  );
  if (logItems.length === 0) {
    // Nothing worth saving
    return;
  }

  // Clear the logs by clicking the extension's clear button
  clearLogsBtn.click();

  // Convert logs to a human readable version
  const txtLogs = convertToTXT([...logItems]);
  allLogs = allLogs.concat('\n', txtLogs);

  // Store the logs in the Blob
  const blob = new Blob([allLogs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Send the blob to background job
  console.log('Sending blob:', url, 'blob_size:', blob.size);
  chrome.runtime.sendMessage({ blob: url, blob_size: blob.size });
}

async function readOptions() {
  const settings = await chrome.storage.sync.get({
    saveInSec: '15',
  });

  const saveInSec = Number(settings.saveInSec);
  const tempSaveInMs = saveInSec * 1000;
  if (saveInMSec !== tempSaveInMs) {
    saveInMSec = tempSaveInMs;
    setSaveLogTimer(saveInMSec);
  }

  if (startSavingLogs) {
    saveLog();
    startSavingLogs = false;
  }

  setOptionsTimer(3000);
}

// Start the loop
console.log('SAVE WEBTASK LOGS START..');
readOptions();
