"use strict";

/*
 *               jQuery ContextMenu v. 1.0.0
 *
 *                Written by Bilotta Matteo.
 *
 *     Copyright © 2017, Bylothink. All rights reserved.
 */

// Checking if jQuery is available...
if (typeof jQuery === "undefined") {
    throw new Error("jQuery is required by ContextMenu to be executed.");
} else if (typeof Tether === "undefined") {
    throw new Error("Tether is required by ContextMenu to be executed.");
}

(function (jQuery, Tether, window) {
    "use strict";

    // Single instance private constants:

    var DEFAULT_OPTS = {

        items: []
    };

    var PREFIX = "cnxt-";
    var CURSOR_ID = PREFIX + "cursor";

    var ATTACHMENTS = {

        MAIN_MENU: "bottom left",
        SUB_MENU: "top right"
    };

    // Single instance private properties:
    var _context = void 0;
    var _contextMenu = void 0;
    var _cursor = void 0;
    var _target = void 0;

    // Instance indipendent private methods:
    var _append = function _append(obj) {
        jQuery("body").append(obj);
    };

    var _init = function _init() {
        _context = jQuery(window);
        _cursor = jQuery('<div id="' + CURSOR_ID + '"></div>');

        _append(_cursor);
    };

    var _isUndefined = function _isUndefined(obj) {
        return obj === undefined || typeof obj === "undefined";
    };

    var _onCloseEvent = function _onCloseEvent() {
        if (_isUndefined(_contextMenu) === false) {
            _contextMenu.close();
        }
    };

    var _updateCursor = function _updateCursor(e) {
        _cursor.css({ left: e.pageX, top: e.pageY });
    };

    // Classes:
    var Item = function Item(properties, subMenu) {
        // Private properties:
        var _this = this;
        var _subMenu = subMenu;

        var _jQueryObject = void 0;

        // Private methods:
        var _enableEvents = function _enableEvents() {
            if (properties.type === "item") {
                _jQueryObject.on("click", _onClick);
            } else if (properties.type === "submenu") {
                _jQueryObject.on("mouseenter", _onMouseEnter);
                _jQueryObject.on("mouseleave", _onMouseLeave);
            }
        };

        var _init = function _init() {
            _jQueryObject = _render();

            _append(_jQueryObject);
            _enableEvents();
        };

        var _onClick = function _onClick(e) {
            if (_isUndefined(properties.action) === false) {
                var _haveToClose = properties.action.call(_target, properties, e);

                if (_haveToClose !== false) {
                    _contextMenu.close();
                }
            }

            e.preventDefault();
            e.stopPropagation();
        };

        var _onMouseEnter = function _onMouseEnter(e) {
            _subMenu.open();

            e.preventDefault();
            e.stopPropagation();
        };
        var _onMouseLeave = function _onMouseLeave(e) {
            _subMenu.close();

            e.preventDefault();
            e.stopPropagation();
        };

        var _render = function _render() {
            var _item = jQuery('<li></li>');

            if (properties.type === "title") {
                _item.addClass("dropdown-header");
                _item.html(properties.text);
            } else if (properties.type === "divider") {
                _item.addClass("divider");
                _item.attr("role", "separator");
            } else if (properties.type === "item" || properties.type === "submenu") {
                var _link = jQuery('<a></a>');
                var _innerHtml = properties.text;

                if (_isUndefined(properties.icon) === false) {
                    _innerHtml = '<span class="fa fa-' + properties.icon + '"></span> ' + _innerHtml;
                }

                _link.html(_innerHtml);

                if (properties.type === "submenu") {
                    _link.addClass("dropdown-toggle");
                    _item.addClass("dropdown-submenu");
                }

                _item.append(_link);
            }

            return _item;
        };

        // Public methods:
        _this.getJQueryObject = function () {
            return _jQueryObject;
        };

        // Initializing object...
        _init();
    };

    var Menu = function Menu(items) {
        // Private properties:
        var _this = this;

        var _items = [];
        var _subMenus = [];

        var _isMainMenu = void 0;
        var _jQueryObject = void 0;
        var _jQueryTargetObject = void 0;
        var _tetherInstance = void 0;

        // Private methods:
        var _init = function _init() {
            _jQueryObject = _render();

            _append(_jQueryObject);
        };

        var _onMouseEnter = function _onMouseEnter(e) {
            _this.open();

            e.preventDefault();
            e.stopPropagation();
        };
        var _onMouseLeave = function _onMouseLeave(e) {
            _this.close();

            e.preventDefault();
            e.stopPropagation();
        };

        var _render = function _render() {
            var _menu = jQuery('<ul class="context-menu dropdown-menu"></ul>');

            for (var i in items) {
                var _item = void 0;

                if (items[i].type === "submenu") {
                    var _subMenu = new Menu(items[i].items);

                    _item = new Item(items[i], _subMenu);

                    _subMenu.enableEvents(_item.getJQueryObject());
                    _subMenus.push(_subMenu);
                } else {
                    _item = new Item(items[i]);
                }

                _items.push(_item);

                _menu.append(_item.getJQueryObject());
            }

            return _menu;
        };

        // Public methods:
        _this.close = function () {
            _jQueryObject.removeClass("open");

            for (var i in _subMenus) {
                _subMenus[i].close();
            }

            if (_isMainMenu === true) {
                setTimeout(_this.delete, 150);
            }
        };

        _this.delete = function () {
            _jQueryObject.remove();

            for (var i in _subMenus) {
                _subMenus[i].delete();
            }
        };

        _this.enableEvents = function (target) {
            var _attachment = void 0;

            if (_isUndefined(target) === false) {
                _attachment = ATTACHMENTS.SUB_MENU;
                _isMainMenu = false;
                _jQueryTargetObject = target;
            } else {
                _attachment = ATTACHMENTS.MAIN_MENU;
                _isMainMenu = true;
                _jQueryTargetObject = _cursor;
            }

            _tetherInstance = new Tether({

                element: _jQueryObject,
                target: _jQueryTargetObject,
                attachment: 'top left',
                targetAttachment: _attachment,
                constraints: [{
                    attachment: "together",
                    pin: true,
                    to: "window"
                }],
                targetOffset: "0px 0px"
            });

            if (_isMainMenu === false) {
                _jQueryObject.on("mouseenter", _onMouseEnter);
                _jQueryObject.on("mouseleave", _onMouseLeave);
            }
        };

        _this.getJQueryObject = function () {
            return _jQueryObject;
        };

        _this.open = function () {
            _jQueryObject.addClass("open");
            _tetherInstance.position();
        };

        // Initializing object...
        _init();
    };

    var ContextMenu = function ContextMenu(domElements, options) {
        // Private properties:
        var _this = this;
        var _domElements = domElements;

        var _items = options.items;

        // Private methods:
        var _onRightClick = function _onRightClick(e) {
            _target = this;

            if (_isUndefined(_contextMenu) === false) {
                _contextMenu.close();
            }

            _updateCursor(e);

            var _computedItems = _items;

            if (typeof _items === "function") {
                _computedItems = _items.call(_target);
            }

            _contextMenu = new Menu(_computedItems);
            _contextMenu.enableEvents();
            _contextMenu.open();

            e.preventDefault();
            e.stopPropagation();
        };

        // Start listening for events...
        jQuery(_domElements).on("contextmenu", _onRightClick);
    };

    // Initial initialization...
    _init();

    // Start listening for global events...
    _context.on("click", _onCloseEvent);
    _context.on("contextmenu", _onCloseEvent);

    // Exposing ContextMenu as a jQuery plugin...
    jQuery.fn.contextMenu = function (options) {
        if (_isUndefined(this) === false) {
            var _opts = jQuery.extend({}, DEFAULT_OPTS, options);

            return new ContextMenu(this, _opts);
        }
    };
})(jQuery, Tether, window);
//# sourceMappingURL=jquery.context-menu.js.map
