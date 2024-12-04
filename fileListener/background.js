let currentFile = "file:///D:/scriptInjectionProject/fromPhind/test.html"; // Path to the HTML file

// Function to fetch the HTML content of the file
async function fetchHtmlContent() {
    try {
        const response = await fetch(currentFile);
        const htmlContent = await response.text();
        return htmlContent;
    } catch (error) {
        console.error("Failed to fetch HTML file:", error);
    }
}

// Poll for changes to the HTML file
let lastContent = "";

chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        // Add or modify Content-Security-Policy header
        const cspHeader = details.requestHeaders.find(header => header.name.toLowerCase() === 'content-security-policy');
        if (cspHeader) {
            cspHeader.value += " 'unsafe-inline'";  // Append to existing CSP
        } else {
            details.requestHeaders.push({
                name: 'Content-Security-Policy',
                value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
            });
        }

        // Return the modified headers
        return { requestHeaders: details.requestHeaders };
    },
    {
        urls: ['<all_urls>']  // Apply to all URLs
    },
    ['requestHeaders']
);

setInterval(async () => {
    const htmlContent = await fetchHtmlContent();
    if (htmlContent && htmlContent !== lastContent) {
        lastContent = htmlContent;
        const regex = /<script.*?>(.*?)<\/script>/gs;
        const matches = [...htmlContent.matchAll(regex)];
        const parsedJS = matches[0] ? matches[0][1] : "";
        const nonce = "MC44MTgyMzk2OTM4"; //btoa(Math.random().toString()).slice(0, 16);

        // Inject the content into the head of the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {     
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: injectScript,
                    args: [parsedJS, nonce]
                });
            }
        });
    }
}, 5000); // Poll every 5 seconds

// Function to inject the script into the head of the document
function injectScript(parsedJS, nonce) {
    // Generate a nonce for the script
    document.head.insertAdjacentHTML("afterbegin", `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'nonce-${nonce}';">`);
    var script = document.createElement('script');
    script.id = "vinu";
    script.defer = true;
    script.setAttribute('nonce', nonce);
    script.onload = function () {
        console.log('Script loaded and executed');
    };
    script.textContent = parsedJS;
    document.head.appendChild(script);
}

// Listen for storage changes in case the user updates the file path
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.currentFile) {
        currentFile = changes.currentFile.newValue;
    }
});
