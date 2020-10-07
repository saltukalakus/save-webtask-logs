var refreshAfter = 0;

// Store the log files with a background job
chrome.runtime.onMessage.addListener(
  function(arg) {
    
    console.log("refresh: " + refreshAfter + " blob: " + arg.blob + " blob size: " + arg.blob_size);
    
    if (arg.blob_size > 0) {
      var file_url=arg.blob;
      try{
        saveas=("logs-" + new Date().toISOString()).replace(/[^a-zA-Z0-9]/g,'-');
      }
      catch (problem){
        console.log(problem);
        saveas="logs-xyz-abc"; 
      }

      chrome.downloads.download({
        url: file_url,
        filename: saveas,
        saveAs: false
      });
    }

    // Refresh the screen periodically to prevent the extension to timeout
    if ( refreshAfter >= Number(arg.refresh_after) )
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });
      refreshAfter = 1;
    }
    refreshAfter++;
  });