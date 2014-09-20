var _username = "";
var _password = "";
var _auth_token = "";
var _expires = "";

//var _base_url = "http://bstockus-assignments.appspot.com/api/";
var _base_url = "http://localhost:8080/api/";

function performAjaxRequest(method, path, headers, body, callback) {
    url = _base_url + path;
    $.ajax({
        url: url,
        type: method,
        data: body,
        x_callback: callback,
        dataType: "json",
        complete: function(jqXHR, status) {
            this.x_callback(jqXHR.status, jqXHR.responseText);
        }
    });
}

function performAuthorizedAjaxRequest(method, path, headers, body, callback) {
    url = _base_url + path;
    h = {"X-Assignments-Auth-Token": _auth_token};
    $.ajax({
        url: url,
        type: method,
        data: body,
        x_callback: callback,
        dataType: "json",
        headers: h,
        complete: function(jqXHR, status) {
            this.x_callback(jqXHR.status, jqXHR.responseText);
        }
    });
}

function login(username, password) {
    setCookie('username', username, 10);
    setCookie('password', password, 10);
    setCookie('good', '0', 10);
    _username = username;
    _password = password;
    var req_data = {'user_name':_username, 'password':_password};
    var cb = function(status, response) {
        if (status == "200") {
            res = JSON.parse(response);
            _auth_token = res['auth_token'];
            _expires = new Date(res['expires']+"Z");
            signin(res['display_name']);
            setCookie('good', '1', 10);
        } else {
            loginfailure();
        }
    }
    performAjaxRequest('POST', 'signin', {}, JSON.stringify(req_data), cb);
}