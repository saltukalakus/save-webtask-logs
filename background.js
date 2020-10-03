    chrome.runtime.onMessage.addListener(
        function(arg, sender, sendResponse) {
            console.log("RUN BACKGROUND...1");
            var args=arg.collection;
            for (i in args){
            var img_url=args[i];
            try{
             saveas=img_url.replace(/[^a-zA-Z0-9]/g,'-');
            }
            catch (problem){
            }
        
            console.log("RUN BACKGROUND...2");
             chrome.downloads.download({
             url: img_url,
             filename: saveas,
             saveAs: false
            });
           }
          console.log(sender.tab ?
                      "from a content script:" + sender.tab.url :
                      "from the extension");


          if (arg.greeting == "hello")
            sendResponse({farewell: "goodbye"});
        });