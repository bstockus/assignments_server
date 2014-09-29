var _active_class_id = 'all';

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
            if (this.id != "all") {
                changeActiveClass(this.id);
            }
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
}