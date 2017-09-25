/*
 *               jQuery ContextMenu v. 1.0.0
 *
 *                Written by Bilotta Matteo.
 *
 *     Copyright © 2017, Bylothink. All rights reserved.
 */

// Checking if jQuery is available...
    if (typeof(jQuery) === "undefined")
    {
        throw new Error("jQuery is required by ContextMenu to be executed.");
    }
    else if (typeof(Tether) === "undefined")
    {
        throw new Error("Tether is required by ContextMenu to be executed.");
    }

(function(jQuery, Tether, window)
{
    "use strict";

    // Single instance private constants:
        const DEFAULT_OPTS = {

            items: [ ]
        };
        
        const PREFIX = "cnxt-";
        const CURSOR_ID = PREFIX + "cursor";

        const ATTACHMENTS = {
            
            MAIN_MENU: "bottom left",
            SUB_MENU: "top right"
        };

    // Single instance private properties:
        let _context;
        let _contextMenu;
        let _cursor;
        let _target;
        
    // Instance indipendent private methods:
        let _append = function(obj)
        {
            jQuery("body").append(obj);
        };

        let _init = function()
        {
            _context = jQuery(window);
            _cursor = jQuery('<div id="' + CURSOR_ID + '"></div>');

            _append(_cursor);
        };

        let _isUndefined = function(obj)
        {
            return ((obj === undefined) || (typeof(obj) === "undefined"));
        };

        let _onCloseEvent = function()
        {
            if (_isUndefined(_contextMenu) === false)
            {
                _contextMenu.close();
            }
        };

        let _updateCursor = function(e)
        {   
            _cursor.css({ left: e.pageX, top: e.pageY });
        };

    // Classes:
        let Item = function(properties, subMenu)
        {
            // Private properties:
                let _this = this;
                let _subMenu = subMenu;

                let _jQueryObject;

            // Private methods:
                let _enableEvents = function()
                {
                    if (properties.type === "item")
                    {
                        _jQueryObject.on("click", _onClick);
                    }
                    else if (properties.type === "submenu")
                    {
                        _jQueryObject.on("mouseenter", _onMouseEnter);
                        _jQueryObject.on("mouseleave", _onMouseLeave);
                    }
                };
                
                let _init = function()
                {
                    _jQueryObject = _render();
                    
                    _append(_jQueryObject);
                    _enableEvents();
                };
                
                let _onClick = function(e)
                {
                    if (_isUndefined(properties.action) === false)
                    {
                        let _haveToClose = properties.action.call(_target, properties, e);

                        if (_haveToClose !== false)
                        {
                            _contextMenu.close();
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                };

                let _onMouseEnter = function(e)
                {
                    _subMenu.open();
                    
                    e.preventDefault();
                    e.stopPropagation();
                };
                let _onMouseLeave = function(e)
                {
                    _subMenu.close();
                    
                    e.preventDefault();
                    e.stopPropagation();
                };
                
                let _render = function()
                {
                    let _item = jQuery('<li></li>');

                    if (properties.type === "title")
                    {
                        _item.addClass("dropdown-header");
                        _item.html(properties.text);
                    }
                    else if (properties.type === "divider")
                    {
                        _item.addClass("divider");
                        _item.attr("role", "separator");
                    }
                    else if ((properties.type === "item") || (properties.type === "submenu"))
                    {
                        let _link = jQuery('<a></a>');
                        let _innerHtml = properties.text;

                        if (_isUndefined(properties.icon) === false)
                        {
                            _innerHtml = '<span class="fa fa-' + properties.icon + '"></span> ' + _innerHtml;
                        }

                        _link.html(_innerHtml);

                        if (properties.type === "submenu")
                        {
                            _link.addClass("dropdown-toggle");
                            _item.addClass("dropdown-submenu");
                        }

                        _item.append(_link);
                    }

                    return _item;
                };

            // Public methods:
                _this.getJQueryObject = function()
                {
                    return _jQueryObject;
                };

            // Initializing object...
                _init();
        };

        let Menu = function(items)
        {
            // Private properties:
                let _this = this;

                let _items = [];
                let _subMenus = [];

                let _isMainMenu;
                let _jQueryObject;
                let _jQueryTargetObject;
                let _tetherInstance;

            // Private methods:
                let _init = function()
                {
                    _jQueryObject = _render();

                    _append(_jQueryObject);
                };
                
                let _onMouseEnter = function(e)
                {
                    _this.open();
                    
                    e.preventDefault();
                    e.stopPropagation();
                };
                let _onMouseLeave = function(e)
                {
                    _this.close();
                    
                    e.preventDefault();
                    e.stopPropagation();
                };

                let _render = function()
                {
                    let _menu = jQuery('<ul class="context-menu dropdown-menu"></ul>');

                    for (let i in items)
                    {
                        let _item;

                        if (items[i].type === "submenu")
                        {
                            let _subMenu = new Menu(items[i].items);
                            
                            _item = new Item(items[i], _subMenu);

                            _subMenu.enableEvents(_item.getJQueryObject());
                            _subMenus.push(_subMenu);
                        }
                        else
                        {
                            _item = new Item(items[i]);
                        }

                        _items.push(_item);
                        
                        _menu.append(_item.getJQueryObject());
                    }

                    return _menu;
                };

            // Public methods:
                _this.close = function()
                {
                    _jQueryObject.removeClass("open");
                    
                    for (let i in _subMenus)
                    {
                        _subMenus[i].close();
                    }

                    if (_isMainMenu === true)
                    {
                        setTimeout(_this.delete, 150);
                    }
                };
                
                _this.delete = function()
                {
                    _jQueryObject.remove();
                    
                    for (let i in _subMenus)
                    {
                        _subMenus[i].delete();
                    }
                };

                _this.enableEvents = function(target)
                {
                    let _attachment;

                    if (_isUndefined(target) === false)
                    {
                        _attachment = ATTACHMENTS.SUB_MENU;
                        _isMainMenu = false;
                        _jQueryTargetObject = target;
                    }
                    else
                    {
                        _attachment = ATTACHMENTS.MAIN_MENU;
                        _isMainMenu = true;
                        _jQueryTargetObject = _cursor;
                    }

                    _tetherInstance = new Tether({

                        element: _jQueryObject,
                        target: _jQueryTargetObject,
                        attachment: 'top left',
                        targetAttachment: _attachment,
                        constraints: [

                            {
                                attachment: "together",
                                pin: true,
                                to: "window"
                            }
                        ],
                        targetOffset: "0px 0px"
                    });

                    if (_isMainMenu === false)
                    {
                        _jQueryObject.on("mouseenter", _onMouseEnter);
                        _jQueryObject.on("mouseleave", _onMouseLeave);
                    }
                };

                _this.getJQueryObject = function()
                {
                    return _jQueryObject;
                };

                _this.open = function()
                {
                    _jQueryObject.addClass("open");
                    _tetherInstance.position();
                };

            // Initializing object...
                _init();
        };

        let ContextMenu = function(domElements, options)
        {
            // Private properties:
                let _this = this;
                let _domElements = domElements;

                let _items = options.items;
            
            // Private methods:
                let _onRightClick = function(e)
                {
                    _target = this;

                    if (_isUndefined(_contextMenu) === false)
                    {
                        _contextMenu.close();
                    }

                    _updateCursor(e);

                    let _computedItems = _items;

                    if (typeof(_items) === "function")
                    {
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
        jQuery.fn.contextMenu = function(options)
        {
            if (_isUndefined(this) === false)
            {
                let _opts = jQuery.extend({ }, DEFAULT_OPTS, options);

                return new ContextMenu(this, _opts);
            }
        };

})(jQuery, Tether, window);
