var _change_class_name_id = "";

function displayChangeClassNameModal(_name, _id) {
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
    $(ID(txt(__modal, "newnamw"))).val(_name);
    displayModal(__modal);
}