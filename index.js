const http = require('http');
const express = require("express");
const RED = require("node-red");
const utility = require('./lib/utility.js');
const bodyParser = require('body-parser');
const { auth } = require('@node-red/editor-api');
const nocache = require('nocache')
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cookieParser = require('cookie-parser');
const sleep = require('util').promisify(setTimeout)
const os = require('os');
// inject node-red with a delay after run start

const config = {
    client: {
    },
    auth: {
        tokenHost: 'https://precom.gdfindi.pro',
        tokenPath: '/api/token'
    }
};
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');

// Create the settings object - see default settings.js file for other options
var settings = {
    flowFile: ``,
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: '',
    functionGlobalContext: {
        authorization: ''
    },    // enables global context
    httpNodeCors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE"
    },
    editorTheme: {
        projects: {
            enabled: false // Enable the projects feature
        }
    },
};

// Create an Express app
var app = express();

// Add a simple route for static content served from 'public'
app.use("/", express.static("public"));

// Create a server
var server = http.createServer(app);

//parser
app.use(bodyParser.urlencoded({ extended: true }));

//nocache
app.use(nocache());

//cookie
app.use(cookieParser());
/*
// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);
*/

var checkAuth = function (req) {
    if (req.cookies.hasOwnProperty('authorization')) {
        //if (settings.functionGlobalContext.authorization != false) {
        return true;
    } else {
        return false;
    }
}

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/login.html'));
});

app.post('/auth', (req, res) => {
    async function run() {
        var username = req.body.username;
        var password = req.body.password;
        const client = new ResourceOwnerPassword(config);

        const tokenParams = {
            username: username,
            password: password,
        };
        try {
            const accessToken = await client.getToken(tokenParams, { json: true });
            var authorization = accessToken.token.token_type + ' ' + accessToken.token.access_token;

            //stop node-red module
            await RED.stop();
            //delete node-red route from app
            var routes = app._router.stack;
            routes.forEach(function (route, index) {
                if (route.path === '/red') {
                    // remove the mounted app
                    routes.splice(index, 1);
                }
            });
            //delete an instance of node-red server and create a new one
            server.close();
            server = null;
            server = http.createServer(app);

            // Create the settings object - see default settings.js file for other options
            settings = {
                flowFile: `flow_${username}.json`,
                httpAdminRoot: "/red",
                httpNodeRoot: "/api",
                userDir: `/app/userDir/${username}`,
                functionGlobalContext: {
                    authorization: authorization
                },    // enables global context
                httpNodeCors: {
                    origin: "*",
                    methods: "GET,PUT,POST,DELETE"
                },
                editorTheme: {
                    projects: {
                        enabled: false // Enable the projects feature
                    }
                },
            };

            // Initialise the runtime with a server and settings
            RED.init(server, settings);

            // Serve the editor UI from /red
            app.use(settings.httpAdminRoot, RED.httpAdmin);

            // Serve the http nodes UI from /api
            app.use(settings.httpNodeRoot, RED.httpNode);

            // Start the runtime
            await RED.start()

            //reinitialize server
            server.listen(8000);
            await sleep(500);

            res.cookie('username', username);
            res.cookie('authorization', authorization);
            res.redirect('/lexerproject');
        } catch (error) {
            console.log('Access Token Error', error.message);
        }
    }
    run();
});

app.get('/lexerproject', (req, res) => {
    //check authorization in settings.functionGlobalContext.authorization
    if (checkAuth(req)) {
        var title = `LEXER: GD.findi Node-RED`
        var library = ``;
        var header = `<a href="#">${os.hostname()}</a>`;
        var style = ``;
        var body = `<div><iframe src="/red" style="position: absolute; height: 94%; width:100%; border: none"></iframe></div>`;
        var script = ``;
        var html = utility.htmlTemplate(title, library, style, header, body, script);
        res.send(html)
    } else {
        res.send(utility.htmlTemplate('', '', `p {margin-left: auto;margin-right: auto;width: 8em;font-size: xx-large}`, '', `<p>No Authorization</p>`, ''))
    }
});

