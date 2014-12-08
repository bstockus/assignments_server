var _user;

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

var _retrying_ajax_request = false;
var _retrying_ajax_request_count = 0;

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

function performSyncAjaxRequest(method, path, body, callback) {
    $.ajax({
        url: _base_url + path,
        type: method,
        data: body,
        x_callback: callback,
        dataType: "json",
        async: false,
        complete: function(jqXHR, status) {
            this.x_callback(jqXHR.status, jqXHR.responseText);
        }
    });
}

function performSyncAuthorizedAjaxRequest(method, path, body, callback) {
    console.log("performSyncAuthorizedAjaxRequest(Enter): [" + method + "]" + path);
    $.ajax({
        url: _base_url + path,
        type: method,
        data: body,
        x_callback: callback,
        dataType: "json",
        headers: {"X-Assignments-Auth-Token": _auth_token},
        async: false,
        complete: function(jqXHR, status) {
            //console.log("performSyncAuthorizedAjaxRequest(Complete Callback): [" + method + "]" + path + " {Status:" + jqXHR.status + "}");
            if (jqXHR.status == "401") {
                if (_retrying_ajax_request_count == 0) {
                    if (!performReLoginRequest()) {
                        _retrying_ajax_request_count = 0;
                        signout();
                    }
                }
                if (_retrying_ajax_request_count < 5) {
                    var _count = _retrying_ajax_request_count;
                    //console.log("performSyncAuthorizedAjaxRequest(Retry Begin): [" + method + "]" + path + "{Attempt:" + _count + "}");
                    var y = 0;
                    for (var x = 0; x < 100000000; x ++) {
                        y += x;
                    }
                    _retrying_ajax_request_count += 1;
                    performSyncAuthorizedAjaxRequest(method, path, body, callback);
                    //console.log("performSyncAuthorizedAjaxRequest(Retry End): [" + method + "]" + path + "{Attempt:" + _count + "}");
                } else {
                    signout();
                }
            } else {
                _retrying_ajax_request_count = 0;
                this.x_callback(jqXHR.status, jqXHR.responseText);
            }
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
    var cb = function(status, response){
        if (status == "200") {
            res = JSON.parse(response);
            _auth_token = res['auth_token'];
            _expires = new Date(res['expires']+"Z");
            _user = new User(res['display_name'], res['email']);
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

function performReLoginRequest() {
    var _loginStatus = false;
    if (checkCookie('username') && checkCookie('password') && checkCookie('good')) {
        var req_data = {'user_name': getCookie('username'), 'password': getCookie('password')};
        var cb = function (status, response){
            if (status == 200) {
                res = JSON.parse(response);
                _auth_token = res['auth_token'];
                _expires = new Date(res['expires'] + "Z");
                _loginStatus = true;
            }
        }
        performSyncAjaxRequest('POST', 'signin', JSON.stringify(req_data), cb);
    }
    return _loginStatus;
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

function performAssignUpdateRequest(_id, _name, _is_completed, _date_due, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "200") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    var _req = {};
    if (_name != null) {
        _req['name'] = _name;
    }
    if (_is_completed != null) {
        _req['completed'] = _is_completed;
    }
    if (_date_due != null) {
        _req['due'] = {};
        _req['due']['day'] = _date_due.getDate();
        _req['due']['month'] = _date_due.getMonth() + 1;
        _req['due']['year'] = _date_due.getFullYear();
    }
    performSyncAuthorizedAjaxRequest('POST', 'assign/' + _id, JSON.stringify(_req), _cb);
}

function performClassUpdateRequest(_id, _name, _active, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "200") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    var _req = {};
    if (_name != null) {
        _req['name'] = _name;
    }
    if (_active != null) {
        _req['active'] = _active;
    }
    performSyncAuthorizedAjaxRequest('POST', 'class/' + _id, JSON.stringify(_req), _cb);
}

function performClassDeleteRequest(_id, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "204") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    performSyncAuthorizedAjaxRequest('DELETE', 'class/' + _id, "", _cb);
}

function performAssignDeleteRequest(_id, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "204") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    performSyncAuthorizedAjaxRequest('DELETE', 'assign/' + _id, "", _cb);
}

function performClassCreateRequest(_name, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "201") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    var _req = {"name": _name};
    performSyncAuthorizedAjaxRequest('POST', 'class/', JSON.stringify(_req), _cb);
}

function performAssignCreateRequest(_id, _name, _date_due, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        //console.log("performAssignCreateRequest(Callback)");
        if (_status == "201") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    var _req = {};
    _req['name'] = _name;
    _req['due'] = {};
    _req['due']['day'] = _date_due.getDate();
    _req['due']['month'] = _date_due.getMonth() + 1;
    _req['due']['year'] = _date_due.getFullYear();
    performSyncAuthorizedAjaxRequest('POST', 'class/' + _id + '/assign/', JSON.stringify(_req), _cb);
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
    $("#navbar").empty();
    $("#main").empty();

    $(".modal").modal('hide');

    _user = undefined;

    // Display the Login Dialog Box
    displayLoginModal();
}var _active_class_collapse_state_cache = {};

function _checkActiveClassCollapseStateCacheClassExists(_class_id) {
    if (_active_class_collapse_state_cache[_class_id] === undefined) {
        _active_class_collapse_state_cache[_class_id] = {'past-due': false, 'due-today': false, 'due-tomorrow': false, 'due-this-week': false, 'due-next-week': false, 'due-this-month': false, 'due-after-this-month': false, 'completed': false};
    }
}

function getActiveClassCollapseStateCacheForClass(_class_id, _duegroup_id) {
    _checkActiveClassCollapseStateCacheClassExists(_class_id);
    return _active_class_collapse_state_cache[_class_id][_duegroup_id];
}

function setActiveClassCollapseStateCacheForClass(_class_id, _duegroup_id, _value) {
    _checkActiveClassCollapseStateCacheClassExists(_class_id);
    _active_class_collapse_state_cache[_class_id][_duegroup_id] = _value;
}

function updateActiveClass() {

    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, false];
    var show_assigns_dues = [true, true, true, true, true, true, true, false];

    if (_active_class_id != "all") {
        var _active_class = _user.getClassById(_active_class_id);

        var html = (Handlebars.getTemplate("main_header"))({"name": _active_class.getName(), "id": _active_class.getID()});

        for (var idx = 0; idx < ids.length; idx ++) {
            var _period = ids[idx];
            if (_active_class.isThereClassesForDuegroup(_period)) {
                var obj = _active_class.forDuegroup(_period);
                obj['id'] = _period;
                obj['title'] = titles[idx];
                obj['show-due-dates'] = show_due_dates[idx];
                obj['show-assigns-due'] = show_assigns_dues[idx];
                if (_active_class.getAssignsDue(_period) == 0) {
                    obj['show-assigns-due'] = false;
                }
                obj['collapse'] = getActiveClassCollapseStateCacheForClass(_active_class_id, _period);

                html += (Handlebars.getTemplate("duegroup"))(obj);
            }
        }

        $("#main").html(html);

        $("#header-class-btns").removeClass('hidden');

    } else {

        var html = (Handlebars.getTemplate("main_header"))({"name": "All Classes", "id": "all"});

        for (var idx = 0; idx < ids.length; idx ++) {
            var _period = ids[idx];
            var obj = _user.forDuegroup(_period);
            obj['id'] = _period;
            obj['title'] = titles[idx];
            obj['show-due-dates'] = show_due_dates[idx];
            obj['show-assigns-due'] = show_assigns_dues[idx];
            if (obj['assigns-due'] == 0) {
                obj['show-assigns-due'] = false;
            }
            obj['collapse'] = getActiveClassCollapseStateCacheForClass(_active_class_id, _period);

            if (obj['assigns'].length != 0) {
                html += (Handlebars.getTemplate("duegroup-all-classes"))(obj);
            }

        }

        $("#main").html(html);

        $("#header-class-btns").addClass('hidden');

    }

    updateClassEditAndDeleteBtns();
    updateAddNewClassBtn();

    $(".unchecked").hover(function (event){
        $(".assign-cb#" + this.id).removeClass('fa-square').addClass('fa-check-square-o');
    }, function (event){
        $(".assign-cb#" + this.id).addClass('fa-square').removeClass('fa-check-square-o');
    });
    
    $(".unchecked").click(function (event){
        var _id = this.id;
        var _assign = _user.getAssignById(_id);
        _assign.setIsCompleted(true);
        updateActiveClass();
        updateActiveClassAssignsDue();
    });

    $(".checked").click(function (event){
        var _id = this.id;
        var _assign = _user.getAssignById(_id);
        _assign.setIsCompleted(false);
        updateActiveClass();
        updateActiveClassAssignsDue();
    });
    
    $(".assign-name").popover();

    if (_active_class_id == "all") {
        $(".add-new-assign-btn").addClass('hidden');
    } else {
        $(".add-new-assign-btn").removeClass('hidden');
        $(".add-new-assign-btn").click(function (event){
        _displayAddNewAssignmentModal();
    });
    }



    $(".panel-collapse").on('shown.bs.collapse', function (){
        setActiveClassCollapseStateCacheForClass(_active_class_id, this.id, true);
    });

    $(".panel-collapse").on('hidden.bs.collapse', function (){
        setActiveClassCollapseStateCacheForClass(_active_class_id, this.id, false);
    });

}

function refreshActiveClass() {
    updateActiveClass();
}

function updateActiveClassAssignsDue() {
    if (_active_class_id != "all") {
        var __total_assigns_due = _user.getClassById(_active_class_id).getTotalAssignsDue();
        if (__total_assigns_due == 0) {
            $("span.badge#" + _active_class_id).addClass('hidden');
        } else {
            $("span.badge#" + _active_class_id).removeClass('hidden');
            $("span.badge#" + _active_class_id).text(__total_assigns_due);
        }
    } else {
        updateAllClassAssignsDue();
    }
    updateTotalAssignsDue();
}

function updateTotalAssignsDue() {
    var __total_assigns_due = _user.getTotalAssignsDue();
    if (__total_assigns_due == 0) {
        $(".total-assigns-due-badge").addClass('hidden');
    } else {
        $(".total-assigns-due-badge").removeClass('hidden');
        $(".total-assigns-due-badge").text(__total_assigns_due);
    }
}

function updateAllClassAssignsDue() {
    var __active_classes = _user.getActiveClasses();
    for (var index = 0; index < __active_classes.length; index ++) {
        var __class = __active_classes[index];
        var __total_assigns_due = __class.getTotalAssignsDue();
        var __class_id = __class.getID();
        if (__total_assigns_due == 0) {
            $("span.badge#" + __class_id).addClass('hidden');
        } else {
            $("span.badge#" + __class_id).removeClass('hidden');
            $("span.badge#" + __class_id).text(__total_assigns_due);
        }
    }
}var _active_class_id = 'all';

function updateClassSidebar() {
    var _obj = _user.forClassSidebar();
    $("#sidebar").html((Handlebars.getTemplate("class_sidebar"))(_obj));
    $("#navbar").html((Handlebars.getTemplate("class_navbar"))(_obj));

    if (_active_class_id === undefined && _user.getActiveClasses().length > 0) {
        _active_class_id = _user.getActiveClasses()[0].getID();
    }

    if (_user.getActiveClasses().length > 0) {

        if (_user.getClassById(_active_class_id) == null) {
            changeActiveClass(_user.getActiveClasses()[0].getID());
        }
    
        $(".class-li").bind('click', function (event){
            changeActiveClass(this.id);
        });

        $(".class-li-navbar").bind('click', function (event){
            changeActiveClass(this.id);
        });
        

    }

    updateAllClassAssignsDue();
    updateTotalAssignsDue();
    updateClassEditAndDeleteBtns();
    
    $(".class-li").hover(function (event) {
        $("#edit-btn-" + this.id).removeClass('hidden');
        $("#delete-btn-" + this.id).removeClass('hidden');
    }, function (event) {
        $("#edit-btn-" + this.id).addClass('hidden');
        $("#delete-btn-" + this.id).addClass('hidden');
    });
    
    updateAddNewClassBtn();
}

function changeActiveClass(_new_active_class_id) {
    $(ID(_active_class_id)).removeClass('active');
    _active_class_id = _new_active_class_id;
    $(ID(_active_class_id)).addClass('active');
    refreshActiveClass();
}

function refreshClassSidebar() {
    updateClassSidebar();
}

function updateAddNewClassBtn() {
    $(".add-new-class-btn").click(function (event){
        _displayAddNewClassModal();
    });
}

function updateClassEditAndDeleteBtns() {
    $(".class-edit-btn").tooltip();

    $(".class-edit-btn").click(function (event){
        var _id = this.id.substring(9);
        _displayChangeClassNameModal(_id);
    });

    $(".class-delete-btn").tooltip();

    $(".class-delete-btn").click(function (event){
        //TODO: Implement Class Delete Functionality
    });
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
}

function setupModal(_modal_name, _submit_cb) {
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
    $(ID(_submit_btn)).click(function (event) {
        hide(_submit_btn);
        hide(_cancel_btn);
        hide(_progress_span);
        $(ID(_error_lbl)).text("");
        _submit_cb(_cancel_cb);
    });
}

var _add_new_assignment_class_id = "";

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
}

