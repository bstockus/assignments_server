var _username = "";
var _password = "";
var _auth_token = "";
var _expires = "";

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

function performSyncAuthorizedAjaxRequest(method, path, body, callback) {
    $.ajax({
        url: _base_url + path,
        type: method,
        data: body,
        x_callback: callback,
        dataType: "json",
        headers: {"X-Assignments-Auth-Token": _auth_token},
        async: false,
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
            $("#loggedin-user").removeClass('hidden');
            $("#display-name").text(res['display_name']);
            setTimeout( function() {
                refreshClassSidebar();
            }, 500);
            setCookie('good', '1', 10);
        } else {
            displayLoginModal();
        }
    }
    performAjaxRequest('POST', 'signin', {}, JSON.stringify(req_data), cb);
}

function performClassListRequest(_success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "200") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    performSyncAuthorizedAjaxRequest('GET', 'class/', "", _cb);
}

function performClassGetRequest(_id, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "200") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    performSyncAuthorizedAjaxRequest('GET', 'class/' + _id, "", _cb);
}