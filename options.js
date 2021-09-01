// Saves options to chrome.storage
function save_options() {
    var saveInSec = document.getElementById('save-time').value;
    chrome.storage.sync.set({
        saveInSec: saveInSec,
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
        saveInSec: '15',
    }, function(items) {
      document.getElementById('save-time').value = items.saveInSec;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);