function _displayAddNewAssignmentModal() {
    var __modal = "add-new-assignment";
    var _date = new Date();
    var _day = _date.getDate();
    var _month = _date.getMonth() + 1;
    var _year = _date.getFullYear();
    var _init_cb = function () {
        var _submit_cb = function (_cancel_cb){
            try {
                var _new_date = new Date(parseInt($(ID(txt(__modal, "year-due"))).val()), parseInt($(ID(select(__modal, "month-due"))).val()) - 1, parseInt($(ID(select(__modal, "day-due"))).val()), 0, 0, 0, 0);
                var _new_assign = _user.getClassById(_active_class_id).addAssign($(ID(txt(__modal, "name"))).val(), _new_date);
                $(ID(modal(__modal))).modal('hide');
                updateActiveClass();
                $("span.badge#" + _active_class_id).text(_user.getClassById(_active_class_id).getTotalAssignsDue());
                $("#total-assigns-due-badge").text(_user.getTotalAssignsDue());
            } catch (e) {
                $(ID(error_lbl(__modal))).text(e);
            }
            _cancel_cb();
        };
        setupModal(__modal, _submit_cb);
    };
    loadModal(__modal, _init_cb);
    $(ID(txt(__modal, "name"))).val("");
    $(ID(span(__modal, "classname"))).text(_user.getClassById(_active_class_id).getName());
    $(ID(select(__modal, "day-due"))).val(_day.toString());
    $(ID(select(__modal, "month-due"))).val(_month.toString());
    $(ID(txt(__modal, "year-due"))).val(_year.toString());
    displayModal(__modal);
}function _displayAddNewClassModal() {
    var __modal = "add-new-class";
    var _init_cb = function () {
        var _submit_cb = function (_cancel_cb){
            try {
                var _new_class = _user.addClass($(ID(txt(__modal, "name"))).val());
                $(ID(modal(__modal))).modal('hide');
                updateClassSidebar();
                changeActiveClass(_new_class.getID());
            } catch (e) {
                $(ID(error_lbl(__modal))).text(e);
            }
            _cancel_cb();
        };
        setupModal(__modal, _submit_cb);
    };
    loadModal(__modal, _init_cb);
    $(ID(txt(__modal, "name"))).val("");
    displayModal(__modal);
}var _change_class_name_class;

