

window.ModuleLoader.define_module('magazines_init', function() {
    const read = ["freak_6", "freak_13"];
    for (const magazine_issue_id of read) {
        $("#magazine_" + magazine_issue_id + " .magazine_is_read").show()
    }
});

window.ModuleLoader.run_modules();