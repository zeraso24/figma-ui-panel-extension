console.log("background.js is up-to-date");
console.log("Visual Patch Editor background.js loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked, sending TOGGLE_EDIT");
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_EDIT" });
  });
});

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === "CREATE_PATCH") {
    console.log("Received CREATE_PATCH message", msg);
    console.log("Edits collected:", msg.edits);
    // Simply acknowledge the edits
    respond({ status: "ok", message: "Edits collected successfully" });
    return true;
  }
}); 