function _displayChangeClassNameModal(_id) {
    var __modal = "change-class-name";
    var _init_cb = function (){
        var _submit_cb = function (_cancel_cb){
            try {
                _change_class_name_class.setName($(ID(txt(__modal, "newname"))).val());
                updateClassSidebar();
                if (_change_class_name_class.getID() == _active_class_id) {
                    $(ID("header-class-name")).text(_change_class_name_class.getName());
                }
                $(ID(modal(__modal))).modal('hide');
            } catch (e) {
                $(ID(error_lbl(__modal))).text(e);
            }
            _cancel_cb();
        };
        setupModal(__modal, _submit_cb);
    };
    loadModal(__modal, _init_cb);
    _change_class_name_class = _user.getClassById(_id);
    $(ID(txt(__modal, "newname"))).val(_change_class_name_class.getName());
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
}var Assign = function (__parent_class, __id, __name, __date_created, __date_due, __is_completed, __date_completed){

    this._parent_class = __parent_class;
    this._id = __id;
    this._name = __name;
    this._date_created = __date_created;
    this._date_due = __date_due;
    this._is_completed = __is_completed;
    this._date_completed = __date_completed;

    this.getID = function (){
        return this._id;
    };

    this.getName = function (){
        return this._name;
    }

    this.getDateCreated = function (){
        return this._date_completed;
    }

    this.getDateDue = function (){
        return this._date_due;
    }

    this.getIsCompleted = function (){
        return this._is_completed;
    }

    this.getDateCompleted = function (){
        return this._date_completed;
    }

    this.setName = function (new_name){
        this.modifyAssign(new_name, null, null);
        return this._name;
    };

    this.setDateDue = function (new_date_due){
        this.modifyAssign(null, new_date_due, null);
        return this._date_due;
    };

    this.setIsCompleted = function (new_is_completed){
        this.modifyAssign(null, null, new_is_completed);
        return this._is_completed;
    };

    this.modifyAssign = function (new_name, new_date_due, new_is_completed){
        var _res;
        var old_completed = this.getIsCompleted();
        var _success_cb = function (_response){
            _res = _response;
        };
        var _failure_cb = function (_error){
            throw _error;
        };
        performAssignUpdateRequest(this._id, new_name, new_is_completed, new_date_due, _success_cb, _failure_cb);
        this._name = _res['name'];
        this._date_created = new Date(_res['created']);
        this._date_due = new Date(_res['due']);
        this._is_completed = _res['completed'];
        if (_res['completed']) {
            this._date_completed = new Date(_res['date-completed']);
        } else {
            this._date_completed = null;
        }
        this._parent_class.updateAssignPeriod(this, this.getDuePeriod(), old_completed);

    };

    this.getDuePeriod = function (){
        var _today = new Date();
        var _assign = new Date(this._date_due);
        var _assignUTC = _assign.valueOf();
        var _todayUTC = _today.valueOf();
        var _delta = _assignUTC - _todayUTC;
        var _deltaDays = Math.floor(_delta / (1000 * 60 * 60 * 24)) + 1;
        if (_deltaDays < 0) {
            if (this._is_completed) {
                return "completed";
            } else {
                return "past-due";
            }
        } else if (_deltaDays == 0) {
            return "due-today";
        } else if (_deltaDays == 1) {
            return "due-tomorrow";
        } else if (_deltaDays < 7) {
            return "due-this-week";
        } else if (_deltaDays < 14) {
            return "due-next-week";
        } else if (_deltaDays < 28) {
            return "due-this-month";
        } else {
            return "due-after-this-month";
        }
    };

    this.forDuegroup = function (){
        if (this.getIsCompleted()) {
            return {
                "class-name": this._parent_class.getName(),
                "id": this.getID(),
                "due": this.getDateDue(),
                "name": this.getName(),
                "completed": this.getIsCompleted(),
                "created": this.getDateCreated(),
                "date-completed": this.getDateCompleted()};
        } else {
            return {
                "class-name": this._parent_class.getName(),
                "id": this.getID(),
                "due": this.getDateDue(),
                "name": this.getName(),
                "completed": this.getIsCompleted(),
                "created": this.getDateCreated()};
        }
    };

};//var _classes = [];

