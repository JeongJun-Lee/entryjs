"use strict";

goog.provide("Entry.BlockMenu");

goog.require("Entry.Dom");
goog.require("Entry.Model");
goog.require("Entry.Utils");

/*
 *
 * @param {object} dom which to inject playground
 */
Entry.BlockMenu = function(dom, align, categoryData, scroll) {
    Entry.Model(this, false);

    this.reDraw = Entry.Utils.debounce(this.reDraw, 100);
    this._dAlign = Entry.Utils.debounce(this.align, 50);

    this._align = align || "CENTER";
    this.setAlign(this._align);
    this._scroll = scroll !== undefined ? scroll : false;
    this._bannedClass = [];
    this._categories = [];
    this.suffix = 'blockMenu';
    this._isSelectingMenu = false;

    if (typeof dom === "string") dom = $('#' + dom);
    else dom = $(dom);

    if (dom.prop("tagName") !== "DIV")
        return console.error("Dom is not div element");

    this.view = dom;

    this.visible = true;
    this._svgId = 'blockMenu' + new Date().getTime();
    this._clearCategory();
    this._categoryData = categoryData;
    this._generateView(categoryData);


    this._splitters = [];
    this.setWidth();

    this.svg = Entry.SVG(this._svgId);
    Entry.Utils.addFilters(this.svg, this.suffix);
    var returnVal = Entry.Utils.addBlockPattern(this.svg, this.suffix);
    this.pattern = returnVal.pattern;

    this.svgGroup = this.svg.elem("g");

    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;

    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;

    this.changeEvent = new Entry.Event(this);

    this.observe(this, "_handleDragBlock", ["dragBlock"]);

    this.changeCode(new Entry.Code([]));
    categoryData && this._generateCategoryCodes()

    if (this._scroll) {
        this._scroller = new Entry.BlockMenuScroller(this);
        this._addControl(dom);
    }

    if (Entry.documentMousedown)
        Entry.documentMousedown.attach(this, this.setSelectedBlock);
    if (this.code && Entry.keyPressed)
        Entry.keyPressed.attach(this, this._captureKeyEvent);
    if (Entry.windowResized) {
        var dUpdateOffset = _.debounce(this.updateOffset, 200);
        Entry.windowResized.attach(this, dUpdateOffset);
    }
};

