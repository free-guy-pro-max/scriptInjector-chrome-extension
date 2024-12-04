document.addEventListener('DOMContentLoaded', () => {
    const fileNameElem = document.getElementById('fileName');
    const changeFileButton = document.getElementById('changeFileButton');
  
    // Get the current file from storage
    chrome.storage.local.get("currentFile", (data) => {
      fileNameElem.textContent = data.currentFile || "No file selected";
    });
  
    // Allow user to change the target HTML file
    changeFileButton.addEventListener('click', () => {
      const newFile = prompt("Enter the path or URL of the HTML file:");
      if (newFile) {
        chrome.storage.local.set({ currentFile: newFile }, () => {
          fileNameElem.textContent = newFile;
        });
      }
    });
  });
  