//var _active_class_idx = 0;
//var _active_class = {};

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

var Class = function (__parent_user, id, __name, assigns_due){

    this._parent_user = __parent_user;
    this._id = id;
    this._name = __name;
    this._total_assigns_due = assigns_due;
    this._active = undefined;
    this._assigns_due = undefined;
    this._assigns = undefined;
    
    this._assign_groups = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month'];
    this._assign_groups_with_completed = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    
    this.getID = function (){
        return this._id;
    };
    
    this.getName = function (){
        return this._name;
    };

    this.setName = function (new_name){
        this.modifyClass(new_name);
        return this._name;
    };
    
    this.getTotalAssignsDue = function (){
        return this._total_assigns_due;
    };
    
    this.getActive = function (){
        if (this._active != undefined) {
            return this._active;
        } else {
            this.updateClassGet();
            return this.getActive();
        }
    };

    this.getAssignsDue = function (_period){
        if (this._assigns_due != undefined) {
            return this._assigns_due[_period];
        } else {
            this.updateClassGet();
            return this.getAssignsDue(_period);
        }
    };

    this.getAssigns = function (_period){
        if (this._assigns != undefined) {
            return this._assigns[_period];
        } else {
            this.updateClassGet();
            return this.getAssigns(_period);
        }
    };
    
    this.updateClassGet = function (){
        var _res = null;
        
        var _success_cb = function (response){
            _res = response;
        };
        
        var _error_cb = function (error){
            throw error;
        };
        
        performClassGetRequest(this._id, _success_cb, _error_cb);
        
        if (_res != null) {

            this._active = _res['active'];
            this._assigns_due = {};
            this._assigns = {};

            //Parse Assignments Due
            for (var index = 0; index < this._assign_groups.length; index ++) {
                var _key = this._assign_groups[index];
                this._assigns_due[_key] = _res['assigns-due'][_key];
            }

            //Parse Assignments
            for (var index = 0; index < this._assign_groups_with_completed.length; index ++) {
                var _key = this._assign_groups_with_completed[index];
                this._assigns[_key] = [];
                var __assigns = _res['assigns'][_key];
                for (var assignIndex = 0; assignIndex < __assigns.length; assignIndex ++) {
                    var __assign = __assigns[assignIndex];
                    if (__assign['completed']) {
                        this._assigns[_key].push(new Assign(
                            this,
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            new Date(__assign['date-completed'])));
                    } else {
                        this._assigns[_key].push(new Assign(
                            this,
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            null));
                    }
                }

            }

        }
        
    };

    this.updateAssignPeriod = function (__assign, new_period, old_completed) {
        var cur_period = this.getPeriodForAssign(__assign);
        var filter_cb = function (e){
            return (e != __assign);
        };
        this._assigns[cur_period] = this._assigns[cur_period].filter(filter_cb);
        if (!old_completed) {
            this._assigns_due[cur_period] -= 1;
            this._total_assigns_due -= 1;
            this._parent_user.updateTotalAssignsDue(-1);
        }
        if (!__assign.getIsCompleted()) {
            this._assigns_due[new_period] += 1;
            this._total_assigns_due += 1;
            this._parent_user.updateTotalAssignsDue(1);
        }
        this._assigns[new_period].push(__assign);
    };

    this.getAssignByID = function (__id) {
        for (var periodIndex = 0; periodIndex < this._assign_groups_with_completed.length; periodIndex ++) {
            var period = this._assign_groups_with_completed[periodIndex];
            var assigns = this.getAssigns(period);
            for (var assignIndex = 0; assignIndex < assigns.length; assignIndex ++) {
                if (assigns[assignIndex].getID() == __id) {
                    return assigns[assignIndex];
                }
            }
        }
        return null;
    };

    this.getPeriodForAssign = function (__assign){
        for (var periodIndex = 0; periodIndex < this._assign_groups_with_completed.length; periodIndex ++) {
            var period = this._assign_groups_with_completed[periodIndex];
            var assigns = this.getAssigns(period);
            for (var assignIndex = 0; assignIndex < assigns.length; assignIndex ++) {
                if (assigns[assignIndex] == __assign) {
                    return period;
                }
            }
        }
        return null;
    };

    this.modifyClass = function (new_name) {
        var _res;
        var _success_cb = function (_response){
            _res = _response;
        };
        var _failure_cb = function (_error){
            throw _error;
        };
        performClassUpdateRequest(this._id, new_name, null, _success_cb, _failure_cb);
        this._name = new_name;
    };

    this.addAssign = function (__name, __date_due) {
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        performAssignCreateRequest(this.getID(), __name, __date_due, _success_cb, _error_cb);

        if (_res != null) {
            var _new_assign = new Assign(this, _res['id'], _res['name'], new Date(_res['created']), new Date(_res['due']), _res['completed'], null);
            var period = _new_assign.getDuePeriod();
            this._assigns[period].push(_new_assign);
            if (!_new_assign.getIsCompleted()) {
                this._assigns_due[period] += 1;
                this._total_assigns_due += 1;
                this._parent_user.updateTotalAssignsDue(1);
            }
            return _new_assign;
        } else {
            throw "Unable to create new assign (Client-Side).";
        }
    };

    this.forClassSidebar = function (){
        var _show_assigns_due = false;
        if (this.getTotalAssignsDue() > 0) {
            _show_assigns_due = true;
        }
        return {"id": this.getID(), "assigns-due": this.getTotalAssignsDue(), "name": this.getName(), "show-assigns-due": _show_assigns_due};
    };

    this.forAllDuegroup = function (_period){
        var __assigns_out = [];
        var __assigns = this.getAssigns(_period);
        for (var index = 0; index < __assigns.length; index ++) {
            __assigns_out.push(__assigns[index].forDuegroup());
        }
        return __assigns_out;
    };

    this.forDuegroup = function (_period){
        var __assigns = this.getAssigns(_period);
        var __incompleted_assigns = __assigns.filter(function (e){
            return !e.getIsCompleted();
        });
        var __completed_assigns = __assigns.filter(function (e){
            return e.getIsCompleted();
        });

        var _sort_function = function (a, b){
            return (a.getDateDue().valueOf() - b.getDateDue().valueOf());
        };

        __incompleted_assigns.sort(_sort_function);
        __completed_assigns.sort(_sort_function);

        var __assigns_out = [];
        for (var index = 0; index < __incompleted_assigns.length; index ++) {
            __assigns_out.push(__incompleted_assigns[index].forDuegroup());
        }
        for (var index = 0; index < __completed_assigns.length; index ++) {
            __assigns_out.push(__completed_assigns[index].forDuegroup());
        }
        return {"assigns-due": this.getAssignsDue(_period), "assigns": __assigns_out};
    };

    this.isThereClassesForDuegroup = function (_period){
        if (this.getAssigns(_period).length == 0) {
            return false;
        } else {
            return true;
        }
    };

};var User = function (display_name, email){
    
    this._display_name = display_name;
    this._email = email;
    this._total_assigns_due = undefined;
    this._active_classes = undefined;
    this._inactive_classes = undefined;
    
    this.getDisplayName = function (){
        return this._display_name;
    };
    
    this.getEmail = function (){
        return this._email;
    };
    
    this.updateClassList = function (){
        var _res = null;
        
        var _success_cb = function (response){
            _res = response;
        };
        
        var _error_cb = function (error){
            throw error;
        };
        
        performClassListRequest(_success_cb, _error_cb);
        
        if (_res != null) {
            this._total_assigns_due = _res['total-assigns-due'];
            this._active_classes = [];
            this._inactive_classes = [];
            for (var index = 0; index < _res['active'].length; index ++) {
                var _class = _res['active'][index];
                this._active_classes.push(new Class(this, _class['id'], _class['name'], _class['assigns-due']));
            }
            for (var index = 0; index < _res['inactive'].length; index ++) {
                var _class = _res['inactive'][index];
                this._inactive_classes.push(new Class(this, _class['id'], _class['name'], 0));
            }
        }
        
    };

    this.deleteClass = function (_class){
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        var _active = _class.getActive();
        var _assigns_due = _class.getAssignsDue();
        var _id = _class.getID();

        performClassDeleteRequest(_id, _success_cb, _error_cb);

        if (_res != null) {

            var _filter_cb = function (element){
                return (element.getID() != _id);
            };

            if (_active) {
                this._active_classes = this._active_classes.filter(_filter_cb);
                this._total_assigns_due -= _assigns_due;
            } else {
                this._inactive_classes = this._inactive_classes.filter(_filter_cb);
            }
        }

    };

    this.addClass = function (_name){
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        performClassCreateRequest(_name, _success_cb, _error_cb);

        if (_res != null) {
            var _new_class = new Class(this, _res['id'], _res['name'], 0);
            this._active_classes.push(_new_class);
            return _new_class;
        } else {
            throw "Unable to create new class (client-side).";
        }

    };

    this.getTotalAssignsDue = function (){
        if (this._total_assigns_due != undefined) {
            return this._total_assigns_due;
        } else {
            this.updateClassList();
            return this.getTotalAssignsDue();
        }
    };
    
    this.getActiveClasses = function (){
        if (this._active_classes != undefined) {
            return this._active_classes;
        } else {
            this.updateClassList();
            return this.getActiveClasses();
        }
    };
    
    this.getInactiveClasses = function (){
        if (this._inactive_classes != undefined) {
            return this._inactive_classes;
        } else {
            this.updateClassList();
            return this.getInactiveClasses();
        }
    };

    this.getClassById = function (_class_id){
        var __active_classes = this.getActiveClasses();
        for (var index = 0; index < __active_classes.length; index ++) {
            if (__active_classes[index].getID() == _class_id) {
                return __active_classes[index];
            }
        }
        var __inactive_classes = this.getInactiveClasses();
        for (var index = 0; index < __inactive_classes.length; index ++) {
            if (__inactive_classes[index].getID() == _class_id) {
                return __inactive_classes[index];
            }
        }
        return null;
    };

    this.getAssignById = function (_assign_id){
        var __active_classes = this.getActiveClasses();
        for (var index = 0; index < __active_classes.length; index ++) {
            var __assign = __active_classes[index].getAssignByID(_assign_id);
            if (__assign != null) {
                return __assign;
            }
        }
        return null;
    }

    this.updateTotalAssignsDue = function (_delta_total_assigns_due) {
        this._total_assigns_due += _delta_total_assigns_due;
    };

    this.forClassSidebar = function (){
        var __active_classes = this.getActiveClasses();
        var __active_classes_output = [];
        for (var index = 0; index < __active_classes.length; index ++) {
            __active_classes_output.push(__active_classes[index].forClassSidebar());
        }
        return {"total-assigns-due": this.getTotalAssignsDue(), "active": __active_classes_output};
    };

    this.forDuegroup = function(_period){
        var __active_classes = this.getActiveClasses();
        var __assigns = [];
        var __assigns_due = 0;
        for (var index = 0; index < __active_classes.length; index ++) {
            __assigns_due += __active_classes[index].getAssignsDue(_period);
            __assigns = __assigns.concat(__active_classes[index].forAllDuegroup(_period));
        }
        return {"assigns-due": __assigns_due, "assigns": __assigns};
    };
    
};