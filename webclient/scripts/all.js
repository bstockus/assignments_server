$(function () {
    
    initalizeHandlebars();
    
    if (checkCookie('username') && checkCookie('password') && checkCookie('good')) {
        login(getCookie('username'), getCookie('password'));
    } else {
        // Display the Login Dialog Box
        signout();
    }

    // Setup SignOut Button Click Handler
    $("#signout-link").bind('click', function () {
        signout();
    });
    
});var _username = "";
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
}function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie(cname) {
    var user = getCookie(cname);
    if (user != "") {
        return true;
    } else {
        return false;
    }
}function loadPartial(name) {
    var _text = "";
	$.ajax({
		url : _handlebars_url + name + '.handlebars',
		success : function(data) {
            _text = data;
		},
		async : false
	});
    return _text;
}

function initalizeHandlebars(_done_cb) {
    
    Handlebars.getTemplate = function(name) {
    	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
    		$.ajax({
    			url : _handlebars_url + name + '.handlebars',
    			success : function(data) {
    				if (Handlebars.templates === undefined) {
    					Handlebars.templates = {};
    				}
    				Handlebars.templates[name] = Handlebars.compile(data);
    			},
    			async : false
    		});
    	}
    	return Handlebars.templates[name];
    };
    
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
    });
    
    // Register Handlebars Partials
    Handlebars.registerPartial('assign_cb', loadPartial("assign_cb"));
    Handlebars.registerPartial('assign_name', loadPartial("assign_name"));
}function hide(_id) {
    $("#" + _id).addClass('hidden');
}

function unhide(_id) {
    $("#" + _id).removeClass('hidden');
}

function cancel_btn(_modal_name) {
    return btn(_modal_name, "cancel");
}

function submit_btn(_modal_name) {
    return btn(_modal_name, "submit");
}

function modal(_modal_name) {
    return _modal_name + "-modal";
}

function progress_span(_modal_name) {
    return span(_modal_name, "progress");
}

function error_lbl(_modal_name) {
    return lbl(_modal_name, "error");
}

function txt(_modal_name, _txt_name) {
    return _txt_name + "-" + _modal_name + "-txt";
}

function lbl(_modal_name, _lbl_name) {
    return _lbl_name + "-" + _modal_name + "-lbl";
}

function btn(_modal_name, _btn_name) {
    return _btn_name + "-" + _modal_name + "-btn";
}

function span(_modal_name, _span_name) {
    return _span_name + "-" + _modal_name + "-span";
}

function select(_modal_name, _select_name) {
    return _select_name + "-" + _modal_name + "-select";
}