app.get('/projectlist', (req, res) => {
    //check authorization in settings.functionGlobalContext.authorization
    if (checkAuth(req)) {
        // add codeWhenReceivePayload
        var authorization = settings.functionGlobalContext.authorization;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://precom.gdfindi.pro/api/v1/projects/", false);
        xhr.setRequestHeader('Authorization', authorization);
        xhr.send();
        var response = JSON.parse(xhr.responseText);

        var title = 'GD.findi Project List'
        var library = `
<link rel="stylesheet" href="https://unpkg.com/bootstrap-table@1.18.0/dist/bootstrap-table.min.css">
<script src="https://unpkg.com/bootstrap-table@1.18.0/dist/bootstrap-table.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
`;
        var style = '';
        var header = ``;

        /*         response.forEach(element => {
                    var buffer = element.id;
                    var link = `/projinfo?projectId=${buffer}`;
                    element.id = "<a href=" + link + " target='_self'>" + buffer + "</a>";
        
                }); */

        var body = `
<div class="container">
  <table id="table">
    <thead>
      <tr>
        <th data-field="id">Project ID</th>
        <th data-field="name">Project Name</th>
        <th data-field="owner">Owner</th>
      </tr>
    </thead>
  </table>
</div>
`;
        var script = `
var $table = $('#table');
var mydata = ${JSON.stringify(response)};
$(function(){
  $("#table").bootstrapTable({
    data: mydata
  });
});
`;
        var html = utility.htmlTemplate(title, library, style, header, body, script);
        res.send(html)
    } else {
        res.send(utility.htmlTemplate('', '', `p {margin-left: auto;margin-right: auto;width: 8em;font-size: xx-large}`, '', `<p>No Authorization</p>`, ''))
    }
});

app.get('/pvdolist', (req, res) => {
    //check authorization in settings.functionGlobalContext.authorization
    if (checkAuth(req)) {
        var authorization = settings.functionGlobalContext.authorization;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://precom.gdfindi.pro/api/v1/PVDO", false);
        xhr.setRequestHeader('Authorization', authorization);
        xhr.send();
        var response = JSON.parse(xhr.responseText);

        /*         //current mining
                var buffer = response.miningmanager_status.CurrentMiningID;
                var link = `/PVDOinfo?MiningID=${buffer}`;
                response.miningmanager_status.CurrentMiningID = "<a href=" + link + " target='_self'>" + buffer + "</a>";
         */
        /*         response.mining_statuses.forEach(element => {
                    var buffer = element.MiningID;
                    var link = `/PVDOinfo?MiningID=${buffer}`;
                    element.MiningID = "<a href=" + link + " target='_self'>" + buffer + "</a>";
        
                    if (element.Status != 'Complete' && element.Status != 'Cancel') {
                        var bufferStatus = element.Status;
                        link = `/PVDOabort?MiningID=${buffer}`;
                        element.Status = `<p>${bufferStatus} (</p><a href=${link} target='_self'>ABORT</a><p>)</p>`;
                    }
                }); */

        var title = 'GD.findi PVDO List'
        var library = `
            <link rel="stylesheet" href="https://unpkg.com/bootstrap-table@1.18.0/dist/bootstrap-table.min.css">
            <script src="https://unpkg.com/bootstrap-table@1.18.0/dist/bootstrap-table.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
            `;
        var style = '';
        var header = '';

        var body = `
            <div class="container">
              <table id="table">
                <thead>
                  <tr>
                    <th data-field="MiningID">Mining ID</th>
                    <th data-field="User">User</th>
                    <th data-field="Total">Total</th>
                    <th data-field="Finished">Finished</th>
                    <th data-field="Status">Status</th>
                    <th data-field="Start">Start</th>
                    <th data-field="Finish">Finish</th>
                  </tr>
                </thead>
              </table>
            </div>
            `;
        var script = `
            var $table = $('#table');
            var mydata = ${JSON.stringify(response.mining_statuses)};
            $(function(){
              $("#table").bootstrapTable({
                data: mydata
              });
            });
            `;

        var html = utility.htmlTemplate(title, library, style, header, body, script);
        res.send(html);
    } else {
        res.send(utility.htmlTemplate('', '', `p {margin-left: auto;margin-right: auto;width: 8em;font-size: xx-large}`, '', `<p>No Authorization</p>`, ''))
    }
});

app.get('/logout', (req, res) => {
    if (settings.functionGlobalContext.hasOwnProperty('authorization')) {
        settings = {
            httpAdminRoot: "/red",
            httpNodeRoot: "/api",
            userDir: '',
            functionGlobalContext: {
                authorization: ''
            },
            httpNodeCors: {
                origin: "*",
                methods: "GET,PUT,POST,DELETE"
            },
            editorTheme: {
                projects: {
                    enabled: false // Enable the projects feature
                }
            },
        };
    }
    //stop node-red module
    RED.stop().then(() => {
        //delete node-red route from app
        var routes = app._router.stack;
        routes.forEach(function (route, index) {
            if (route.path === '/red') {
                // remove the mounted app
                routes.splice(index, 1);
            }
        });
        //delete an instance of node-red server and create a new one
        server.close();
        server = null;
        server = http.createServer(app);
        server.listen(8000);
    })

    res.clearCookie('authorization');
    res.clearCookie('username');
    res.redirect('/');
});

server.listen(8000);