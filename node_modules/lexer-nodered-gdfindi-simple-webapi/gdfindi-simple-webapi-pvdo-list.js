module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiPVDOListNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "https://precom.gdfindi.pro/api/v1/PVDO", false);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.send();
      var response = JSON.parse(xhr.responseText);
      msg.payload = response;
      node.send(msg);
    });
  }
  RED.nodes.registerType("PVDO: List", gdfindiSimpleWebapiPVDOListNode);
}
