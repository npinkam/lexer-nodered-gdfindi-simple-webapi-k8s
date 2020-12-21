module.exports = function (RED) {
  "use strict";
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  function gdfindiSimpleWebapiPVDOResultNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      var authorization = this.context().global.get('authorization');
      var MiningID = msg.payload;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", `https://precom.gdfindi.pro/api/v1/PVDO/${MiningID}/Results`, false);
      xhr.setRequestHeader('Authorization', authorization);
      xhr.send();
      var response = JSON.parse(xhr.responseText);
      console.log(response)
      if (response.message == 'Incorrect miningid.') {
        response = {
          message: "Invalid input!",
          messageDetail: response.message
        }
      } else {
        function sleep(milliseconds) {
          const date = Date.now();
          let currentDate = null;
          do {
            currentDate = Date.now();
          } while (currentDate - date < milliseconds);
        }

        while (response.completed == false) {
          xhr = new XMLHttpRequest();
          xhr.open("GET", `https://precom.gdfindi.pro/api/v1/PVDO/${MiningID}/Results`, false);
          xhr.setRequestHeader('Authorization', authorization);
          xhr.send();
          response = JSON.parse(xhr.responseText);
          sleep(1000);
          xhr.abort();
          xhr = {};
        }
      }

      msg.payload = response;
      node.send(msg);
    });
  }
  RED.nodes.registerType("PVDO: Result", gdfindiSimpleWebapiPVDOResultNode);
}
