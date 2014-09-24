var _add_new_assignment_class_id = "";

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