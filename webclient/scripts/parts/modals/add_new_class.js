function _displayAddNewClassModal() {
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
}