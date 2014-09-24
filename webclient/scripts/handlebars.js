function loadPartial(name) {
    var _text = "";
	$.ajax({
		url : _handlebars_url + name + '.handlebars',
		success : function(data) {
            _text = data;
		},
		async : false
	});
    return _text;
}

function initalizeHandlebars(_done_cb) {
    
    Handlebars.getTemplate = function(name) {
    	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
    		$.ajax({
    			url : _handlebars_url + name + '.handlebars',
    			success : function(data) {
    				if (Handlebars.templates === undefined) {
    					Handlebars.templates = {};
    				}
    				Handlebars.templates[name] = Handlebars.compile(data);
    			},
    			async : false
    		});
    	}
    	return Handlebars.templates[name];
    };
    
    // Register Handlebars Helpers
    Handlebars.registerHelper('checkbox', function (value){
        if (value) {
            return "<span class='assign-cb fa fa-check-square-o' id='" + this.id + "'></span>";
        } else {
            return "<span class='assign-cb fa fa-square-o' id='" + this.id + "'></span>";
        }
    });
    
    Handlebars.registerHelper('prettyDate', function (date){
        var _date = new Date(date);
        return _date.toLocaleDateString();
    });
    
    Handlebars.registerHelper('prettyDaysOverdue', function (date){
        var _today = new Date();
        var _assign = new Date(date);
        var _assignUTC = _assign.valueOf();
        var _todayUTC = _today.valueOf();
        var _delta = _todayUTC - _assignUTC;
        var _deltaDays = Math.floor(_delta / (1000 * 60 * 60 * 24));
        if (_deltaDays == 1) {
            return "(" + _deltaDays.toString() + " day overdue)";
        } else if (_deltaDays > 0) {
            return "(" + _deltaDays.toString() + " days overdue)";
        } else {
            return "";
        }
    });
    
    // Register Handlebars Partials
    Handlebars.registerPartial('assign_cb', loadPartial("assign_cb"));
    Handlebars.registerPartial('assign_name', loadPartial("assign_name"));
}