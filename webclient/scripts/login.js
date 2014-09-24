function signout() {
    setCookie('username', '', 10);
    setCookie('password', '', 10);
    setCookie('good', '', 10);
    _username = "";
    _password = "";
    _auth_token = "";
    _expires = "";
    
    // Empty the Sidebar and Class Area
    $("#sidebar").empty();
    $("#main").empty();
    
    // Display the Login Dialog Box
    displayLoginModal();
    
}