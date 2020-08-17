
let init_modules = {};

function isDict(obj) {
    return (obj.constructor == Object)
}

class ViewHistoryManager {
    constructor(magazine_id) {
      this.magazine_id = magazine_id;
      this.view_history = this.read_history();
    }

    get storage_key() {
        return "view_history_" + this.magazine_id;
    }

    write_history() {
        window.localStorage.setItem(this.storage_key,  JSON.stringify(this.view_history));
    }

    read_history() {
        let res;

        try {
            res = JSON.parse(window.localStorage.getItem(this.storage_key));
            if (!isDict(res)) {
                throw "Error: Expecting dictionary!";
            }
        }
        catch (err) {
            res = {}; // Using dictionary instead of array for O(1) search complexity
        }

        return res;
    }

    is_viewed(issue_id) {
        return issue_id in this.view_history;
    }

    mark_as_viewed(issue_id) {
        if (!this.is_viewed(issue_id)) {
            this.view_history[issue_id] = 1;
            this.write_history();
        }
    }

    mark_as_not_viewed(issue_id) {
        if (this.is_viewed(issue_id)) {
            delete this.view_history[issue_id];
            this.write_history();
        }
    }

    get viewed_issues() {
        return [...Object.keys(this.view_history)];
    }
}

init_modules['magazines_init'] =  function() {
    const issue_prefix = "issue_";
    vhm = new ViewHistoryManager(magazine_id);

    $("#magazines_container .magazine-card").mousedown(function(e) {
        // We don't simply use "click" since it doesn't catch middle-click
        switch(e.which)
        {
            case 1: // Left Click
            case 2: // Middle Click
                const obj = $(this);
                const issue_id = obj.attr('id').replace(issue_prefix, "");
                if (!vhm.is_viewed(issue_id))
                {
                    vhm.mark_as_viewed(issue_id);
                    setTimeout(function(){
                        obj.addClass("is_read");
                    }, 500);
                    
                }
            break;
        }        
    });

    $("#magazines_container .view_indicator").click(function(e){
        e.preventDefault();
    });

    for (const issue_id of vhm.viewed_issues) {
        $("#" + issue_prefix + issue_id).addClass("is_read");
    }

    const mark_as_unread = function(issue_id) {
        vhm.mark_as_not_viewed(issue_id);
        setTimeout(function(){
            $("#" + issue_prefix + issue_id).removeClass("is_read");
        }, 100);
    }

    $('#magazines_container .view_indicator').popover({
        title: 'מגזין זה נקרא בעבר', 
        placement: 'top',
        //content: '<div class="text-center"><a href="javascript:void(0);" onclick="javascript:mark_as_unread">[הסר סימון]</a></div>',
        content: function() {
            const issue_id = $(this).parents(".magazine-card:first").attr('id').replace(issue_prefix, "");
            const a = $("<a href='javascript:void(0);'>[הסר סימון]</a>").click(function(){mark_as_unread(issue_id)});
            const div = $("<div class='text-center'></div>").append(a);
            return div;
        },
        
        html: true,
        trigger: "manual",
        html: true,
        animation: true
    })
    .on("mouseenter", function() {
        var _this = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function() {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function() {
        var _this = this;
        setTimeout(function() {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 300);
    });
};

if (typeof(js_module_init) != "undefined") {
    init_modules[js_module_init]();
}
