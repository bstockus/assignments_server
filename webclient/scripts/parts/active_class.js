function updateActiveClass() {

    var _active_class = _user.getClassById(_active_class_id);

    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, false];
    var show_assigns_dues = [true, true, true, true, true, true, true, false];
    
    var html = (Handlebars.getTemplate("main_header"))({"name": _active_class.getName(), "id": _active_class.getID()});
    
    for (var idx = 0; idx < ids.length; idx ++) {
        var obj = _active_class.forDuegroup(ids[idx]);
        obj['id'] = ids[idx];
        obj['title'] = titles[idx];
        obj['show-due-dates'] = show_due_dates[idx];
        obj['show-assigns-due'] = show_assigns_dues[idx];
        
        html += (Handlebars.getTemplate("duegroup"))(obj);
        
    }
    
    $("#main").html(html);

    updateClassEditAndDeleteBtns();
    updateAddNewClassBtn();

    $(".unchecked").hover(function (event){
        $(".assign-cb#" + this.id).removeClass('fa-square').addClass('fa-check-square-o');
    }, function (event){
        $(".assign-cb#" + this.id).addClass('fa-square').removeClass('fa-check-square-o');
    });
    
    $(".unchecked").click(function (event){
        var _id = this.id;
        var _assign = _user.getClassById(_active_class_id).getAssignByID(_id);
        _assign.setIsCompleted(true);
        updateActiveClass();
        $("span.badge#" + _active_class_id).text(_user.getClassById(_active_class_id).getTotalAssignsDue());
        $("#total-assigns-due-badge").text(_user.getTotalAssignsDue());
    });

    $(".checked").click(function (event){
        var _id = this.id;
        var _assign = _user.getClassById(_active_class_id).getAssignByID(_id);
        _assign.setIsCompleted(false);
        updateActiveClass();
        $("span.badge#" + _active_class_id).text(_user.getClassById(_active_class_id).getTotalAssignsDue());
        $("#total-assigns-due-badge").text(_user.getTotalAssignsDue());
    });
    
    $(".assign-name").popover();
    
    $(".add-new-assign-btn").click(function (event){
        _displayAddNewAssignmentModal();
    });
}

function refreshActiveClass() {
    updateActiveClass();
}