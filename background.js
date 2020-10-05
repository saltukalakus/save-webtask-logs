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
    if (arg.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });