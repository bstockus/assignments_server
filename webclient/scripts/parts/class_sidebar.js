function updateClassSidebar() {
    var html = _template_sidebar(_classes);
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
}