function ID(_name) {
    return "#" + _name;
}function signout() {
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
    
}function updateActiveClass() {
    
    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, true];
    
    var html = (Handlebars.getTemplate("main_header"))(_active_class);
    
    for (var idx = 0; idx < ids.length; idx ++) {
        var id = ids[idx];
        var title = titles[idx];
        var show_due_date = show_due_dates[idx];
        
        var obj = {'id': id, 'title': title, 'assigns': _active_class['assigns'][id], 'assigns-due': _active_class['assigns-due'][id], 'show-due-dates': show_due_date};
        
        html += (Handlebars.getTemplate("duegroup"))(obj);
        
    }
    
    $("#main").html(html);
    
    $(".unchecked").hover(function (event){
        $(".assign-cb#" + this.id).removeClass('fa-square').addClass('fa-check-square-o');
    }, function (event){
        $(".assign-cb#" + this.id).addClass('fa-square').removeClass('fa-check-square-o');
    });
    
    $(".unchecked").click(function (event){
        var _id = this.id;
        
    });
    
    $(".assign-name").popover();
    
    $("#add-new-assign-btn").click(function (event){
        var active_class_id = _classes['active'][_active_class_idx]['id'];
        var active_class_name = _classes['active'][_active_class_idx]['name'];
        displayAddNewAssignmentModal(active_class_name, active_class_id);
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
}function updateClassSidebar() {
    var html = (Handlebars.getTemplate("class_sidebar"))(_classes);
    $("#sidebar").html(html);
    
    if (_classes['active'].length > 0) {
        $("#" + _classes['active'][_active_class_idx]['id']).removeClass('active');
        if (_active_class_idx >= _classes['active'].length) {
            _active_class_idx = _classes['active'].length - 1;
        }
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
        
        $(".class-edit-btn").tooltip();
        
        $(".class-edit-btn").click(function (event){
            var _id = this.id.substring(9);
            var _class = findClassById(_id);
            var _name = _class['name'];
            displayChangeClassNameModal(_name, _id);
        });
        
        $(".class-delete-btn").tooltip();
        
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
}var _modals = {};

function loadModal(name, _init_callback) {
    if (_modals === undefined || _modals[name] === undefined) {
    	$.ajax({
    		url : _modals_url + name + '.html',
    		success : function(data) {
                if (_modals === undefined) {
                    _modals = {};
                }
                _modals[name] = data;
                $("body").prepend(data);
                _init_callback();
    		},
    		async : false
    	});
    }
}

//function _modal_callback(status, response)
//function _modal_submit_callback(_cb, _cancel_cb)
function initializeModal(_modal_name, _modal_callback, _modal_submit_callback) {
    var _cancel_btn = cancel_btn(_modal_name);
    var _submit_btn = submit_btn(_modal_name);
    var _progress_span = progress_span(_modal_name);
    var _error_lbl = error_lbl(_modal_name);
    var _modal = modal(_modal_name);
    var _cancel_cb = function (){
        unhide(_submit_btn);
        unhide(_cancel_btn);
        hide(_progress_span);
    };
    $(ID(_cancel_btn)).click(function (event){
        $(ID(_modal)).modal('hide');
    });
    $(ID(_submit_btn)).click(function (event){
        hide(_submit_btn);
        hide(_cancel_btn);
        hide(_progress_span);
        $(ID(_error_lbl)).text("");
        var cb = function (_status, response){
            _cancel_cb();
            _modal_callback(_status, response);
        };
        _modal_submit_callback(cb, _cancel_cb);
    });
}

function displayModal(_modal_name) {
    unhide(btn(_modal_name, "submit"));
    unhide(btn(_modal_name, "cancel"));
    hide(span(_modal_name, "progress"));
    $(ID(lbl(_modal_name, "error"))).text("");
    $(ID(modal(_modal_name))).modal('show');
}var _add_new_assignment_class_id = "";

function displayAddNewAssignmentModal(_class_name, _class_id) {
    var __modal = "add-new-assignment";
    var _date = new Date();
    var _day = _date.getDate();
    var _month = _date.getMonth() + 1;
    var _year = _date.getFullYear();
    var _init_callback = function (){
        var _modal_callback = function (_status, response){
            if (_status == "201") {
                //TODO: See if we can update the new class to the display, without completly reloading the entire active class, via AJAX
                refreshClassSidebar();
                $(ID(modal(__modal))).modal('hide');
            } else {
                $(ID(error_lbl(__modal))).text("Unable to create a new assignment.");
            }
        };
        var _modal_submit_callback = function (_cb, _cancel_cb){
            var _name = $(ID(txt(__modal, "name"))).val();
            if (_name == "") {
                _cancel_cb();
                $(ID(error_lbl(__modal))).text("Assignment Name cannot be empty.");
            } else {
                var body = {'name': _name, 
                            'due': {
                                'day': parseInt($(ID(select(__modal, "day-due"))).val()) + 1, 
                                'month': parseInt($(ID(select(__modal, "month-due"))).val()), 
                                'year': parseInt($(ID(txt(__modal, "year-due"))).val())
                            }};
                performAuthorizedAjaxRequest('POST', 'class/' + _add_new_assignment_class_id + "/assign/", {}, JSON.stringify(body), _cb);
            }
        };
        initializeModal(__modal, _modal_callback, _modal_submit_callback);
    };
    loadModal(__modal, _init_callback);
    _add_new_assignment_class_id = _class_id;
    $(ID(txt(__modal, "name"))).val("");
    $(ID(span(__modal, "classname"))).text(_class_name);
    $(ID(select(__modal, "day-due"))).val(_day.toString());
    $(ID(select(__modal, "month-due"))).val(_month.toString());
    $(ID(txt(__modal, "year-due"))).val(_year.toString());
    displayModal(__modal);
}function displayAddNewClassModal() {
    var __modal = "add-new-class";
    var _init_callback = function () {
        var _modal_callback = function (_status, response){
            if (_status == "201") {
                var res = JSON.parse(response);
                var new_class_obj = {"id": res['id'], "name": res['name'], "assigns-due": 0};
                _classes['active'].push(new_class_obj);
                updateClassSidebar();
                $(ID(modal(__modal))).modal('hide');
            } else {
                $(ID(error_lbl(__modal))).text("Unable to create a new class with that name.");
            }
        };
        var _modal_submit_callback = function (_cb, _cancel_cb){
            var _name = $(ID(txt(__modal,"name"))).val();
            if (_name == "") {
                _cancel_cb();
                $(ID(error_lbl(__modal))).text("Class Name cannot be empty.");
            } else {
                var body = {'name': _name};
                performAuthorizedAjaxRequest('POST', 'class/', {}, JSON.stringify(body), _cb);
            }
        };
        initializeModal(__modal, _modal_callback, _modal_submit_callback);
    };
    loadModal(__modal, _init_callback);
    $(ID(txt(__modal, "name"))).val("");
    displayModal(__modal);
}var _change_class_name_id = "";

function displayChangeClassNameModal(__name, _id) {
    var __modal = "change-class-name";
    var _init_cb = function () {
        var _modal_callback = function (_status, response){
            if (_status == "200") {
                var res = JSON.parse(response);
                var _class = findClassById(res['id']);
                _class['name'] = res['name'];
                updateClassSidebar();
                $(ID(modal(__modal))).modal('hide');
            } else {
                $(ID(error_lbl(__modal))).text("Unable to change the name of the class.");
            }
        };
        var _modal_submit_callback = function (_cb, _cancel_cb){
            var _name = $(ID(txt(__modal, "newname"))).val();
            if (_name == "") {
                _cancel_cb();
                $(ID(error_lbl(__modal))).text("Class Name cannot be empty.");
            } else {
                var body = {'name': _name};
                performAuthorizedAjaxRequest('POST', 'class/' + _change_class_name_id, {}, JSON.stringify(body), _cb);
            }
        };
        initializeModal(__modal, _modal_callback, _modal_submit_callback);
    };
    loadModal(__modal, _init_cb);
    _change_class_name_id = _id;
    $(ID(txt(__modal, "newname"))).val(__name);
    displayModal(__modal);
}function displayLoginModal() {
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
}var _classes = [];

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