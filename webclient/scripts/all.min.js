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
        if (_status == "204") {
            _success_cb(JSON.parse(_response));
        } else {
            _failure_cb("");
        }
    };
    var _req = {"name": _name};
    performSyncAuthorizedAjaxRequest('POST', 'class/', _req, _cb);
}

function performAssignCreateRequest(_name, _date_due, _success_cb, _failure_cb) {
    var _cb = function (_status, _response){
        if (_status == "204") {
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
    performSyncAuthorizedAjaxRequest('POST', 'class/' + _id + '/assign/', _req, _cb);
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

    _user = undefined;

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
}var Assign = function (__id, __name, __date_created, __date_due, __is_completed, __date_completed){

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

    this.modifyAssign = function (new_name, new_date_due, new_is_completed) {
        var _res;
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
    };

};var _classes = [];

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

var Class = function (id, __name, assigns_due){
    
    this._id = id;
    this._name = __name;
    this._total_assigns_due = assigns_due;
    this._active = undefined;
    this._assigns_due = undefined;
    this._assigns = undefined;
    
    this._assign_groups = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month'];
    this._assign_groups_with_completed = this._assign_groups.push('completed');
    
    this.getID = function (){
        return this._id;
    };
    
    this.getName = function (){
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
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            new Date(__assign['date-completed'])));
                    } else {
                        this._assigns[_key].push(new Assign(
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
                this._active_classes.push(new Class(_class['id'], _class['name'], _class['assigns-due']));
            }
            for (var index = 0; index < _res['inactive'].length; index ++) {
                var _class = _res['inactive'][index];
                this._inactive_classes.push(new Class(_class['id'], _class['name'], 0));
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
            var _new_class = new Class(_res['id'], _res['name'], 0);
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
    
};