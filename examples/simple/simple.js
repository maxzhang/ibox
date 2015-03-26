document.addEventListener('DOMContentLoaded', function() {
    template.isEscape = false;

    var box = new iBox(document.body);

    box.slide({
        id: 'first-view',
        title: 'iPhone 帮助',
        single: true,
        silent: true,
        scrollConfig: {
            onScrollStart: function() {
                clearSelected();
            }
        },
        onRender: function() {
            this.wrapper.innerHTML = template.render('firstViewTmpl');

            this.onCellClickHandler = createCellHandler(function(cell) {
                cell.classList.add('selected');
                box.slide({
                    title: cell.children[1].innerHTML,
                    leftButton: {
                        text: 'iPhone 帮助',
                        back: true,
                        handler: backFirstView
                    },
                    onRender: function() {
                        this.wrapper.innerHTML = template.render('secondViewTmpl');
                    }
                });
            });
            this.el.addEventListener('click', this.onCellClickHandler, false);
        },
        beforeDestroy: function() {
            this.el.removeEventListener('click', this.onCellClickHandler, false);
        }
    });

    function backFirstView() {
        box.slide({
            id: 'first-view',
            reverse: true
        }, {
            beforeShow: function() {
                clearSelected();
            }
        });
    }

    function createCellHandler(fn) {
        return function(e) {
            var cells = e.currentTarget.querySelectorAll('.cell'), i, len, cell;
            for (i = 0, len = cells.length; i < len; i++) {
                cell = cells[i];
                if (cell.contains(e.target)) {
                    fn && fn.call(window, cell);
                    return;
                }
            }
        };
    }

    function clearSelected() {
        var firstView = box.getView('first-view'),
            cells = firstView.el.querySelectorAll('.cells > .selected'), i, len, cell;
        for (i = 0, len = cells.length; i < len; i++) {
            cell = cells[i];
            cell.classList.remove('selected');
        }
    }

}, false);