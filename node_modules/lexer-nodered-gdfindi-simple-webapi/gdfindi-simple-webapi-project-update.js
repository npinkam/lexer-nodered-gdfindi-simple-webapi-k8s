module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiProjectUpdateNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var projectId = msg.payload["id"];
      var payload = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", "https://precom.gdfindi.pro/api/v1/projects/" + projectId, false);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify(payload));
      try{
        var response = JSON.parse(xhr.responseText);
      }catch{
        var response = {message: "Invalid input!",
        messageDetail: `Wrong input type to the node.`};
      }
      msg.payload = response;
      node.send(msg);
    });
  }
  RED.nodes.registerType("Project: Update", gdfindiSimpleWebapiProjectUpdateNode);
}
