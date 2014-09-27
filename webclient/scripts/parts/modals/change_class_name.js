var _change_class_name_class;

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
}