var _classes = [];

var _active_class_idx = 0;
var _active_class = {};

function findClassById(_id) {
    var __classes = _classes['active'];
    var _class;
    for (_class in __classes) {
        if (__classes[_class]['id'] == _id) {
            return __classes[_class];
        }
    }
    return {};
}

$(function () {
    
    // Initialize Modals
    initializeAddNewClassModal();
    initializeChangeClassNameModal();
    
    Handlebars.registerHelper('checkbox', function(value) {
        if (value) {
            return "<span class='assign-cb fa fa-check-square-o' id='" + this.id + "'></span>";
        } else {
            return "<span class='assign-cb fa fa-square-o' id='" + this.id + "'></span>";
        }
    });
    
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

function updateClassSidebar() {
    // Update the classes sidebar
    var sidebar_compiled_template = Handlebars.compile($("#sidebar-template").html());
    var html = sidebar_compiled_template(_classes);
    $("#sidebar").html(html);
    
    if (_classes['active'].length > 0) {
        $("#" + _classes['active'][_active_class_idx]['id']).removeClass('active');
        _active_class_idx = 0;
        $("#" + _classes['active'][_active_class_idx]['id']).addClass('active');
        refreshActiveClass();
    
        $(".class-li").bind('click', function (event){
            var __classes = _classes['active'];
            var _class;
            for (_class in __classes) {
                var id = __classes[_class]['id'];
                if (id == this.id) {
                    $("#" + _classes['active'][_active_class_idx]['id']).removeClass('active');
                    _active_class_idx = _class;
                    $("#" + _classes['active'][_active_class_idx]['id']).addClass('active');
                    refreshActiveClass();
                } else if (id == "all") {
                    //TODO: Implement procedure to show all classes available.
                }
            }
        });
    
        $(".class-edit-btn").click(function (event){
            var _id = this.id.substring(9);
            var _class = findClassById(_id);
            var _name = _class['name'];
            displayChangeClassNameModal(_name, _id);
        });
    
        $(".class-delete-btn").click(function (event){
            //TODO: Implement Class Delete Functionality
        });
    }
    
    $(".class-li").hover(function (event) {
        $("#edit-btn-" + this.id).removeClass('hidden');
        $("#delete-btn-" + this.id).removeClass('hidden');
    }, function (event) {
        $("#edit-btn-" + this.id).addClass('hidden');
        $("#delete-btn-" + this.id).addClass('hidden');
    });
    
    $("#add-new-class-btn").click(function (event){
        displayAddNewClassModal();
    });
}

function refreshClassSidebar() {
    var cb = function(status, response) {
        if (status == "200") {
            _classes = JSON.parse(response);
            
            updateClassSidebar();
            
        }
    };
    
    performAuthorizedAjaxRequest('GET', 'class/', {}, "", cb);
    
}

function updateActiveClass() {
    // Update the Current Main Content Area
    var main_header_compliled_template = Handlebars.compile($("#main-header").html());
    var sidebar_compiled_template = Handlebars.compile($("#duegroup-template").html());
    
    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, true];
    
    var html = main_header_compliled_template(_active_class);
    
    for (var idx = 0; idx < ids.length; idx ++) {
        var id = ids[idx];
        var title = titles[idx];
        var show_due_date = show_due_dates[idx];
        
        var obj = {'id': id, 'title': title, 'assigns': _active_class['assigns'][id], 'assigns-due': _active_class['assigns-due'][id], 'show-due-dates': show_due_date};
        
        html += sidebar_compiled_template(obj);
        
    }
    
    $("#main").html(html);
    
    $("#add-new-assign-btn").click(function (event){
        //TODO: Implement add new assignment button.
    });
}

function refreshActiveClass() {
    var activeClassId = _classes['active'][_active_class_idx]['id'];
    
    
    
    //Reload the Active Class Data
    var cb = function(status, response) {
        if (status = "200") {
            _active_class = JSON.parse(response);
            
            updateActiveClass();
            
        }
    };
    
    performAuthorizedAjaxRequest('GET', 'class/' + activeClassId, {}, "", cb);
}