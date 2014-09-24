function signin(displayName) {
    $("#login-modal").modal('hide');
    $("#loggedin-user").removeClass('hidden');
    $("#display-name").text(displayName);
    
    setTimeout( function() {
        refreshClassSidebar();
    }, 500);
}

function signout() {
    setCookie('username', '', 10);
    setCookie('password', '', 10);
    setCookie('good', '', 10);
    _username = "";
    _password = "";
    _auth_token = "";
    _expires = "";
    // Display the Login Dialog Box
    $("#login-modal").modal();
    $("#loggedin-user").addClass('hidden');
    
    $("#inputPassword").val("");
    
    $("#login-modal-error").text("");
    
    // Empty the Sidebar
    $("#sidebar").empty();
}

function loginfailure() {
    $("#login-modal-error").text("Invalid Username or Password.");
    $("#inputPassword").val("");
}