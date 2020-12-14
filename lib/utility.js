module.exports = {
    htmlTemplate: function (title, library, style, header, body, script) {
        var styleHeader = '';
        var headerContent = function (header) {
            if (header === false) {
                return '';
            } else {
                var defaultHeader = `
<div class="topnav">
    <a href="/lexerproject">HOME</a>
    <a href="/projectlist">Project List</a>
    <a href="/pvdolist">PVDO Status</a>
    ${header}
    <div class="topnav-right">
        <a id="username"></a>
        <a id="logout" href="/logout"></a>
    </div>
</div>
<style>
/* Add a black background color to the top navigation */
.topnav {
    background-color: #333;
    overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.topnav a.active {
  background-color: #4CAF50;
  color: white;
}

/* Right-aligned section inside the top navigation */
.topnav-right {
  float: right;
}
</style>
            `;
            return defaultHeader;
            }
        }

        var html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js"></script>
${library}
<style>
body {
    font-family: 'Roboto';
}
${style}
</style>
</head>
<body>
${headerContent(header)}
${body}
<script>
$(function(){
    //check if authorization exist
    if(Cookies.get('authorization') != undefined){
        var username = Cookies.get('username');
        $("#logout").text("Log out");
        $("#username").text("Hello " + username + "!");
    }else{
        $("#logout").attr("href", "/login");
        $("#logout").text("Log In");
        $("#username").text("");
    }
});
${script}
</script>
</body>
</html>                                		
`;

        return html;
    }

};