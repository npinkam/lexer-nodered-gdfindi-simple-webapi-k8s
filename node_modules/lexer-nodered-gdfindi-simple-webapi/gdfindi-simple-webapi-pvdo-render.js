module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiPVDORenderNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      //check payload field
      if (msg.payload.hasOwnProperty('id') && msg.payload.hasOwnProperty('pvdoRenderingCondition')) {
        var projectId = msg.payload.id;
        var content = msg.payload.pvdoRenderingCondition;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://precom.gdfindi.pro/api/v1/PVDO/" + projectId, true);
        xhr.setRequestHeader('Authorization', authorization);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function (res) {
          if (this.readyState == 4 && this.status == 200) {
            var response = this.responseText;
            //send MiningID to pvdo output
            msg.payload = '';
            msg.payload = response;
            node.send(msg);
          }
        };
        xhr.send(JSON.stringify(content));
      }else{
        msg.payload = {
          message: "Invalid input!",
          messageDetail: `id or pvdoRenderingCondition is not in the payload!`
        };
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType("PVDO: Render", gdfindiSimpleWebapiPVDORenderNode);
}
