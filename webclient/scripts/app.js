var _template_sidebar;
var _template_main_header;
var _template_duegroup;

$(function () {
    
    // Initialize Modals
    initializeAddNewClassModal();
    initializeChangeClassNameModal();
    initializeAddNewAssignmentModal();
    
    // Register Handlebars Helpers
    Handlebars.registerHelper('checkbox', function (value){
        if (value) {
            return "<span class='assign-cb fa fa-check-square-o' id='" + this.id + "'></span>";
        } else {
            return "<span class='assign-cb fa fa-square-o' id='" + this.id + "'></span>";
        }
    });
    
    Handlebars.registerHelper('prettyDate', function (date){
        var _date = new Date(date);
        return _date.toLocaleDateString();
    });
    
    Handlebars.registerHelper('prettyDaysOverdue', function (date){
        var _today = new Date();
        var _assign = new Date(date);
        var _assignUTC = _assign.valueOf();
        var _todayUTC = _today.valueOf();
        var _delta = _todayUTC - _assignUTC;
        var _deltaDays = Math.floor(_delta / (1000 * 60 * 60 * 24));
        if (_deltaDays == 1) {
            return "(" + _deltaDays.toString() + " day overdue)";
        } else if (_deltaDays > 0) {
            return "(" + _deltaDays.toString() + " days overdue)";
        } else {
            return "";
        }
    })
    
    // Register Handlebars Partials
    Handlebars.registerPartial('assign_cb', $("#assign-cb-template").html());
    Handlebars.registerPartial('assign_name', $("#assign-name-template").html());
    
    // Compile Handlebars Templates
    _template_sidebar = Handlebars.compile($("#sidebar-template").html());
    _template_main_header = Handlebars.compile($("#main-header").html());
    _template_duegroup = Handlebars.compile($("#duegroup-template").html());
    
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