(function(p) {
    var splitterHPadding = 20;
    p.schema = {
        code: null,
        dragBlock: null,
        closeBlock: null,
        selectedBlockView: null
    };

    p._generateView = function(categoryData) {
        var parent = this.view;
        var that = this;

        if (categoryData) {
            this._categoryCol = Entry.Dom('ul', {
                class: 'entryCategoryListWorkspace',
                parent: parent
            });

            this._generateCategoryView(categoryData);
        }

        this.blockMenuContainer = Entry.Dom('div', {
            'class':'blockMenuContainer',
            'parent':parent
        });

        this.svgDom = Entry.Dom(
            $('<svg id="' + this._svgId +'" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'),
            { parent: this.blockMenuContainer }
        );

        this.svgDom.mouseenter(function(e) {
            if (that._scroller) that._scroller.setOpacity(1);

            var selectedBlockView = that.workspace.selectedBlockView;
            if (!Entry.playground || Entry.playground.resizing ||
                (selectedBlockView && selectedBlockView.dragMode === Entry.DRAG_MODE_DRAG)) return;
            Entry.playground.focusBlockMenu = true;
            var bBox = that.svgGroup.getBBox();
            var expandWidth = bBox.width + bBox.x + 64;
            if (expandWidth > Entry.interfaceState.menuWidth) {
                this.widthBackup = Entry.interfaceState.menuWidth - 64;
                $(this).stop().animate({
                    width: expandWidth - 62
                }, 200);
            }
        });

        this.svgDom.mouseleave(function(e) {
            if (!Entry.playground || Entry.playground.resizing) return;

            if (that._scroller)
                that._scroller.setOpacity(0);

            var widthBackup = this.widthBackup;
            if (widthBackup)
                $(this).stop().animate({
                    width: widthBackup
                }, 200);
            delete this.widthBackup;
            delete Entry.playground.focusBlockMenu;
        });

        $(window).scroll(function() {
            that.updateOffset();
        });
    };

    p.changeCode = function(code) {
        if (!(code instanceof Entry.Code))
            return console.error("You must inject code instance");
        if (this.codeListener)
            this.code.changeEvent.detach(this.codeListener);
        var that = this;
        this.set({code:code});
        this.codeListener = this.code.changeEvent.attach(
            this,
            function() {that.changeEvent.notify();}
        );
        code.createView(this);
        var workspace = this.workspace;
        var mode = Entry.Workspace.MODE_BOARD;
        if (workspace)
            mode = workspace.getMode();

        if (mode === Entry.Workspace.MODE_VIMBOARD) {
            this.renderText();
        } else {
            if (code.mode === 'text')
                this.renderBlock();
        }

        this._dAlign();
    };

    p.bindCodeView = function(codeView) {
        this.svgBlockGroup.remove();
        this.svgThreadGroup.remove();
        this.svgBlockGroup = codeView.svgBlockGroup;
        this.svgThreadGroup = codeView.svgThreadGroup;
        this.svgGroup.appendChild(this.svgThreadGroup);
        this.svgGroup.appendChild(this.svgBlockGroup);
        if (this._scroller)
            this.svgGroup.appendChild(this._scroller.svgGroup);
    };

    p.align = function(unReDraw) {
        var code = this.code;
        if (!code) return;
        this._clearSplitters();

        var threads = code.getThreads();
        var vPadding = 15,
            marginFromTop = 10,
            hPadding = this._align == 'LEFT' ? 10 : this.svgDom.width()/2;

        var pastClass;
        for (var i=0,len=threads.length; i<len; i++) {
            var thread = threads[i];
            var block = thread.getFirstBlock();
            if (!block) continue;
            var blockView = block.view;

            var blockInfo = Entry.block[block.type];
            if(this.checkCategory(blockInfo) || this.checkBanClass(blockInfo)) {
                blockView.set({display:false});
                continue;
            }

            blockView.set({display:true});
            if (code.view && !unReDraw && !this._isSelectingMenu)
                blockView.reDraw();

            var className = blockInfo.class;
            if (pastClass && pastClass !== className) {
                this._createSplitter(marginFromTop);
                marginFromTop += vPadding;
            }
            pastClass = className;

            var left = hPadding - blockView.offsetX;
            if (this._align == 'CENTER') left -= blockView.width /2;

            marginFromTop -= blockView.offsetY;
            blockView._moveTo(
                left,
                marginFromTop,
                false);
            marginFromTop += blockView.height + vPadding;
        }

        this.updateSplitters();
        this.changeEvent.notify();
    };

    p.cloneToGlobal = function(e) {
        if (this._boardBlockView) return;
        if (this.dragBlock === null) return;

        var globalSvg = Entry.GlobalSvg;
        var workspace = this.workspace;
        var workspaceMode = workspace.getMode();
        var blockView = this.dragBlock;

        var svgWidth = this._svgWidth;

        var board = workspace.selectedBoard;

        if (board && (workspaceMode == Entry.Workspace.MODE_BOARD ||
                      workspaceMode == Entry.Workspace.MODE_OVERLAYBOARD)) {
            if (!board.code) return;

            var block = blockView.block;
            var code = this.code;
            var currentThread = block.getThread();
            if (block && currentThread) {
                var threadJSON = currentThread.toJSON(true);
                this._boardBlockView = Entry.do("addThread", threadJSON).value
                    .getFirstBlock().view;

                var offset = this.offset();
                var distance = offset.top - board.offset().top - $(window).scrollTop();

                var dx, dy;

                var mouseDownCoordinate = this.dragBlock.mouseDownCoordinate;

                if (mouseDownCoordinate) {
                    dx = e.pageX - mouseDownCoordinate.x;
                    dy = e.pageY - mouseDownCoordinate.y;
                }

                this._boardBlockView._moveTo(
                    blockView.x - svgWidth + (dx || 0),
                    blockView.y + distance + (dy || 0),
                    false
                );
                this._boardBlockView.onMouseDown.call(this._boardBlockView, e);
                this._boardBlockView.dragInstance.set({isNew:true});
            }
        } else {
            if(Entry.GlobalSvg.setView(blockView, workspace.getMode()))
                Entry.GlobalSvg.addControl(e);
        }
    };

    p.terminateDrag = function() {
        if (!this._boardBlockView) return;

        var boardBlockView = this._boardBlockView;
        if (!boardBlockView) return;
        var thisCode = this.code;
        var workspace = this.workspace;
        var boardCode = workspace.getBoard().code;

        this._boardBlockView = null;

        //board block should be removed below the amount of range
        var blockLeft = Entry.GlobalSvg.left;
        var width = Entry.GlobalSvg.width/2;
        var boardLeft = boardBlockView.getBoard().offset().left;
        return blockLeft < boardLeft - width;
    };

    p.getCode = function(thread) {return this.code;};

    p.setSelectedBlock = function(blockView) {
        var old = this.selectedBlockView;

        if (old) old.removeSelected();

        if (blockView instanceof Entry.BlockView) {
            blockView.addSelected();
        } else blockView = null;

        this.set({selectedBlockView:blockView});
    };

    p.hide = function() {this.view.addClass('entryRemove');};

    p.show = function() {this.view.removeClass('entryRemove');};

    p.renderText = function(cb) {
        var threads = this.code.getThreads();
        this.code.mode = 'text';
        for (var i=0; i<threads.length; i++) {
            var thread = threads[i];
            if (thread.view)
                thread.view.renderText();
            else
                thread.createView(this, Entry.Workspace.MODE_VIMBOARD)
        }
        cb && cb();
    };

    p.renderBlock = function(cb) {
        var threads = this.code.getThreads();
        this.code.mode = 'code';
        for (var i=0; i<threads.length; i++) {
            var thread = threads[i];
            if (thread.view)
                thread.view.renderBlock();
            else
                thread.createView(this, Entry.Workspace.MODE_BOARD)
        }

        cb && cb();
    };

    p._createSplitter = function(topPos) {
        var width = this._svgWidth;
        var svgBlockGroup = this.svgBlockGroup;
        var line = svgBlockGroup.elem("line", {
            x1: splitterHPadding,
            y1: topPos,
            x2: width-splitterHPadding,
            y2: topPos,
            stroke : '#b5b5b5'
        });
        this._splitters.push(line);
    };

    p.updateSplitters = function(y) {
        y = y === undefined ? 0 : y;
        var splitters = this._splitters;
        var width = this._svgWidth;
        var xDest = width - splitterHPadding;
        var yDest;
        splitters.forEach(function(line) {
            yDest = parseFloat(line.getAttribute('y1')) + y;
            line.attr({
                x2: xDest, y1:yDest, y2:yDest
            });
        });
    };

    p._clearSplitters = function() {
        var splitters = this._splitters;
        for (var i = splitters.length-1; i>=0; i--) {
            splitters[i].remove();
            splitters.pop();
        }
    };

    p.setWidth = function() {
        this._svgWidth = this.blockMenuContainer.width();
        this.updateSplitters();
    };

    p.setMenu = function() {
        var elems = Object.keys(this._categoryElems);

        this._categoryData.forEach(function(data) {
            var category = data.category;
            var threads = data.blocks;

            var count = threads.length;
            for (var i=0; i<threads.length; i++) {
                if(this.checkBanClass(Entry.block[threads[i]]))
                    count--;
            }
            var elem = this._categoryElems[category];
            if (count === 0) elem.addClass('entryRemove');
            else elem.removeClass('entryRemove');
        }.bind(this));
    };


    p.getCategoryCodes = function(selector) {
        //TODO if needed
    };

    p._convertSelector = function(selector) {
        if (isNaN(selector)) return selector;

        selector = Number(selector);
        var categories = this._categories;
        var elems = this._categoryElems;
        for (var i = 0; i < categories.length; i++) {
            var key = categories[i];
            var visible = !elems[key].hasClass('entryRemove');
            if (visible)
                if (selector-- === 0) return key;
        }

    };

    p.selectMenu = function(selector, doNotFold) {
        var className = 'entrySelectedCategory';
        var oldView = this._selectedCategoryView;

        var name = this._convertSelector(selector);
        if (selector !== undefined && !name) {
            this._dAlign();
            return;
        }

        if (name)
            this.lastSelector = name;
        this._isSelectingMenu = true;
        switch (name) {
            case 'variable':
                Entry.playground.checkVariables();
                break;
            case 'arduino':
                this._generateHwCode();
                this.align();
                break;
        }
        var elem = this._categoryElems[name];
        var animate = false;
        var board = this.workspace.board,
            boardView = board.view;

        if (oldView)
            oldView.removeClass(className);

        if (elem == oldView && !doNotFold) {
            boardView.addClass('folding');
            this._selectedCategoryView = null;
            elem && elem.removeClass(className);
            Entry.playground.hideTabs();
            animate = true;
            this.visible = false;
        } else if (!oldView) {
            if (!this.visible) {
                animate = true;
                boardView.addClass('foldOut');
                Entry.playground.showTabs();
            }
            boardView.removeClass('folding');
            this.visible = true;
        } else if (!name)
            this._selectedCategoryView = null;

        if (animate) {
            Entry.bindAnimationCallbackOnce(boardView, function(){
                board.scroller.resizeScrollBar.call(board.scroller);
                boardView.removeClass('foldOut');
                Entry.windowResized.notify();
            });
        }

        this._isSelectingMenu = false;

        if (this.visible) {
            this._selectedCategoryView = elem;
            elem && elem.addClass(className);
        }
        this._dAlign();
    };

    p._generateCategoryCodes = function(elems) {
        if (!elems)
            elems = Object.keys(this._categoryElems);

        if (elems.length) {
            var key = elems.shift();
            if (key !== 'arduino') {
                this._generateCategoryCode(key);
            }  else this._generateHwCode(true);

            if (elems.length) {
                this._generateCodesTimer =
                    setTimeout(function() {
                        this._generateCategoryCodes(elems);
                }.bind(this), 0);
            } else {
                this._generateCodesTimer = null;
                this.align();
            }
        }
    };

    p._generateCategoryCode = function(key) {
        var code = this.code;
        var codes = [];
        var datum = this._categoryData.filter(function(obj) {
            return obj.category == key;
        })[0];
        var category = key;
        var blocks = datum.blocks;
        blocks.forEach(function(b){
            var block = Entry.block[b];
            block.category = datum.category;
            if (!block || !block.def) {
                codes.push([{
                    type:b,
                    category: category
                }]);
            } else {
                if (block.defs) {
                    block.defs.forEach(function(d) {
                        d.category = category;
                    });
                    for (var i =0; i <block.defs.length; i++)
                        codes.push([
                            block.defs[i]
                        ]);
                } else
                    block.def.category = category;
                    codes.push([
                        block.def
                    ]);
            }
        });

        this._categories.push(category);

        var index;
        if (key == 'func') {
            var threads = this.code.getThreadsByCategory('func');
            if (threads.length)
                index = this.code.getThreadIndex(threads[0]);
        }
        codes.forEach(function(t) {
            t[0].display = false;
            t = code.createThread(t, index);
            if (index !== undefined)
                index++;
        });
    };

    p.banClass = function(className, unReDraw) {
        var index = this._bannedClass.indexOf(className);
        if (index < 0) {
            this._bannedClass.push(className);
            this._dAlign(unReDraw);
        }
    };

    p.unbanClass = function(className, unReDraw) {
        var index = this._bannedClass.indexOf(className);
        if (index > -1) {
            this._bannedClass.splice(index, 1);
            this._dAlign(unReDraw);
        }
    };

    p.checkBanClass = function(blockInfo) {
        if (!blockInfo) return;
        var isNotFor = blockInfo.isNotFor;
        for (var i in this._bannedClass) {
            if (isNotFor && isNotFor.indexOf(this._bannedClass[i]) > -1)
                return true;
        }

        return false;
    };

    p.checkCategory = function(blockInfo) {
        if (!blockInfo) return;
        var category = 'category_' + this.lastSelector
        var isFor = blockInfo.isFor;

        if (this.lastSelector && isFor) {
            if (isFor.indexOf(category) < 0)
                return true;
        }
    };

    p._addControl = function(dom) {
        var that = this;
        var svgDom = this.svgDom;

        dom.on('wheel', function(){
            that._mouseWheel.apply(that, arguments);
        });

        if (that._scroller) {
            $(this.svg).bind('mousedown touchstart', function(e) {
                that.onMouseDown.apply(that, arguments);
            });
        }
    };

    p.onMouseDown = function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        var blockMenu = this;
        if (e.button === 0 || (e.originalEvent && e.originalEvent.touches)) {
            var mouseEvent = Entry.Utils.convertMouseEvent(e);

            if (Entry.documentMousedown)
                Entry.documentMousedown.notify(mouseEvent);
            var doc = $(document);

            doc.bind('mousemove.blockMenu', onMouseMove);
            doc.bind('mouseup.blockMenu', onMouseUp);
            doc.bind('touchmove.blockMenu', onMouseMove);
            doc.bind('touchend.blockMenu', onMouseUp);
            this.dragInstance = new Entry.DragInstance({
                startY: mouseEvent.pageY,
                offsetY: mouseEvent.pageY
            });
        }

        function onMouseMove(e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();

            var mouseEvent = Entry.Utils.convertMouseEvent(e);

            var dragInstance = blockMenu.dragInstance;
            blockMenu._scroller.scroll(
                -mouseEvent.pageY + dragInstance.offsetY
            );
            dragInstance.set({
                offsetY: mouseEvent.pageY
            });
        }

        function onMouseUp(e) {
            $(document).unbind('.blockMenu');
            delete blockMenu.dragInstance;
        }
    };

    p._mouseWheel = function(e) {
        e = e.originalEvent;
        e.preventDefault();
        var disposeEvent = Entry.disposeEvent;
        if (disposeEvent)
            disposeEvent.notify(e);
        this._scroller.scroll(
            -e.wheelDeltaY || e.deltaY / 3
        );
    };

    p.dominate = function(block) {
        this.svgBlockGroup
            .appendChild(block.view.svgGroup);
    };

    p.reDraw = function() {
        this.selectMenu(this.lastSelector, true);
    };

    p._handleDragBlock = function() {
        this._boardBlockView = null;
        if (this._scroller) this._scroller.setOpacity(0);
    };

    p._captureKeyEvent = function(e) {
        var keyCode = e.keyCode;
        var type = Entry.type;

        if (e.ctrlKey && type == 'workspace') {
            if (keyCode > 48 && keyCode < 58) {
                e.preventDefault();
                this.selectMenu(keyCode - 49);
            }
        }
    };

    p.enablePattern = function() {
        this.pattern.removeAttribute('style');
    };

    p.disablePattern = function() {
        this.pattern.attr({
            style: "display: none"
        });
    };

    p._clearCategory = function() {
        this._selectedCategoryView = null;
        this._categories = [];

        var categories = this._categoryElems;
        for (var key in categories)
            categories[key].remove();
        this._categoryElems = {};

        if (this.code && this.code.constructor == Entry.Code)
            this.code.clear();
    };

    p.setCategoryData = function(data) {
        this._clearCategory();
        this._categoryData = data;
        this._generateCategoryView(data);
        this._generateCategoryCodes();
        if (this._generateCodesTimer) {
            clearTimeout(this._generateCodesTimer);
            this._generateCodesTimer = null;
        }
    };

    p._generateCategoryView = function(data) {
        if (!data) return;

        for (var i=0; i<data.length; i++) {
            var name = data[i].category;
            this._generateCategoryElement(name);
        }
    };

    p._generateCategoryElement = function(name) {
        var that = this;
        var element = Entry.Dom('li', {
            id: 'entryCategory' + name,
            class: 'entryCategoryElementWorkspace entryRemove',
            parent: this._categoryCol
        });

        (function(elem, name){
            elem.text(Lang.Blocks[name.toUpperCase()]);
            that._categoryElems[name] = elem;
            elem.bindOnClick(function(e) {
                that.selectMenu(name);
            });
        })(element, name);
    };

    p.updateOffset = function () {
        this._offset = this.svgDom.offset();
    };


    p.offset = function() {
        if (!this._offset || (this._offset.top === 0 && this._offset.left === 0))  {
            this.updateOffset();
        }
        return this._offset;
    };

    p._generateHwCode = function(shouldHide) {
        var code = this.code;
        var threads = code.getThreadsByCategory('arduino');
        var CATEGORY = 'arduino';

        threads.forEach(function(t) {
            t.destroy();
        });

        var data = this._categoryData;
        var blocks;
        for (var i = data.length-1; i >= 0; i--) {
            var category = data[i].category;
            if (category === CATEGORY) {
                blocks = data[i].blocks;
                break;
            }
        }

        var threads = [];

        for (i =0; i<blocks.length; i++) {
            var type = blocks[i];
            var block = Entry.block[type];
            if(!this.checkBanClass(block)) {
                if (!block || !block.def) {
                    threads.push([{
                        type:type,
                        category: CATEGORY
                    }]);
                } else {
                    if (block.defs) {
                        block.defs.forEach(function(d) {
                            d.category = CATEGORY;
                        });
                        for (var i =0; i <block.defs.length; i++)
                            threads.push([
                                block.defs[i]
                            ]);
                    } else {
                        block.def.category = CATEGORY;
                        threads.push([
                            block.def
                        ]);
                    }
                }
            }
        }

        threads.forEach(function(t) {
            if (shouldHide)
                t[0].display = false;
            code.createThread(t);
        });
    };

    p.setAlign = function(align) {
        this._align = align || "CENTER";
    };

})(Entry.BlockMenu.prototype);
