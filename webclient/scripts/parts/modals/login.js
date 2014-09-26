function displayLoginModal() {
    var __modal = "login";
    var _init_callback = function () {
        var _modal_callback = function (_status, response){
            if (_status == "200") {
                res = JSON.parse(response);
                _auth_token = res['auth_token'];
                _expires = new Date(res['expires']+"Z");
                setCookie('good', '1', 10);
                $(ID(modal(__modal))).modal('hide');
                $("#loggedin-user").removeClass('hidden');
                $("#display-name").text(res['display_name']);
                _user = new User(res['display_name'], res['email']);
                setTimeout( function() {
                    refreshClassSidebar();
                }, 500);
            } else {
                $(ID(lbl(__modal, "error"))).text("Invalid Username or Password.");
                $(ID(txt(__modal, "password"))).val("");
            }
        };
        var _modal_submit_callback = function (_cb, _cancel_cb){
            var username = $(ID(txt(__modal, "username"))).val();
            var password = $(ID(txt(__modal, "password"))).val();
            setCookie('username', username, 10);
            setCookie('password', password, 10);
            setCookie('good', '0', 10);
            var req_data = {'user_name': username, 'password': password};
            performAjaxRequest('POST', 'signin', {}, JSON.stringify(req_data), _cb);
        };
        initializeModal(__modal, _modal_callback, _modal_submit_callback);
    };
    loadModal(__modal, _init_callback);
    $(ID(txt(__modal, "username"))).val("");
    $(ID(txt(__modal, "password"))).val("");
    displayModal(__modal);
}