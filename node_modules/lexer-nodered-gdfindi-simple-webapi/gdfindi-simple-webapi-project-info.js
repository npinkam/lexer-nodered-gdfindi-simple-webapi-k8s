module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiProjectInfoNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var projectId = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "https://precom.gdfindi.pro/api/v1/projects/"+projectId, false);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.send();
      try{
        var response = JSON.parse(xhr.responseText);
      }catch{
        var response = {message: "Invalid input!",
        messageDetail: `Project#${projectId} is not in the database!`};
      }
      msg.payload = response;
      node.send(msg);
    });
  }
  RED.nodes.registerType("Project: Info", gdfindiSimpleWebapiProjectInfoNode);
}
