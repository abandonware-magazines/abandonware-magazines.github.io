
let init_modules = {};

function isDict(obj) {
    return (obj.constructor == Object)
}

/*
 * Returns an array of keys which are in base_obj but not in compare_obj
 */ 
function objKeyDiff(base_obj, compare_obj) {
    const res = []

    Object.keys(base_obj).forEach(key => {
        if (!(key in compare_obj)) {
            res.push(key)
        }
    });
    return res;
}

class ViewHistoryManager {
    constructor(magazine_id) {
        this.magazine_id = magazine_id;
        this.view_history = this._read_history();
        const vhm = this;

        $(window).bind('storage', function (e) {
            if (e.originalEvent.key == vhm._storage_key)
            {
                const old_history = vhm._parse_history(e.originalEvent.oldValue);
                const new_history = vhm._parse_history(e.originalEvent.newValue);
                vhm.view_history = new_history;
                const removed_entries =  objKeyDiff(old_history, new_history);
                const added_entries =  objKeyDiff(new_history, old_history);
                $(window).trigger( "history_changed", [vhm. magazine_id, added_entries, removed_entries ] );
            }
        });
    }

    get _storage_key() {
        return "view_history_" + this.magazine_id;
    }

    _parse_history(history) {
        let res;

        try {
            res = JSON.parse(history);
            if (!isDict(res)) {
                throw "Error: Expecting dictionary!";
            }
        }
        catch (err) {
            res = {}; // Using dictionary instead of array for O(1) search complexity
        }

        return res;
    }

    _write_history() {
        window.localStorage.setItem(this._storage_key,  JSON.stringify(this.view_history));
    }

    _read_history() {
        return this._parse_history(window.localStorage.getItem(this._storage_key))
    }

    is_viewed(issue_id) {
        return issue_id in this.view_history;
    }

    mark_as_viewed(issue_id) {
        if (!this.is_viewed(issue_id)) {
            this.view_history[issue_id] = 1;
            this._write_history();
        }
    }

    mark_as_not_viewed(issue_id) {
        if (this.is_viewed(issue_id)) {
            delete this.view_history[issue_id];
            this._write_history();
        }
    }

    get viewed_issues() {
        return [...Object.keys(this.view_history)];
    }
}

init_modules['magazines_init'] =  function() {
    $("#magazines_container img.lazyload").lazyload();

    const vhm = {};

    for (const magazine_id of magazine_ids.split(",")) {
        vhm[magazine_id] = new ViewHistoryManager(magazine_id);
    }

    $("#magazines_container .magazine-card").mousedown(function(e) {
        // We don't simply use "click" since it doesn't catch middle-click
        switch(e.which)
        {
            case 1: // Left Click
            case 2: // Middle Click
                const obj = $(this);
                const [magazine_id, issue_id] = obj.attr('id').split("_");
                if (!vhm[magazine_id].is_viewed(issue_id))
                {
                    vhm[magazine_id].mark_as_viewed(issue_id);
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

    $(window).on( "history_changed", function( event, magazine_id, read_issues, unread_issues ) {
        for (const issue_id of read_issues) {
            $("#" + magazine_id + "_" + issue_id).addClass("is_read");
        }
        for (const issue_id of unread_issues) {
            $("#" + magazine_id + "_" + issue_id).removeClass("is_read");
        }
    });

    for (const magazine_id in vhm) {
        $(window).trigger( "history_changed", [ magazine_id, vhm[magazine_id].viewed_issues, [] ] );
    }

    const mark_as_unread = function(magazine_id, issue_id) {
        vhm[magazine_id].mark_as_not_viewed(issue_id);
        setTimeout(function(){
            $("#" + magazine_id + "_" + issue_id).removeClass("is_read");
        }, 100);
    }

    $('#magazines_container .view_indicator').popover({
        title: 'מגזין זה נקרא בעבר', 
        placement: 'top',
        //content: '<div class="text-center"><a href="javascript:void(0);" onclick="javascript:mark_as_unread">[הסר סימון]</a></div>',
        content: function() {
            const [magazine_id, issue_id] = $(this).parents(".magazine-card:first").attr('id').split("_");
            const a = $("<a href='javascript:void(0);'>[הסר סימון]</a>").click(function(){mark_as_unread(magazine_id, issue_id)});
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
