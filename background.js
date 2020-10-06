const REFRESH_AFTER = 5;
var refreshScreen = 0;

// Store the log files with a background job
chrome.runtime.onMessage.addListener(
  function(arg, sender, sendResponse) {
    var args=arg.collection;
    for (i in args){
      var file_url=args[i];
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
    if (refreshScreen > REFRESH_AFTER )
    {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
          });
        refreshScreen = 0;
    }
    refreshScreen++;

    if (arg.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });