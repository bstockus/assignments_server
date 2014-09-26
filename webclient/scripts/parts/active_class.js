function updateActiveClass() {
    
    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, true];
    
    var html = (Handlebars.getTemplate("main_header"))(_active_class);
    
    for (var idx = 0; idx < ids.length; idx ++) {
        var id = ids[idx];
        var title = titles[idx];
        var show_due_date = show_due_dates[idx];
        
        var obj = {'id': id, 'title': title, 'assigns': _active_class['assigns'][id], 'assigns-due': _active_class['assigns-due'][id], 'show-due-dates': show_due_date};
        
        html += (Handlebars.getTemplate("duegroup"))(obj);
        
    }
    
    $("#main").html(html);
    
    $(".unchecked").hover(function (event){
        $(".assign-cb#" + this.id).removeClass('fa-square').addClass('fa-check-square-o');
    }, function (event){
        $(".assign-cb#" + this.id).addClass('fa-square').removeClass('fa-check-square-o');
    });
    
    $(".unchecked").click(function (event){
        var _id = this.id;
        
    });
    
    $(".assign-name").popover();
    
    $("#add-new-assign-btn").click(function (event){
        var active_class_id = _classes['active'][_active_class_idx]['id'];
        var active_class_name = _classes['active'][_active_class_idx]['name'];
        displayAddNewAssignmentModal(active_class_name, active_class_id);
    });
}

function refreshActiveClass() {
    var activeClassId = _active_class_id;
    //Reload the Active Class Data
    var cb = function(status, response) {
        if (status = "200") {
            _active_class = JSON.parse(response);
            updateActiveClass();
        }
    };
    performAuthorizedAjaxRequest('GET', 'class/' + activeClassId, {}, "", cb);
}