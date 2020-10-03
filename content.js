function transferLog() {
    console.log("HELLOOO..");
    var msg = document.getElementsByClassName("wt-logs-list-container")[0].innerHTML.toString();
    document.getElementsByClassName("wt-icon-261")[0].click();
    var blob = new Blob( [msg], {type: "text/plain"});

    console.log("BLOB...");
    console.log(blob.text);
    var url = URL.createObjectURL(blob);

    console.log("URL...");
    console.log(url);
    //chrome.runtime.sendMessage(url);

    if(typeof chrome.app.isInstalled!=='undefined'){
      chrome.runtime.sendMessage({greeting: "hello", collection: [url]}, function(response) {
        console.log(response.farewell);
      });
   }
}

var intervalID = setInterval(transferLog, 5000);
