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

function displayAddNewClassModal() {
    var _modal = "add-new-class";
    $(ID(txt(_modal, "name"))).val("");
    displayModal(_modal);
}