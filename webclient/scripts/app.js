$(function () {
    
    initalizeHandlebars();
    
    if (checkCookie('username') && checkCookie('password') && checkCookie('good')) {
        login(getCookie('username'), getCookie('password'));
    } else {
        // Display the Login Dialog Box
        signout();
    }

    // Setup SignIn Button Click Handler
    $("#signin-btn").bind('click', function () {
        login($("#inputUsername").val(), $("#inputPassword").val());
    });

    // Setup SignOut Button Click Handler
    $("#signout-link").bind('click', function () {
        signout();
    });
    
});