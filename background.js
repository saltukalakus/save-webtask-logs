const REFRESH_AFTER = 5;
const TIMEOUT_REFRESH_IN_MSEC = 1000*60*5 // 5 minutes tops to refresh the screen
var refreshAfter = 0;

// Store the log files with a background job
chrome.runtime.onMessage.addListener(
  function(arg, sender, sendResponse) {
    
    console.log("refresh: " + refreshAfter + " blob: " + arg.blob + " blob size: " + arg.blob_size);
    
    if (arg.blob_size > 0) {
      var file_url=arg.blob;
      try{
        saveas=file_url.replace(/[^a-zA-Z0-9]/g,'-');
      }
      catch (problem){
      }

      chrome.downloads.download({
        url: file_url,
        filename: saveas,
        saveAs: false
      });
    }

    // Refresh the screen periodically to prevent the extension to timeout
    if (refreshAfter >= REFRESH_AFTER )
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });
      refreshAfter = 0;
    }
    refreshAfter++;
  });