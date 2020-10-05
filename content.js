// Convert HTLM logs to CVS logs
function parse(htmlLogs) {
  var cvsLogs = htmlLogs;
  return cvsLogs;
}

// Grab the logs from scree and send to background job
function transferLog() {
    
  // Read the logs from HTML
  var logs = document.getElementsByClassName("wt-logs-list-container")[0].innerHTML.toString();
    
  // Clear the logs with clicking the button
  document.getElementsByClassName("wt-icon-261")[0].click();

  // Keep the logs in the Blob
  var blob = new Blob( [parse(logs)], {type: "text/plain"});
  console.log(blob.text);
  var url = URL.createObjectURL(blob);

  // Send the blob to background job
  if(typeof chrome.app.isInstalled!=='undefined'){
    chrome.runtime.sendMessage({greeting: "hello", collection: [url]}, function(response) {
    console.log(response.farewell);
    });
  }
}

var intervalID = setInterval(transferLog, 5000);
