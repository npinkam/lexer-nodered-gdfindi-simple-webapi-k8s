module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiProjectCreateNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var payload = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://precom.gdfindi.pro/api/v1/projects/", false);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify(payload));
      var response = JSON.parse(xhr.responseText);
      msg.payload = response;
      node.send(msg);
    });
  }
  RED.nodes.registerType("Project: Create", gdfindiSimpleWebapiProjectCreateNode);
}
