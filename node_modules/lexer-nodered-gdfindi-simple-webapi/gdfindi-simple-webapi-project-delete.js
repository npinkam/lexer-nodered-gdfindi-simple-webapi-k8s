module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiProjectDeleteNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var projectId = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("DELETE", "https://precom.gdfindi.pro/api/v1/projects/" + projectId, true);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 204) {
          var body = `Delete #${projectId} successfully.`;
          msg.payload = body;
          node.send(msg);
        }else if (this.readyState == 4 && this.status != 204) {
          var body = {message: "Error!",
            messageDetail: `Error: ${xhr.statusText}`};
          msg.payload = body;
          node.send(msg);
        }
      };
      xhr.send();
    });
  }
  RED.nodes.registerType("Project: Delete", gdfindiSimpleWebapiProjectDeleteNode);
}
