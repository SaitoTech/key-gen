const TabGroup = require("electron-tabs");

////////////
// Render //
////////////
$(document).ready(function () {
    let tgoptions = {};
  tgoptions.tabContainerSelector = ".etabs-tabs";
  let tabGroup = new TabGroup(tgoptions);
  let tab0 = tabGroup.addTab({
    title: "Generate Keys",
    src: "form.html#create",
    visible: true,
    active: true,
    closable: false
  });
  let tab1 = tabGroup.addTab({
    title: "Restore Keys",
    src: "form.html#retrieve",
    visible: true,
    closable: false
  });
  let webview = tab0.webview;
  webview.webviewAttributes = "nodeintegration";
  webview.loadURL("file:form.html#create");
});
