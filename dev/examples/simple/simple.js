document.addEventListener('DOMContentLoaded', function() {
    template.isEscape = false;

    var box = new iBox();

    box.slide({
        id: 'settings',
        single: true,
        header: 'Settings',
        onRender: function() {
            this.scroller.innerHTML = template.render('settings-tmpl');
        }
    });

    document.body.addEventListener('click', function onBodyClick(e) {
        var cell = e.target;
        if (cell.parentNode.className.indexOf('cell') != -1) {
            cell = cell.parentNode;
        }
        if (cell.className.indexOf('cell') != -1) {
            box.slide({
                header: {
                    title: cell.children[0].innerHTML,
                    leftButton: {
                        text: 'Settings',
                        handler: function() {
                            box.slide('settings', true);
                        }
                    }
                },
                onRender: function() {
                    this.scroller.innerHTML = template.render('general-tmpl');
                }
            });
        }
    }, false);

}, false);