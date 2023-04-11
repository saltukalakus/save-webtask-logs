// Initialize here so we continue using the same file
const nowStr = new Date().toISOString().replace(/[:\.]/g, '-');

async function getFilename(): Promise<string> {
  const settings = await chrome.storage.sync.get({
    saveName: `auth0-logs/${nowStr}.txt`,
  });

  return settings.saveName;
}

// Store the log files with a background job
chrome.runtime.onMessage.addListener(async function (arg) {
  const { blob, blob_size } = arg;
  console.log('blob:', blob, 'blob size:', blob_size);

  if (blob_size === 0) {
    return;
  }

  const filename = await getFilename();

  chrome.downloads.download({
    url: blob,
    filename,
    saveAs: false,
    conflictAction: 'overwrite',
  });
});
