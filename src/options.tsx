import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const Options = () => {
  const [saveName, setSaveName] = useState<string>('');
  const [saveInSec, setSaveInSec] = useState<string>('15');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        saveName: '',
        saveInSec: '15',
      },
      (items) => {
        setSaveName(items.saveName);
        setSaveInSec(items.saveInSec);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        saveName,
        saveInSec,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus('Options saved.');
        const id = setTimeout(() => {
          setStatus('');
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div>
        <b>If there is no new logs file won't be saved.</b>
      </div>
      <div>
        <label>
          Save file name (relative to ~/Downloads)
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          How often to save logs in seconds
          <input
            value={saveInSec}
            onChange={(e) => setSaveInSec(e.target.value)}
          />
        </label>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
