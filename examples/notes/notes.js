(function(window) {
    template.isEscape = false;

    if (!window.navigator.standalone) {
        document.body.innerHTML = template.render('installTmpl');
        var icon = document.querySelector('.install img');
        var h2 = document.querySelector('.install h2');
        var top = (window.innerHeight - 72) / 2 - 30;
        setTimeout(function() {
            icon.style.cssText = 'top:' + top + 'px;width:72px;height:72px;opacity:1;-webkit-transition:top 400ms, width 400ms, height 400ms, opacity 300ms;';
            setTimeout(function() {
                h2.style.top = (top + 75) + 'px';
                h2.style.webkitTransition = 'opacity 300ms';
                h2.style.opacity = '1';
            }, 300);
        }, 0);
        return;
    }

    var localStorage = window.localStorage,
        noteArr = JSON.parse(localStorage.getItem('ibox/notes/list')) || [],
        lastEditIndex,
        mainBox;

    window.Notes = {
        addHandler: function() {
            lastEditIndex = undefined;
            mainBox.slide(Notes.editNode, {
                beforeShow: function(view) {
                    view.title.innerHTML = 'New Note';
                    view.createEl.innerHTML = 'Today';
                    view.nowEl.innerHTML = moment().format('MMMM Do, HH:mm');
                    view.texta.value = '';
                }
            });
        },

        editNode: {
            id: 'note-edit',
            single: true,
            title: 'New Note',
            cls: 'note-edit',
            iscroll: false,
            leftButton: {
                text: 'Notes',
                back: true,
                handler: backMain
            },
            rightButton: {
                text: 'Done',
                handler: saveNote
            },
            onRender: function() {
                var me = this;
                me.wrapper.innerHTML = template.render('noteEditTmpl', {
                    create: 'Today',
                    now: moment().format('MMMM Do, HH:mm')
                });
                me.texta = me.wrapper.querySelector('textarea');
                me.createEl = me.wrapper.querySelector('.create');
                me.nowEl = me.wrapper.querySelector('.now');

                me.texta.addEventListener('input', function() {
                    mainBox.resizeLocked = true;
                    clearTimeout(me.textTypeTimeout);
                    me.textTypeTimeout = setTimeout(function() {
                        mainBox.resizeLocked = false;
                    }, 500);
                }, false);
            },
            onResize: function(w, h) {
                this.texta.style.width = (w - 30) + 'px';
                this.texta.style.height = (h - 45) + 'px';
            },
            onDestroy: function() {
                this.texta = null;
            }
        }
    };

    function saveNote() {
        var val = this.texta.value;
        if (!mainBox.sliding && !this.saving && val) {
            this.saving = true;
            var note = {
                content: val,
                create: Date.now()
            };
            if (typeof lastEditIndex !== 'undefined') {
                noteArr.splice(lastEditIndex, 1);
            }
            noteArr.push(note);
            localStorage.setItem('ibox/notes/list', JSON.stringify(noteArr));
            lastEditIndex = undefined;
            this.texta.value = '';
            backMain(true);
        } else {
            this.rightButton.classList.remove('highlighted');
        }
    }

    function backMain(scrollBottom) {
        mainBox.slide({
            id: 'note-main',
            reverse: true
        }, {
            beforeShow: function(view) {
                updateNotes(view);
            },
            onShow: function(view) {
                if (scrollBottom === true) {
                    view.iscroll.scrollTo(0, 0, 300);
                }
            },
            onHide: function(view) {
                view.saving = false;
            }
        });
    }

    function onNoteClick(li) {
        if (li.className.indexOf('delete') == -1) {
            lastEditIndex = li.getAttribute('data-index');
            li.classList.add('highlighted');
            mainBox.slide(Notes.editNode, {
                beforeShow: function(view) {
                    var note = noteArr[lastEditIndex];
                    view.title.innerHTML = note.content;
                    view.createEl.innerHTML = moment(note.create).fromNow();
                    view.nowEl.innerHTML = moment().format('MMMM Do, HH:mm');
                    view.texta.value = note.content;
                }
            });
        }
    }

    function onNoteDeleteClick(btn) {
        var view = mainBox.getView('note-main'),
            li = btn.parentNode.parentNode,
            index = parseInt(btn.parentNode.parentNode.getAttribute('data-index'));
        noteArr.splice(index, 1);
        localStorage.setItem('ibox/notes/list', JSON.stringify(noteArr));
        li.parentNode.removeChild(li);
        updateNotes(view);
    }

    function updateNotes(view) {
        view.wrapper.innerHTML = template.render('noteMainTmpl', convertNotes());
        view.title.innerHTML = 'Notes' + (noteArr.length > 0 ? (' (' + noteArr.length + ')') : '');
        mainBox.resize();
    }

    function createClickHandler(selector, fn) {
        return function(e) {
            var cells = e.currentTarget.querySelectorAll(selector), i, len, cell;
            for (i = 0, len = cells.length; i < len; i++) {
                cell = cells[i];
                if (cell.contains(e.target)) {
                    fn && fn.call(window, cell);
                    return;
                }
            }
        };
    }

    var touchCoords, touchMoveHorizontal, lastDeleteLi;

    function onTouchStart(e) {
        var el = e.currentTarget;
        el.addEventListener('touchmove', onTouchMove, false);
        el.addEventListener('touchend', onTouchEnd, false);

        touchMoveHorizontal = undefined;
        touchCoords = {};
        touchCoords.startX = e.touches[0].pageX;
        touchCoords.startY = e.touches[0].pageY;
    }

    function onTouchMove(e) {
        if (!touchCoords) {
            return;
        }
        touchCoords.stopX = e.touches[0].pageX;
        touchCoords.stopY = e.touches[0].pageY;

        var offsetX = touchCoords.startX - touchCoords.stopX,
            offsetY = touchCoords.startY - touchCoords.stopY,
            absX = Math.abs(offsetX),
            absY = Math.abs(offsetY);

        if (typeof touchMoveHorizontal !== 'undefined') {
            offsetX != 0 && e.preventDefault();
        } else {
            if (absX > absY) {
                touchMoveHorizontal = true;
                e.preventDefault();
            } else {
                touchCoords = null;
            }
        }
    }

    function onTouchEnd(e) {
        var el = e.currentTarget;
        el.removeEventListener('touchmove', onTouchMove, false);
        el.removeEventListener('touchend', onTouchEnd, false);
        if (!touchCoords) {
            return;
        }

        var offsetX = touchCoords.startX - touchCoords.stopX || 0;
        if (offsetX != 0) {
            var cells = e.currentTarget.querySelectorAll('li'), i, len, cell;
            for (i = 0, len = cells.length; i < len; i++) {
                cell = cells[i];
                if (cell.contains(e.target)) {
                    if (cell.className.indexOf('delete') != -1) {
                        lastDeleteLi = null;
                        cell.classList.remove('delete');
                    } else {
                        if (lastDeleteLi) {
                            lastDeleteLi.classList.remove('delete');
                        }
                        lastDeleteLi = cell;
                        cell.classList.add('delete');
                    }
                    return;
                }
            }
        }
    }

    function convertNotes() {
        var arr = [];
        noteArr.forEach(function(note, i) {
            arr.unshift({
                index: i,
                content: note.content,
                create: moment(note.create).calendar().split(' ')[0]
            });
        });
        return { notes: arr };
    }

    function main() {
        mainBox = new iBox(document.querySelector('.ibox'));
        var view = mainBox.getView('note-main'),
            wrapper = view.wrapper;
        updateNotes(view);
        wrapper.addEventListener('click', createClickHandler('li', onNoteClick), false);
        wrapper.addEventListener('click', createClickHandler('li button', onNoteDeleteClick), false);
        wrapper.addEventListener('touchstart', onTouchStart, false);
    }
    document.addEventListener('DOMContentLoaded', function() { setTimeout(main, 200); }, false);
})(window);