// This script runs in the context of the webpage (like www.att.com)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "injectContent") {
      const htmlContent = message.htmlContent;
  
      // Create a new <div> element to hold the HTML content
      const newElement = document.createElement('div');
      newElement.innerHTML = htmlContent;
  
      // Append this content into the <head> of the current webpage
      const head = document.head;
      if (head) {
        head.appendChild(newElement);
      }
    }
  });
  