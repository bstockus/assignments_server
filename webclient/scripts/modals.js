var _change_class_name_id = "";
var _add_new_assignment_class_id = "";

function hide(_id) {
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

function initializeAddNewClassModal() {
    var __modal = "add-new-class";
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
}

function initializeChangeClassNameModal() {
    var __modal = "change-class-name";
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
}

function initializeAddNewAssignmentModal() {
    var __modal = "add-new-assignment";
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
}

function displayModal(_modal_name) {
    unhide(btn(_modal_name, "submit"));
    unhide(btn(_modal_name, "cancel"));
    hide(span(_modal_name, "progress"));
    $(ID(lbl(_modal_name, "error"))).text("");
    $(ID(modal(_modal_name))).modal('show');
}

function displayAddNewClassModal() {
    var _modal = "add-new-class";
    $(ID(txt(_modal, "name"))).val("");
    displayModal(_modal);
}

function displayChangeClassNameModal(_name, _id) {
    var _modal = "change-class-name";
    _change_class_name_id = _id;
    $(ID(txt(_modal, "oldname"))).text(_name)
    $(ID(txt(_modal, "newnamw"))).val(_name);
    displayModal(_modal);
}

function displayAddNewAssignmentModal(_class_name, _class_id) {
    var _modal = "add-new-assignment";
    var _date = new Date();
    var _day = _date.getDate();
    var _month = _date.getMonth() + 1;
    var _year = _date.getFullYear();
    _add_new_assignment_class_id = _class_id;
    $(ID(txt(_modal, "class"))).text(_class_name)
    $(ID(txt(_modal, "name"))).val("");
    $(ID(select(_modal, "day-due"))).val(_day.toString());
    $(ID(select(_modal, "month-due"))).val(_month.toString());
    $(ID(txt(_modal, "year-due"))).val(_year.toString());
    displayModal(_modal);
}