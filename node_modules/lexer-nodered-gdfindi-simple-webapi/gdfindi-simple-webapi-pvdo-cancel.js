module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiPVDOCencelNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var MiningID = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", `https://precom.gdfindi.pro/api/v1/PVDO/${MiningID}/Cancel`, true);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function (res) {
        //console.log('state: '+this.readyState+'\nstatus: '+this.status+'\n'+this.responseText+'\n -----------------------')
        if (this.readyState == 4) {
          var response = JSON.parse(this.responseText);
          msg.payload = response;
          node.send(msg);
        }
      };
      xhr.send();
    });
  }
  RED.nodes.registerType("PVDO: Cancel", gdfindiSimpleWebapiPVDOCencelNode);
}
