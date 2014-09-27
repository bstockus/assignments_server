var _active_class_id;

function updateClassSidebar() {
    var html = (Handlebars.getTemplate("class_sidebar"))(_user.forClassSidebar());
    $("#sidebar").html(html);

    if (_active_class_id === undefined && _user.getActiveClasses().length > 0) {
        _active_class_id = _user.getActiveClasses()[0].getID();
    }

    if (_user.getActiveClasses().length > 0) {

        if (_user.getClassById(_active_class_id) == null) {
            changeActiveClass(_user.getActiveClasses()[0].getID());
        }
    
        $(".class-li").bind('click', function (event){
            if (this.id != "all") {
                changeActiveClass(this.id);
            }
        });
        
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
    
    $(".class-li").hover(function (event) {
        $("#edit-btn-" + this.id).removeClass('hidden');
        $("#delete-btn-" + this.id).removeClass('hidden');
    }, function (event) {
        $("#edit-btn-" + this.id).addClass('hidden');
        $("#delete-btn-" + this.id).addClass('hidden');
    });
    
    $("#add-new-class-btn").click(function (event){
        _displayAddNewClassModal();
    });
}

function changeActiveClass(_new_active_class_id) {
    $(ID(_user.getClassById(_active_class_id).getID())).removeClass('active');
    _active_class_id = _new_active_class_id;
    $(ID(_user.getClassById(_active_class_id).getID())).addClass('active');
    refreshActiveClass();
}

function refreshClassSidebar() {
    updateClassSidebar();
}