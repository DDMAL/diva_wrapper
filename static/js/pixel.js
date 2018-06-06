/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*jshint esversion: 6 */
	/**
	 * This plugin will be used to transform Diva into a layering tool which will be used to provide
	 * the ground truth data for the machine learning algorithm
	 * that classifies and isolates the different components of old manuscripts and scores.
	 *
	 * {string} pluginName - Added to the class prototype. Defines the name for the plugin.
	 *
	 **/

	var _pixelWrapper = __webpack_require__(2);

	var _point = __webpack_require__(5);

	var _rectangle = __webpack_require__(3);

	var _layer = __webpack_require__(7);

	var _colour = __webpack_require__(6);

	var _export = __webpack_require__(10);

	var _uiManager = __webpack_require__(11);

	var _tools = __webpack_require__(13);

	var _import = __webpack_require__(14);

	var _selection = __webpack_require__(15);

	var _tutorial = __webpack_require__(16);

	var _exceptions = __webpack_require__(12);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PixelPlugin = function () {
	    function PixelPlugin(core) {
	        _classCallCheck(this, PixelPlugin);

	        this.pixelWrapper = null;
	        this.core = core;
	        this.activated = false;
	        this.pageToolsIcon = this.createIcon();
	        this.scrollEventHandle = null;
	        this.zoomEventHandle = null;
	        this.mouseHandles = null;
	        this.keyboardHandles = null;
	        this.background = null;
	        this.layers = null;
	        this.mousePressed = false;
	        this.rightMousePressed = false;
	        this.selectedLayerIndex = 0;
	        this.layerChangedMidDraw = false;
	        this.actions = [];
	        this.undoneActions = [];
	        this.shiftDown = false;
	        this.initialShiftPress = true;
	        this.lastRelCoordX = null;
	        this.lastRelCoordY = null;
	        this.uiManager = null;
	        this.tools = null;
	        this.selection = null;
	        this.horizontalMove = false;
	        this.layerIdCounter = 2;
	    }

	    /**
	     * ===============================================
	     *         Plugin Activation/Deactivation
	     * ===============================================
	     **/

	    _createClass(PixelPlugin, [{
	        key: 'handleClick',
	        value: function handleClick() {
	            if (!this.activated) this.activatePlugin();else this.deactivatePlugin();
	        }
	    }, {
	        key: 'activatePlugin',
	        value: function activatePlugin() {
	            if (this.layers === null) {
	                // Start by creating layers
	                var background = new _layer.Layer(0, new _colour.Colour(242, 242, 242, 1), "Background", this, 1),
	                    layer1 = new _layer.Layer(1, new _colour.Colour(51, 102, 255, 1), "Layer 1", this, 0.5);

	                this.layers = [layer1];
	                this.background = background;
	                this.background.canvas = this.core.getSettings().renderer._canvas; // Link background canvas to the actual diva canvas
	            }

	            if (this.uiManager === null) this.uiManager = new _uiManager.UIManager(this);

	            if (this.tools === null) this.tools = new _tools.Tools(this);

	            this.uiManager.createPluginElements(this.layers);
	            this.scrollEventHandle = this.subscribeToScrollEvent();
	            this.zoomEventHandle = this.subscribeToZoomLevelWillChangeEvent();

	            this.disableDragScrollable();
	            this.subscribeToWindowResizeEvent();
	            this.subscribeToMouseEvents();
	            this.subscribeToKeyboardEvents();

	            // Setting Tool to change the cursor type
	            this.tools.setCurrentTool(this.tools.getCurrentTool());
	            this.activated = true;

	            new _tutorial.Tutorial();

	            // Activate wrapper
	            if (this.pixelWrapper === null) this.pixelWrapper = new _pixelWrapper.PixelWrapper(this);
	            this.pixelWrapper.activate();
	        }
	    }, {
	        key: 'deactivatePlugin',
	        value: function deactivatePlugin() {
	            // Deactivate wrapper
	            this.pixelWrapper.deactivate();

	            global.Diva.Events.unsubscribe(this.scrollEventHandle);
	            global.Diva.Events.unsubscribe(this.zoomEventHandle);

	            this.unsubscribeFromMouseEvents();
	            this.unsubscribeFromKeyboardEvents();
	            this.redrawAllLayers(); // Repaint the tiles to make the highlights disappear off the page

	            this.uiManager.destroyPluginElements(this.layers, this.background);
	            this.enableDragScrollable();
	            this.activated = false;
	        }
	    }, {
	        key: 'enableDragScrollable',
	        value: function enableDragScrollable() {
	            if (this.core.viewerState.viewportObject.hasAttribute('nochilddrag')) this.core.viewerState.viewportObject.removeAttribute('nochilddrag');
	        }
	    }, {
	        key: 'disableDragScrollable',
	        value: function disableDragScrollable() {
	            if (!this.core.viewerState.viewportObject.hasAttribute('nochilddrag')) this.core.viewerState.viewportObject.setAttribute('nochilddrag', "");
	        }
	    }, {
	        key: 'createIcon',
	        value: function createIcon() {
	            var pageToolsIcon = document.createElement('div');
	            pageToolsIcon.classList.add('diva-pixel-icon');

	            var root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	            root.setAttribute("x", "0px");
	            root.setAttribute("y", "0px");
	            root.setAttribute("viewBox", "0 0 25 25");
	            root.id = this.core.settings.selector + 'pixel-icon';

	            var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	            g.id = this.core.settings.selector + 'pixel-icon-glyph';
	            g.setAttribute("transform", "matrix(1, 0, 0, 1, -11.5, -11.5)");
	            g.setAttribute("class", "diva-pagetool-icon");

	            //Placeholder icon
	            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	            rect.setAttribute('x', '15');
	            rect.setAttribute('y', '10');
	            rect.setAttribute('width', '25');
	            rect.setAttribute('height', '25');

	            g.appendChild(rect);
	            root.appendChild(g);

	            pageToolsIcon.appendChild(root);

	            return pageToolsIcon;
	        }

	        /**
	         * ===============================================
	         *        Event Subscription/Unsubscription
	         * ===============================================
	         **/

	        // Repositions all layers on top of editing page when the browser window is resized

	    }, {
	        key: 'subscribeToWindowResizeEvent',
	        value: function subscribeToWindowResizeEvent() {
	            var _this = this;

	            window.addEventListener("resize", function () {
	                _this.layers.forEach(function (layer) {
	                    layer.placeLayerCanvasOnTopOfEditingPage();
	                });
	            });
	        }

	        // Resizes the elements of the layers on viewport zoom

	    }, {
	        key: 'subscribeToZoomLevelWillChangeEvent',
	        value: function subscribeToZoomLevelWillChangeEvent() {
	            var _this2 = this;

	            var handle = global.Diva.Events.subscribe('ZoomLevelWillChange', function (zoomLevel) {
	                _this2.layers.forEach(function (layer) {
	                    layer.resizeLayerCanvasToZoomLevel(zoomLevel);
	                });
	            });
	            return handle;
	        }

	        // Repositions all layers on top of editing page on viewport scroll

	    }, {
	        key: 'subscribeToScrollEvent',
	        value: function subscribeToScrollEvent() {
	            var _this3 = this;

	            var handle = global.Diva.Events.subscribe('ViewerDidScroll', function () {
	                _this3.layers.forEach(function (layer) {
	                    layer.placeLayerCanvasOnTopOfEditingPage();
	                });
	            });
	            return handle;
	        }
	    }, {
	        key: 'subscribeToMouseEvents',
	        value: function subscribeToMouseEvents() {
	            var _this4 = this;

	            var canvas = document.getElementById("diva-1-outer");
	            this.uiManager.createBrushCursor();

	            this.mouseDown = function (evt) {
	                _this4.onMouseDown(evt);
	            };
	            this.mouseUp = function (evt) {
	                _this4.onMouseUp(evt);
	            };
	            this.mouseMove = function (evt) {
	                _this4.onMouseMove(evt);
	            };

	            canvas.addEventListener('mousedown', this.mouseDown);
	            canvas.addEventListener('mouseup', this.mouseUp);
	            canvas.addEventListener('mouseleave', this.mouseUp);
	            canvas.addEventListener('mousemove', this.mouseMove);

	            // Used for unsubscription
	            this.mouseHandles = {
	                mouseDownHandle: this.mouseDown,
	                mouseMoveHandle: this.mouseMove,
	                mouseUpHandle: this.mouseUp
	            };
	        }
	    }, {
	        key: 'subscribeToKeyboardEvents',
	        value: function subscribeToKeyboardEvents() {
	            var _this5 = this;

	            this.handleKeyUp = function (e) {
	                _this5.onKeyUp(e);
	            };
	            this.handleKeyDown = function (e) {
	                _this5.onKeyDown(e);
	            };

	            document.addEventListener("keyup", this.handleKeyUp);
	            document.addEventListener("keydown", this.handleKeyDown);

	            // Used for unsubscription
	            this.keyboardHandles = {
	                keyup: this.handleKeyUp,
	                keydown: this.handleKeyDown
	            };
	        }
	    }, {
	        key: 'unsubscribeFromMouseEvents',
	        value: function unsubscribeFromMouseEvents() {
	            var canvas = document.getElementById("diva-1-outer");

	            canvas.removeEventListener('mousedown', this.mouseHandles.mouseDownHandle);
	            canvas.removeEventListener('mouseup', this.mouseHandles.mouseUpHandle);
	            canvas.removeEventListener('mouseleave', this.mouseHandles.mouseUpHandle);
	            canvas.removeEventListener('mousemove', this.mouseHandles.mouseMoveHandle);
	        }
	    }, {
	        key: 'unsubscribeFromKeyboardEvents',
	        value: function unsubscribeFromKeyboardEvents() {
	            document.removeEventListener("keyup", this.keyboardHandles.keyup);
	            document.removeEventListener("keydown", this.keyboardHandles.keydown);
	        }

	        /**
	         * ===============================================
	         *        Handling Keyboard and Mouse Events
	         * ===============================================
	         *         Layer reordering (Drag and Drop)
	         * -----------------------------------------------
	         **/

	        // Determines which element is being picked up

	    }, {
	        key: 'dragStart',
	        value: function dragStart(event) {
	            event.dataTransfer.setData("Text", event.target.id);
	        }
	    }, {
	        key: 'dragging',
	        value: function dragging() //can take an event as an argument
	        {}
	        // Do nothing


	        // Mark area as a drop zone on hover

	    }, {
	        key: 'allowDrop',
	        value: function allowDrop(event) {
	            event.preventDefault();
	        }
	    }, {
	        key: 'drop',
	        value: function drop(event, departureLayerIndex, destinationLayerIndex) {
	            event.preventDefault();
	            this.reorderLayers(departureLayerIndex, destinationLayerIndex);
	        }
	    }, {
	        key: 'reorderLayers',
	        value: function reorderLayers(departureLayerIndex, destinationLayerIndex) {
	            var tempLayerStorage = this.layers[departureLayerIndex];

	            if (departureLayerIndex > destinationLayerIndex) {
	                for (var i = 1; i <= departureLayerIndex - destinationLayerIndex; i++) {
	                    this.layers[departureLayerIndex - i + 1] = this.layers[departureLayerIndex - i];
	                }
	                this.layers[destinationLayerIndex] = tempLayerStorage;
	            } else if (departureLayerIndex < destinationLayerIndex) {
	                for (var _i = 1; _i <= destinationLayerIndex - departureLayerIndex; _i++) {
	                    this.layers[departureLayerIndex - 1 + _i] = this.layers[parseFloat(departureLayerIndex) + _i];
	                }
	                this.layers[destinationLayerIndex] = tempLayerStorage;
	            }

	            // Destroy all UI elements then recreate them (to show that the layers have been reordered through the UI)
	            this.changeCurrentlySelectedLayerIndex(destinationLayerIndex);
	            this.uiManager.destroyPluginElements(this.layers, this.background);
	            this.uiManager.createPluginElements(this.layers);
	            this.uiManager.destroyPixelCanvases(this.layers); // TODO: Optimization: Instead of destroying all of the canvases only destroy and reorder the ones of interest
	            this.uiManager.placeLayerCanvasesInDiva(this.layers);
	            this.uiManager.placeLayerCanvasesInDiva(this.background);
	            this.uiManager.highlightLayerSelectorById(this.layers[this.selectedLayerIndex].layerId);
	            this.redrawAllLayers();
	        }

	        /**
	         * -----------------------------------------------
	         *                Keyboard Events
	         * -----------------------------------------------
	         **/

	        // Actions on key release

	    }, {
	        key: 'onKeyUp',
	        value: function onKeyUp(e) {
	            var KEY_1 = 49;
	            var KEY_9 = 57;

	            var lastLayer = this.selectedLayerIndex,
	                key = e.keyCode ? e.keyCode : e.which;

	            // Selecting a Layer using keyboard shortcutkeys 1 to 9
	            if (key >= KEY_1 && key <= KEY_9) {
	                try {
	                    this.uiManager.highlightLayerSelectorById(key - KEY_1 + 1);
	                } catch (e) {
	                    if (e instanceof _exceptions.CannotSelectLayerException) {
	                        alert(e.message);
	                    }
	                }

	                if (lastLayer !== this.selectedLayerIndex && this.mousePressed) this.layerChangedMidDraw = true;
	            }

	            switch (e.key.toLowerCase()) {
	                case "shift":
	                    this.shiftDown = false;
	                    break;
	                case "h":
	                    this.layers[this.selectedLayerIndex].toggleLayerActivation();
	            }
	        }
	    }, {
	        key: 'onKeyDown',
	        value: function onKeyDown(e) {
	            switch (e.key.toLowerCase()) {
	                case "[":
	                    console.log(this.selectedLayerIndex);
	                    if (this.selectedLayerIndex !== 0) this.reorderLayers(this.selectedLayerIndex, this.selectedLayerIndex - 1);else {
	                        //TODO: throw layer is already lowest layer exception
	                    }
	                    break;
	                case "]":
	                    if (this.selectedLayerIndex !== this.layers.length - 1) this.reorderLayers(this.selectedLayerIndex, this.selectedLayerIndex + 1);else {
	                        //TODO: throw layer is already highest layer exception
	                    }
	                case "escape":
	                    if (this.selection !== null) {
	                        if (this.selection.imageData === null) {
	                            this.selection.clearSelection(this.core.getSettings().maxZoomLevel);
	                        }
	                    }
	                    break;
	                case "backspace":
	                    //FIXME: is it also "backspace" for windows?
	                    try {
	                        if (e.ctrlKey || e.metaKey) // Cmd + Delete
	                            {
	                                this.deleteLayer();
	                            }
	                    } catch (e) {
	                        if (e instanceof _exceptions.CannotDeleteLayerException) {
	                            alert(e.message);
	                        }
	                    }
	                    break;
	                case "n":
	                    if (e.ctrlKey || e.metaKey) {
	                        this.createLayer(); // Cmd + N
	                    }
	                    break;
	                case "z":
	                    if ((e.ctrlKey || e.metaKey) && e.shiftKey) // Cmd + Shift + Z
	                        this.redoAction();else if (e.ctrlKey || e.metaKey) // Cmd + Z
	                        this.undoAction();
	                    break;
	                case "c":
	                    if (e.ctrlKey || e.metaKey) // Cmd + c
	                        this.selection.copyShape(this.core.getSettings().maxZoomLevel);
	                    break;
	                case "x":
	                    if (e.ctrlKey || e.metaKey) // Cmd + x
	                        this.selection.cutShape(this.core.getSettings().maxZoomLevel);
	                    break;
	                case "v":
	                    if (e.ctrlKey || e.metaKey) // Cmd + v
	                        {
	                            if (this.selection !== null) {
	                                if (this.selection.imageData !== null) {
	                                    this.selection.pasteShapeToLayer(this.layers[this.selectedLayerIndex]);
	                                    this.selection = null;
	                                    this.redrawLayer(this.layers[this.selectedLayerIndex]);
	                                }
	                            }
	                        }
	                    break;
	                case "shift":
	                    this.shiftDown = true;
	                    break;
	                case "f":
	                    this.core.publicInstance.toggleFullscreenMode();
	                    break;
	                case "b":
	                    this.tools.setCurrentTool(this.tools.type.brush);
	                    break;
	                case "r":
	                    this.tools.setCurrentTool(this.tools.type.rectangle);
	                    break;
	                case "g":
	                    this.tools.setCurrentTool(this.tools.type.grab);
	                    break;
	                case "e":
	                    this.tools.setCurrentTool(this.tools.type.erase);
	                    break;
	                case "s":
	                    this.tools.setCurrentTool(this.tools.type.select);
	                    break;
	                //FIXME: Current implementation continuously toggles layer activation on key hold. Should happen once on first key press
	                case "m":
	                    this.layers[this.selectedLayerIndex].toggleLayerActivation();
	                    break;
	                case "h":
	                    if (this.layers[this.selectedLayerIndex].isActivated()) this.layers[this.selectedLayerIndex].toggleLayerActivation();
	                    break;
	            }
	        }
	    }, {
	        key: 'editLayerName',
	        value: function editLayerName(e, layerName, layerDiv, outsideClick, duringSwap, layer) {
	            var RETURN_KEY = 13;

	            // TODO: Find a way to unsubscribe from keyboard events while allowing enter key to be pressed
	            layerDiv.removeAttribute("draggable");
	            layerDiv.setAttribute("draggable", "false");

	            var key = e.which || e.keyCode;
	            if (key === RETURN_KEY || outsideClick) {
	                if (duringSwap === false) {
	                    // TODO: Resubscribe to mouse events
	                    layer.updateLayerName(layerName.value);
	                    layerName.setAttribute("readonly", "true");
	                    layerDiv.setAttribute("draggable", "true");
	                } else if (duringSwap === true) {
	                    //do nothing
	                }
	            }
	        }

	        /**
	         * -----------------------------------------------
	         *                Mouse Events
	         * -----------------------------------------------
	         **/

	    }, {
	        key: 'getMousePos',
	        value: function getMousePos(canvas, evt) {
	            var rect = canvas.getBoundingClientRect();

	            return {
	                x: evt.clientX - rect.left,
	                y: evt.clientY - rect.top
	            };
	        }

	        /*
	            +===========+=======================+=======================+
	            |   tool    |       Left Click      |       Right Click     |
	            +===========+=======================+=======================+
	            |   Brush   |     Freeform paint    |         Resize        |
	            +–––––––––––+–––––––––––––––––––––––+–––––––––––––––––––––––+
	            | Rectangle |     Rectangle draw    |    Rectangle Erase    |
	            +–––––––––––+–––––––––––––––––––––––+–––––––––––––––––––––––+
	            |   Grab    |       Drag scroll     |       Drag scroll     |
	            +–––––––––––+–––––––––––––––––––––––+–––––––––––––––––––––––+
	            |   Erase   |     Freeform erase    |         Resize        |
	            +–––––––––––+–––––––––––––––––––––––+–––––––––––––––––––––––+
	            |   Select  |    Rectangle Select   |    Rectangle Select   |
	            +===========+=======================+=======================+
	                    Tools' behaviour on left and right mouse clicks
	         */

	        // Initializes tool actions

	    }, {
	        key: 'onMouseDown',
	        value: function onMouseDown(evt) {
	            var mouseClickDiv = document.getElementById("diva-1-outer"),
	                mousePos = this.getMousePos(mouseClickDiv, evt);

	            // Clear Selection
	            if (this.selection !== null) this.selection.clearSelection(this.core.getSettings().maxZoomLevel);

	            if (evt.which === 1) this.rightMousePressed = false;
	            if (evt.which === 3) this.rightMousePressed = true;

	            this.mousePressed = true;
	            switch (this.tools.getCurrentTool()) {
	                case this.tools.type.brush:
	                    if (this.rightMousePressed) this.initializeBrushSizeChange(mousePos);else this.initializeNewPathInCurrentLayer(mousePos);
	                    break;
	                case this.tools.type.rectangle:
	                    this.initializeRectanglePreview(mousePos);
	                    break;
	                case this.tools.type.grab:
	                    mouseClickDiv.style.cursor = "-webkit-grabbing"; // Change grab cursor to grabbing
	                    break;
	                case this.tools.type.erase:
	                    if (this.rightMousePressed) this.initializeBrushSizeChange(mousePos);else this.initializeNewPathInCurrentLayer(mousePos);
	                    break;
	                case this.tools.type.select:
	                    this.selection = new _selection.Selection();
	                    this.initializeRectanglePreview(mousePos);
	                    break;
	                default:
	            }
	            // FIXME: At deactivation mouse is down so it clears the actions to redo
	            this.undoneActions = [];
	        }
	    }, {
	        key: 'onMouseMove',
	        value: function onMouseMove(evt) {
	            var mouseClickDiv = document.getElementById("diva-1-outer"),
	                mousePos = this.getMousePos(mouseClickDiv, evt);

	            switch (this.tools.getCurrentTool()) {
	                case this.tools.type.brush:
	                    if (this.rightMousePressed) this.changeBrushSize(mousePos);else this.addPointToCurrentPath(mousePos);
	                    this.uiManager.moveBrushCursor(mousePos);
	                    break;
	                case this.tools.type.rectangle:
	                    this.rectanglePreview(mousePos);
	                    break;
	                case this.tools.type.erase:
	                    if (this.rightMousePressed) this.changeBrushSize(mousePos);else this.addPointToCurrentPath(mousePos);
	                    this.uiManager.moveBrushCursor(mousePos);
	                    break;
	                case this.tools.type.select:
	                    this.rectanglePreview(mousePos);
	                    break;
	                default:
	            }
	        }
	    }, {
	        key: 'onMouseUp',
	        value: function onMouseUp() {
	            var mouseClickDiv = document.getElementById("diva-1-outer");
	            this.mousePressed = false;
	            this.rightMousePressed = false;
	            this.horizontalMove = false;
	            this.initialShiftPress = true;

	            switch (this.tools.getCurrentTool()) {
	                case this.tools.type.rectangle:
	                    // TODO: Add action: resized rectangle.
	                    // This is useful if a user wants to undo a rectangle resize (when implemented)
	                    break;
	                case this.tools.type.grab:
	                    mouseClickDiv.style.cursor = "-webkit-grab";
	                    break;
	                default:
	            }
	        }

	        /**
	         * -----------------------------------------------
	         *            Delete / Create New Layer
	         * -----------------------------------------------
	         **/

	    }, {
	        key: 'deleteLayer',
	        value: function deleteLayer() {
	            var layer = this.layers[this.selectedLayerIndex],
	                currentLayersLength = this.layers.length;

	            // Enable function only if in standalone Pixel 
	            if (typeof numberInputLayers === 'undefined') {
	                // Continue
	            } else {
	                return;
	            }

	            if (currentLayersLength <= 1) throw new _exceptions.CannotDeleteLayerException("Must at least have one layer other than the background");

	            this.uiManager.destroyPluginElements(this.layers, this.background);
	            this.layers.splice(this.selectedLayerIndex, 1);

	            //reset to the first layer on delete
	            this.selectedLayerIndex = 0;

	            //refreshing the layers view to reflect changes
	            this.uiManager.createPluginElements(this.layers);
	            this.redrawAllLayers();
	        }
	    }, {
	        key: 'createLayer',
	        value: function createLayer() {
	            // Enable function only if in standalone Pixel
	            if (typeof numberInputLayers === 'undefined') {
	                // Continue
	            } else {
	                return;
	            }

	            var colour = void 0;

	            switch (this.layerIdCounter) {
	                case 1:
	                    colour = new _colour.Colour(51, 102, 255, 1);
	                    break;
	                case 2:
	                    colour = new _colour.Colour(255, 51, 102, 1);
	                    break;
	                case 3:
	                    colour = new _colour.Colour(255, 255, 10, 1);
	                    break;
	                case 4:
	                    colour = new _colour.Colour(2, 136, 0, 1);
	                    break;
	                case 5:
	                    colour = new _colour.Colour(96, 0, 186, 1);
	                    break;
	                case 6:
	                    colour = new _colour.Colour(239, 143, 0, 1);
	                    break;
	                case 7:
	                    colour = new _colour.Colour(71, 239, 200, 1);
	                    break;
	                case 8:
	                    colour = new _colour.Colour(247, 96, 229, 1);
	                    break;
	                case 9:
	                    colour = new _colour.Colour(114, 61, 0, 1);
	                    break;
	                default:
	                    colour = new _colour.Colour(parseInt(255 * Math.random()), parseInt(255 * Math.random()), parseInt(255 * Math.random()), 1);
	            }

	            var layer = new _layer.Layer(this.layerIdCounter, colour, "Layer " + this.layerIdCounter, this, 0.5);

	            this.layerIdCounter++;
	            this.layers.push(layer);

	            this.changeCurrentlySelectedLayerIndex(this.layers.length - 1);
	            this.uiManager.destroyPluginElements(this.layers, this.background);
	            this.uiManager.createPluginElements(this.layers);

	            this.redrawAllLayers();
	        }

	        /**
	         * -----------------------------------------------
	         *                   Undo / Redo
	         * -----------------------------------------------
	         **/

	    }, {
	        key: 'redoAction',
	        value: function redoAction() {
	            if (this.undoneActions.length > 0) {
	                var actionToRedo = this.undoneActions[this.undoneActions.length - 1];

	                if (!actionToRedo.layer.isActivated()) return;

	                switch (actionToRedo.object.type) {
	                    case "path":
	                        actionToRedo.layer.addPathToLayer(actionToRedo.object);
	                        break;
	                    case "shape":
	                        actionToRedo.layer.addShapeToLayer(actionToRedo.object);
	                        break;
	                    case "selection":
	                        actionToRedo.layer.addToPastedRegions(actionToRedo.object);
	                        break;
	                    default:
	                }

	                this.undoneActions.splice(this.undoneActions.length - 1, 1); // Remove last element from undoneActions
	                this.redrawLayer(actionToRedo.layer);
	            }
	        }
	    }, {
	        key: 'undoAction',
	        value: function undoAction() {
	            if (this.actions.length > 0) {
	                var actionToRemove = this.actions[this.actions.length - 1];

	                if (!actionToRemove.layer.isActivated()) return;

	                this.undoneActions.push(actionToRemove);
	                this.removeActionAtIndex(this.actions.length - 1);
	            }
	        }
	    }, {
	        key: 'removeActionAtIndex',
	        value: function removeActionAtIndex(index) {
	            if (this.actions.length > 0 && this.actions.length >= index) {
	                var actionToRemove = this.actions[index];
	                this.removeAction(actionToRemove);
	            }
	        }
	    }, {
	        key: 'removeAction',
	        value: function removeAction(action) {
	            if (action === null) return;

	            switch (action.object.type) {
	                case "path":
	                    action.layer.removePathFromLayer(action.object);
	                    break;
	                case "shape":
	                    action.layer.removeShapeFromLayer(action.object);
	                    break;
	                case "selection":
	                    action.layer.removeSelectionFromLayer(action.object);
	                    break;
	                default:
	            }

	            // Get index of the action and remove it from the array
	            this.redrawLayer(action.layer);
	        }

	        /**
	         * ===============================================
	         *                   Drawing
	         * ===============================================
	         **/

	        /*
	            1. Checks if drawing is valid
	            2. Initializes a Path object in the selected layer and chooses its blend mode depending on the current tool
	            3. Adds a point to the newly initialized path
	            4. Specifies the zoomLevel at which the point will be drawn
	         */

	    }, {
	        key: 'initializeNewPathInCurrentLayer',
	        value: function initializeNewPathInCurrentLayer(mousePos) {
	            // Layer is inactive
	            if (!this.layers[this.selectedLayerIndex].isActivated()) return;

	            // Drawing on another page
	            if (this.core.getSettings().currentPageIndex !== this.layers[0].pageIndex) return;

	            // Get settings under the current zoomLevel
	            var pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().zoomLevel,
	                renderer = this.core.getSettings().renderer,
	                relativeCoords = new _point.Point().getRelativeCoordinatesFromPadded(pageIndex, renderer, mousePos.x, mousePos.y, zoomLevel);

	            // Make sure user is not drawing outside of a diva page
	            if (this.uiManager.isInPageBounds(relativeCoords.x, relativeCoords.y)) {
	                var selectedLayer = this.layers[this.selectedLayerIndex],
	                    point = new _point.Point(relativeCoords.x, relativeCoords.y, pageIndex),
	                    brushSize = this.uiManager.getBrushSizeSelectorValue();

	                this.lastRelCoordX = relativeCoords.x;
	                this.lastRelCoordY = relativeCoords.y;

	                // Create New Path in Layer
	                if (this.tools.getCurrentTool() === this.tools.type.brush) {
	                    selectedLayer.createNewPath(brushSize, "add");
	                    selectedLayer.addToCurrentPath(point, "add");
	                } else if (this.tools.getCurrentTool() === this.tools.type.erase) {
	                    selectedLayer.createNewPath(brushSize, "subtract");
	                    selectedLayer.addToCurrentPath(point, "subtract");
	                }

	                // Draw in max zoom level
	                zoomLevel = this.core.getSettings().maxZoomLevel;
	                selectedLayer.getCurrentPath().connectPoint(selectedLayer, point, pageIndex, zoomLevel, false, this.core.getSettings().renderer, selectedLayer.getCanvas(), "page");
	            } else {
	                this.mousePressed = false;
	            }
	        }

	        /*
	             1. Checks if drawing is valid
	             2. Specifies the coordinates of the point to be drawn depending on shift press
	             3. Adds a point to the current path being edited in the current layer
	             4. Connects the new point to the previous point in the current path and draws it
	         */

	    }, {
	        key: 'addPointToCurrentPath',
	        value: function addPointToCurrentPath(mousePos) {
	            if (!this.layers[this.selectedLayerIndex].isActivated()) return;

	            // Drawing on another page
	            if (this.core.getSettings().currentPageIndex !== this.layers[0].pageIndex) return;

	            if (!this.mousePressed) return;

	            var point = void 0,
	                pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().zoomLevel,
	                renderer = this.core.getSettings().renderer,
	                relativeCoords = new _point.Point().getRelativeCoordinatesFromPadded(pageIndex, renderer, mousePos.x, mousePos.y, zoomLevel);

	            if (!this.uiManager.isInPageBounds(relativeCoords.x, relativeCoords.y)) return;

	            if (!this.layerChangedMidDraw) {
	                var _pageIndex = this.core.getSettings().currentPageIndex,
	                    _zoomLevel = this.core.getSettings().maxZoomLevel;

	                // Draw straight lines
	                if (this.mousePressed && this.shiftDown) {
	                    // If this is the first time shift is pressed, calculate the direction of the line
	                    if (this.initialShiftPress) {
	                        // this.lastRelCoordX/Y hold saved path coordinates that help drawing a straight line
	                        // They are not updated when the straight line is being drawn
	                        if (Math.abs(relativeCoords.x - this.lastRelCoordX) >= Math.abs(relativeCoords.y - this.lastRelCoordY)) this.horizontalMove = true;

	                        this.initialShiftPress = false;
	                    }

	                    if (!this.horizontalMove) point = new _point.Point(this.lastRelCoordX, relativeCoords.y, _pageIndex);else point = new _point.Point(relativeCoords.x, this.lastRelCoordY, _pageIndex);
	                } else {
	                    this.horizontalMove = false;
	                    this.initialShiftPress = true;
	                    this.lastRelCoordX = relativeCoords.x;
	                    this.lastRelCoordY = relativeCoords.y;
	                    point = new _point.Point(relativeCoords.x, relativeCoords.y, _pageIndex);
	                }

	                // Add new point to the current path
	                switch (this.tools.getCurrentTool()) {
	                    case this.tools.type.brush:
	                        this.layers[this.selectedLayerIndex].addToCurrentPath(point, "add");
	                        break;
	                    case this.tools.type.erase:
	                        this.layers[this.selectedLayerIndex].addToCurrentPath(point, "subtract");
	                        break;
	                    default:
	                        this.layers[this.selectedLayerIndex].addToCurrentPath(point, "add");
	                }

	                var layer = this.layers[this.selectedLayerIndex];
	                layer.getCurrentPath().connectPoint(layer, point, _pageIndex, _zoomLevel, true, this.core.getSettings().renderer, layer.getCanvas(), "page");

	                return;
	            }

	            // If layer changed mid drawing then create a new path on selected layer
	            this.initializeNewPathInCurrentLayer(mousePos);
	            this.layerChangedMidDraw = false;
	        }

	        /*
	            1. Checks if drawing is valid
	            2. Creates a Rectangle object in the selected layer and chooses its mode depending on the current tool
	         */

	    }, {
	        key: 'initializeRectanglePreview',
	        value: function initializeRectanglePreview(mousePos) {
	            if (!this.layers[this.selectedLayerIndex].isActivated()) return;

	            // Drawing on another page
	            if (this.core.getSettings().currentPageIndex !== this.layers[0].pageIndex) return;

	            var pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().zoomLevel,
	                renderer = this.core.getSettings().renderer,
	                relativeCoords = new _point.Point().getRelativeCoordinatesFromPadded(pageIndex, renderer, mousePos.x, mousePos.y, zoomLevel);

	            if (this.uiManager.isInPageBounds(relativeCoords.x, relativeCoords.y)) {
	                var selectedLayer = this.layers[this.selectedLayerIndex];

	                switch (this.tools.getCurrentTool()) {
	                    case this.tools.type.select:
	                        selectedLayer.addShapeToLayer(new _rectangle.Rectangle(new _point.Point(relativeCoords.x, relativeCoords.y, pageIndex), 0, 0, "select", this.tools.getCurrentTool()));
	                        this.selection.setSelectedShape(selectedLayer.getCurrentShape(), this.layers[this.selectedLayerIndex]);
	                        break;
	                    case this.tools.type.rectangle:
	                        if (this.rightMousePressed) selectedLayer.addShapeToLayer(new _rectangle.Rectangle(new _point.Point(relativeCoords.x, relativeCoords.y, pageIndex), 0, 0, "subtract", this.tools.getCurrentTool()));else selectedLayer.addShapeToLayer(new _rectangle.Rectangle(new _point.Point(relativeCoords.x, relativeCoords.y, pageIndex), 0, 0, "add", this.tools.getCurrentTool()));
	                        break;
	                    default:
	                }

	                this.redrawLayer(selectedLayer);
	            }
	        }

	        /*
	            1. Checks if drawing is valid
	            2. Updates the height and width of the current rectangle in the selected layer depending on mouse position
	               or shift press (square)
	            3. Creates a new Rectangle if the layer was changed mid draw
	         */

	    }, {
	        key: 'rectanglePreview',
	        value: function rectanglePreview(mousePos) {
	            if (!this.layers[this.selectedLayerIndex].isActivated()) return;

	            // Drawing on another page
	            if (this.core.getSettings().currentPageIndex !== this.layers[0].pageIndex) return;

	            if (!this.layerChangedMidDraw) {
	                if (!this.mousePressed) return;

	                var pageIndex = this.core.getSettings().currentPageIndex,
	                    zoomLevel = this.core.getSettings().zoomLevel,
	                    renderer = this.core.getSettings().renderer,
	                    relativeCoords = new _point.Point().getRelativeCoordinatesFromPadded(pageIndex, renderer, mousePos.x, mousePos.y, zoomLevel),
	                    rectangle = this.layers[this.selectedLayerIndex].getCurrentShape();

	                if (!this.uiManager.isInPageBounds(relativeCoords.x, relativeCoords.y)) return;

	                var lastWidth = rectangle.relativeRectWidth;
	                rectangle.relativeRectWidth = relativeCoords.x - rectangle.origin.relativeOriginX;

	                // Draw square
	                if (this.shiftDown) {
	                    var mainDiagonal = void 0;

	                    if (this.isInMainDiagonal(relativeCoords, rectangle)) mainDiagonal = 1;else mainDiagonal = -1;

	                    var squareInBounds = this.uiManager.isInPageBounds(rectangle.origin.relativeOriginX + rectangle.relativeRectWidth, rectangle.origin.relativeOriginY + mainDiagonal * rectangle.relativeRectWidth);

	                    if (squareInBounds) rectangle.relativeRectHeight = mainDiagonal * rectangle.relativeRectWidth;else rectangle.relativeRectWidth = lastWidth;
	                } else {
	                    rectangle.relativeRectHeight = relativeCoords.y - rectangle.origin.relativeOriginY;
	                }

	                this.redrawLayer(this.layers[this.selectedLayerIndex]);
	            } else {
	                // Create a new rectangle to which the change will be
	                this.layerChangedMidDraw = false;
	                this.initializeRectanglePreview(mousePos);
	            }
	        }
	    }, {
	        key: 'initializeBrushSizeChange',
	        value: function initializeBrushSizeChange(mousePos) {
	            var brushSizeSlider = document.getElementById("brush-size-selector");
	            this.prevMouseX = mousePos.x;
	            this.prevSize = brushSizeSlider.value;
	        }
	    }, {
	        key: 'changeBrushSize',
	        value: function changeBrushSize(mousePos) {
	            var brushSizeSlider = document.getElementById("brush-size-selector"),
	                mouseXVariation = 0.1 * (parseFloat(mousePos.x) - parseFloat(this.prevMouseX));
	            //Start at the current brush size when varying
	            brushSizeSlider.value = parseFloat(this.prevSize) + mouseXVariation;

	            this.uiManager.resizeBrushCursor();
	        }

	        // TODO: Generalize so that function returns any general relative position using enums
	        /**
	         * Returns true if the relative coordinates provided are on the main diagonal of the origin of the shape (south east or
	         * north west of the origin) otherwise returns false
	         * @param relativeCoords
	         * @param shape
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isInMainDiagonal',
	        value: function isInMainDiagonal(relativeCoords, shape) {
	            if (relativeCoords.x < shape.origin.relativeOriginX && relativeCoords.y < shape.origin.relativeOriginY) return true;else if (relativeCoords.x > shape.origin.relativeOriginX && relativeCoords.y > shape.origin.relativeOriginY) return true;

	            return false;
	        }
	    }, {
	        key: 'redrawLayer',
	        value: function redrawLayer(layer) {
	            layer.drawLayer(this.core.getSettings().maxZoomLevel, layer.getCanvas());
	        }
	    }, {
	        key: 'redrawAllLayers',
	        value: function redrawAllLayers() {
	            var _this6 = this;

	            this.layers.forEach(function (layer) {
	                _this6.redrawLayer(layer);
	            });
	        }
	    }, {
	        key: 'changeCurrentlySelectedLayerIndex',
	        value: function changeCurrentlySelectedLayerIndex(newIndex) {
	            this.selectedLayerIndex = newIndex;
	            if (this.selection !== null) {
	                if (this.selection.imageData === null) {
	                    this.selection.clearSelection(this.core.getSettings().maxZoomLevel);
	                }
	            }
	        }

	        /**
	         * ===============================================
	         *                    Export
	         * ===============================================
	         **/

	        // Will fill a canvas with the highlighted data and scan every pixel of that and fill another canvas with diva data
	        // on the highlighted regions

	    }, {
	        key: 'exportAsImageData',
	        value: function exportAsImageData() {
	            //FIXME: Force Diva to highest zoom level to be able to get the pixel data
	            var pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().zoomLevel;

	            new _export.Export(this, this.layers, pageIndex, zoomLevel, this.uiManager).exportLayersAsImageData();
	        }
	    }, {
	        key: 'exportAsPNG',
	        value: function exportAsPNG() {
	            var pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().zoomLevel;

	            new _export.Export(this, this.layers, pageIndex, zoomLevel, this.uiManager).exportLayersAsPNG();
	        }
	    }, {
	        key: 'exportAsCSV',
	        value: function exportAsCSV() {
	            var pageIndex = this.core.getSettings().currentPageIndex,
	                zoomLevel = this.core.getSettings().maxZoomLevel;

	            new _export.Export(this, this.layers, pageIndex, zoomLevel, this.uiManager).exportLayersAsCSV();
	        }

	        /**
	         * ===============================================
	         *                    Import
	         * ===============================================
	         **/

	    }, {
	        key: 'importPNGToLayer',
	        value: function importPNGToLayer(e) {
	            new _import.Import(this, this.layers, this.core.getSettings().currentPageIndex, this.core.getSettings().zoomLevel, this.uiManager).uploadLocalImageToLayer(this.layers[this.selectedLayerIndex], e);
	        }
	    }]);

	    return PixelPlugin;
	}();

	exports.default = PixelPlugin;


	PixelPlugin.prototype.pluginName = "pixel";
	PixelPlugin.prototype.isPageTool = true;

	/**
	 * Make this plugin available in the global context
	 * as part of the 'Diva' namespace.
	 **/
	(function (global) {
	    global.Diva.PixelPlugin = PixelPlugin;
	})(window);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PixelWrapper = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _rectangle = __webpack_require__(3);

	var _point = __webpack_require__(5);

	var _layer = __webpack_require__(7);

	var _colour = __webpack_require__(6);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PixelWrapper = exports.PixelWrapper = function () {
	    function PixelWrapper(pixelInstance) {
	        _classCallCheck(this, PixelWrapper);

	        this.pixelInstance = pixelInstance;
	        this.layers = pixelInstance.layers;
	        this.layersCount;
	        this.uiManager = pixelInstance.uiManager;
	        this.pageIndex = pixelInstance.core.getSettings().currentPageIndex;
	        this.zoomLevel = pixelInstance.core.getSettings().zoomLevel;
	        this.exportInterrupted = false;
	        this.selectRegionLayer;
	    }

	    _createClass(PixelWrapper, [{
	        key: 'activate',
	        value: function activate() {
	            this.createLayers();
	            this.createButtons();
	            this.rodanImagesToCanvas();
	            this.createHelpBox();
	        }
	    }, {
	        key: 'deactivate',
	        value: function deactivate() {
	            this.destroyButtons();
	        }
	    }, {
	        key: 'createHelpBox',
	        value: function createHelpBox() {
	            // Create help box next to selectRegionLayer selector
	            var selectRegionLayerBox = document.getElementById("layer--1-selector");

	            var helpDiv = document.createElement("div"),
	                helpText = document.createTextNode("?"),
	                tooltipDiv = document.createElement("div"),
	                tooltipText = document.createTextNode("While in the Select Region Layer, use the " + "rectangle tool to select the regions of the page that you will classify. " + "Once you select these regions, select another layer and begin classifying! " + "Make sure to stay within the bounds of the region.");

	            helpDiv.setAttribute("class", "tooltip");
	            helpDiv.appendChild(helpText);
	            tooltipDiv.setAttribute("class", "tooltiptext");
	            tooltipDiv.appendChild(tooltipText);

	            helpDiv.appendChild(tooltipDiv);
	            selectRegionLayerBox.appendChild(helpDiv);
	        }

	        /**
	         *  Creates the number of required layers based on the number of input ports in the Rodan job.
	         *  The variable numberInputLayers is defined in the outermost index.html 
	         */

	    }, {
	        key: 'createLayers',
	        value: function createLayers() {
	            // Set default tool to rectangle (for select region layer)
	            this.pixelInstance.tools.currentTool = "rectangle";

	            // Only create default layers once
	            if (this.layers.length !== 1) {
	                return;
	            }

	            var numLayers = numberInputLayers;

	            // Ask user how many layers to create if there's no input
	            if (numberInputLayers === 0) {
	                numLayers = parseInt(prompt("How many layers will you classify?\n" + "This must be the same number as the number of output ports.", 3));
	            }

	            this.selectRegionLayer = new _layer.Layer(-1, new _colour.Colour(240, 232, 227, 1), "Select Region", this.pixelInstance, 0.3);
	            this.layers.unshift(this.selectRegionLayer);

	            // There is 1 active layer already created by default in PixelPlugin with layerId = 1, 
	            // so start at 2, and ignore one input layer which gets assigned to layer 1
	            for (var i = 2; i < numLayers + 1; i++) {
	                var colour = void 0;
	                switch (i) {
	                    case 2:
	                        colour = new _colour.Colour(255, 51, 102, 1);
	                        break;
	                    case 3:
	                        colour = new _colour.Colour(255, 255, 10, 1);
	                        break;
	                    case 4:
	                        colour = new _colour.Colour(2, 136, 0, 1);
	                        break;
	                    case 5:
	                        colour = new _colour.Colour(96, 0, 186, 1);
	                        break;
	                    case 6:
	                        colour = new _colour.Colour(239, 143, 0, 1);
	                        break;
	                    case 7:
	                        colour = new _colour.Colour(71, 239, 200, 1);
	                        break;
	                }
	                var layer = new _layer.Layer(i, colour, "Layer " + i, this.pixelInstance, 0.5);
	                this.layers.push(layer);
	            }

	            this.pixelInstance.layerIdCounter = this.layers.length;

	            // Refresh UI 
	            this.uiManager.destroyPluginElements(this.layers, this.pixelInstance.background);
	            this.uiManager.createPluginElements(this.layers);
	        }
	    }, {
	        key: 'createButtons',
	        value: function createButtons() {
	            var _this = this;

	            var rodanExportButton = document.createElement("button"),
	                rodanExportText = document.createTextNode("Submit To Rodan");

	            this.exportToRodan = function () {
	                _this.createBackgroundLayer();
	            }; // This will call exportLayersToRodan when done

	            rodanExportButton.setAttribute("id", "rodan-export-button");
	            rodanExportButton.appendChild(rodanExportText);
	            rodanExportButton.addEventListener("click", this.exportToRodan);

	            document.body.insertBefore(rodanExportButton, document.getElementById('imageLoader'));
	        }
	    }, {
	        key: 'destroyButtons',
	        value: function destroyButtons() {
	            var rodanExportButton = document.getElementById("rodan-export-button");

	            rodanExportButton.parentNode.removeChild(rodanExportButton);
	        }
	    }, {
	        key: 'exportLayersToRodan',
	        value: function exportLayersToRodan() {
	            console.log("Exporting!");

	            var count = this.layers.length;
	            var urlList = [];

	            this.layers.forEach(function (layer) {

	                console.log(layer.layerId + " " + layer.layerName);

	                var dataURL = layer.getCanvas().toDataURL();
	                urlList[layer.layerId] = dataURL;
	                count -= 1;
	                if (count === 0) {
	                    console.log(urlList);
	                    console.log("done");

	                    $.ajax({ url: '', type: 'POST', data: JSON.stringify({ 'user_input': urlList }), contentType: 'application/json' });
	                }
	            });

	            setTimeout(function () {
	                alert("Submission successful! Click OK to exit Pixel.js.");
	            }, 100);
	            setTimeout(function () {
	                window.close();
	            }, 200);
	        }

	        /**
	         *  Generates a background layer by iterating over all the pixel data for each layer and 
	         *  subtracting it from the background layer if the data is non-transparent (alpha != 0). Somewhat
	         *  replicates what the exportLayersAsImageData function does but for generating the background
	         *  layer, and there are numerous (albeit small) differences that requires a new function
	         */

	    }, {
	        key: 'createBackgroundLayer',
	        value: function createBackgroundLayer() {
	            var _this2 = this;

	            // Don't export selectRegionLayer to Rodan
	            this.layers.shift();

	            // NOTE: this backgroundLayer and the original background (image) both have layerId 0, but 
	            // this backgroundLayer is only created upon submitting (so no conflicts)
	            var backgroundLayer = new _layer.Layer(0, new _colour.Colour(242, 0, 242, 1), "Background Layer", this.pixelInstance, 0.5, this.pixelInstance.actions),
	                maxZoom = this.pixelInstance.core.getSettings().maxZoomLevel,
	                width = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, maxZoom).width,
	                height = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, maxZoom).height,
	                regions = this.selectRegionLayer.shapes,
	                addRegionsCount = 0;

	            // Add select regions to backgroundLayer
	            regions.forEach(function (region) {
	                // Get shape dimensions
	                var x = region.origin.getCoordsInPage(maxZoom).x,
	                    y = region.origin.getCoordsInPage(maxZoom).y,
	                    rectWidth = region.relativeRectWidth * Math.pow(2, maxZoom),
	                    rectHeight = region.relativeRectHeight * Math.pow(2, maxZoom),
	                    rect = new _rectangle.Rectangle(new _point.Point(x, y, _this2.pageIndex), rectWidth, rectHeight, "add");

	                if (region.blendMode === "subtract") {
	                    rect.changeBlendModeTo("subtract");
	                } else {
	                    addRegionsCount++;
	                }

	                backgroundLayer.addShapeToLayer(rect);
	            });
	            backgroundLayer.drawLayer(maxZoom, backgroundLayer.getCanvas());

	            // Instantiate progress bar
	            this.uiManager.createExportElements(this);

	            this.layersCount = this.layers.length * addRegionsCount;
	            this.layers.forEach(function (layer) {
	                // Create layer canvas and draw (so pixel data can be accessed)
	                var layerCanvas = document.createElement('canvas');
	                layerCanvas.setAttribute("class", "export-page-canvas");
	                layerCanvas.setAttribute("id", "layer-" + layer.layerId + "-export-canvas");
	                layerCanvas.setAttribute("style", "position: absolute; top: 0; left: 0;");
	                layerCanvas.width = width;
	                layerCanvas.height = height;
	                layer.drawLayerInPageCoords(maxZoom, layerCanvas, _this2.pageIndex);

	                for (var i = 0; i < regions.length; i++) {
	                    if (regions[i].blendMode === "add") {
	                        var x = regions[i].origin.getCoordsInPage(maxZoom).x,
	                            y = regions[i].origin.getCoordsInPage(maxZoom).y,
	                            _width = regions[i].relativeRectWidth * Math.pow(2, maxZoom),
	                            _height = regions[i].relativeRectHeight * Math.pow(2, maxZoom);
	                        _this2.subtractLayerFromBackground(backgroundLayer, layerCanvas, x, y, _width, _height);
	                    }
	                }
	            });
	        }
	    }, {
	        key: 'subtractLayerFromBackground',
	        value: function subtractLayerFromBackground(backgroundLayer, layerCanvas, x, y, width, height) {
	            var _this3 = this;

	            var chunkSize = width,
	                chunkNum = 0,
	                row = y,
	                col = x,
	                pixelCtx = layerCanvas.getContext('2d');

	            var doChunk = function doChunk() {
	                var cnt = chunkSize;
	                chunkNum++;
	                while (cnt--) {
	                    if (row >= height + y) break;
	                    if (col < width + x) {
	                        var data = pixelCtx.getImageData(col, row, 1, 1).data;
	                        // data is RGBA for one pixel, data[3] is alpha
	                        if (data[3] !== 0) {
	                            var currentPixel = new _rectangle.Rectangle(new _point.Point(col, row, _this3.pageIndex), 1, 1, "subtract");
	                            backgroundLayer.addShapeToLayer(currentPixel);
	                        }
	                        col++;
	                    } else {
	                        // Reached end of row, jump to next
	                        row++;
	                        col = x;
	                    }
	                }
	                if (_this3.progress(row, chunkSize, chunkNum, height + y, backgroundLayer).needsRecall) {
	                    // recall function
	                    setTimeout(doChunk, 1);
	                }
	            };
	            doChunk();
	        }
	    }, {
	        key: 'progress',
	        value: function progress(row, chunkSize, chunkNum, height, backgroundLayer) {
	            if (row === height || this.exportInterrupted) {
	                this.layersCount -= 1;
	            }
	            if (row < height && !this.exportInterrupted) {
	                var percentage = chunkNum * chunkSize * 100 / (height * chunkSize),
	                    roundedPercentage = percentage > 100 ? 100 : Math.round(percentage * 10) / 10;
	                this.pixelInstance.uiManager.updateProgress(roundedPercentage);
	                return {
	                    needsRecall: true
	                };
	            } else {
	                if (this.exportInterrupted && this.layersCount === 0) {
	                    this.exportInterrupted = false;
	                    this.uiManager.destroyExportElements();
	                    this.layers.unshift(this.selectRegionLayer);
	                } else if (this.exportInterrupted) {
	                    // Do nothing and wait until last layer has finished processing to cancel
	                } else if (this.layersCount === 0) {
	                    // Done generating background layer
	                    backgroundLayer.drawLayer(0, backgroundLayer.getCanvas());
	                    this.layers.unshift(backgroundLayer);
	                    this.uiManager.destroyExportElements();
	                    // this.exportLayersToRodan();
	                }
	            }
	            return {
	                needsRecall: false
	            };
	        }
	    }, {
	        key: 'rodanImagesToCanvas',
	        value: function rodanImagesToCanvas() {
	            var _this4 = this;

	            this.layers.forEach(function (layer) {
	                var img = document.getElementById("layer" + layer.layerId + "-img");
	                if (img !== null) {
	                    var imageCanvas = document.createElement("canvas");
	                    imageCanvas.width = layer.getCanvas().width;
	                    imageCanvas.height = layer.getCanvas().height;
	                    var ctx = imageCanvas.getContext("2d");

	                    ctx.drawImage(img, 0, 0);

	                    var imageData = ctx.getImageData(0, 0, layer.getCanvas().width, layer.getCanvas().height),
	                        data = imageData.data;

	                    for (var i = 0; i < data.length; i += 4) {
	                        data[i] = layer.colour.red; // red
	                        data[i + 1] = layer.colour.green; // green
	                        data[i + 2] = layer.colour.blue; // blue
	                    }
	                    // overwrite original image
	                    ctx.putImageData(imageData, 0, 0);

	                    layer.backgroundImageCanvas = imageCanvas;
	                    layer.drawLayer(_this4.pixelInstance.core.getSettings().maxZoomLevel, layer.getCanvas());
	                }
	            });
	        }
	    }]);

	    return PixelWrapper;
	}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Rectangle = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _shape = __webpack_require__(4);

	var _colour = __webpack_require__(6);

	var _point = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*jshint esversion: 6 */


	var Rectangle = exports.Rectangle = function (_Shape) {
	    _inherits(Rectangle, _Shape);

	    function Rectangle(point, relativeRectWidth, relativeRectHeight, blendMode) {
	        _classCallCheck(this, Rectangle);

	        var _this = _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this, point, blendMode));

	        _this.relativeRectWidth = relativeRectWidth;
	        _this.relativeRectHeight = relativeRectHeight;
	        return _this;
	    }

	    /**
	     * draws a rectangle of a certain layer in a canvas using viewport coordinates (padded coordinates)
	     * @param layer
	     * @param pageIndex
	     * @param zoomLevel
	     * @param renderer
	     * @param canvas
	     */


	    _createClass(Rectangle, [{
	        key: 'drawInViewport',
	        value: function drawInViewport(layer, pageIndex, zoomLevel, renderer, canvas) {
	            var scaleRatio = Math.pow(2, zoomLevel),
	                ctx = canvas.getContext('2d');

	            var viewportPaddingX = Math.max(0, (renderer._viewport.width - renderer.layout.dimensions.width) / 2);
	            var viewportPaddingY = Math.max(0, (renderer._viewport.height - renderer.layout.dimensions.height) / 2);

	            // The following absolute values are experimental values to highlight the square on the first page of Salzinnes, CDN-Hsmu M2149.L4
	            // The relative values are used to scale the highlights according to the zoom level on the page itself
	            var absoluteRectOriginX = this.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.relativeRectHeight * scaleRatio;

	            //Selection tool
	            if (this.blendMode === "select") {
	                //TODO: SELECTION CODE HERE
	                if (pageIndex === this.origin.pageIndex) {
	                    // Calculates where the highlights should be drawn as a function of the whole webpage coordinates
	                    // (to make it look like it is on top of a page in Diva)
	                    var highlightXOffset = renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX + absoluteRectOriginX,
	                        highlightYOffset = renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY + absoluteRectOriginY;

	                    //Draw the selection rectangle
	                    ctx.fillStyle = 'rgba(147, 192, 255, 0.3)';
	                    ctx.lineWidth = 1;
	                    ctx.strokeStyle = 'rgba(25, 25, 25, 1)';
	                    ctx.fillRect(highlightXOffset, highlightYOffset, absoluteRectWidth, absoluteRectHeight);
	                    ctx.strokeRect(highlightXOffset, highlightYOffset, absoluteRectWidth, absoluteRectHeight);
	                }
	                return;
	            }

	            //Rectangle tool
	            // TODO: Use padded coordinates
	            if (this.blendMode === "add") {
	                if (pageIndex === this.origin.pageIndex) {
	                    // Calculates where the highlights should be drawn as a function of the whole webpage coordinates
	                    // (to make it look like it is on top of a page in Diva)
	                    var _highlightXOffset = renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX + absoluteRectOriginX,
	                        _highlightYOffset = renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY + absoluteRectOriginY;

	                    //Draw the rectangle
	                    ctx.fillStyle = layer.colour.toHTMLColour();
	                    ctx.fillRect(_highlightXOffset, _highlightYOffset, absoluteRectWidth, absoluteRectHeight);
	                }
	            } else if (this.blendMode === "subtract") {
	                if (pageIndex === this.origin.pageIndex) {
	                    // Calculates where the highlights should be drawn as a function of the whole webpage coordinates
	                    // (to make it look like it is on top of a page in Diva)
	                    var _highlightXOffset2 = renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX + absoluteRectOriginX,
	                        _highlightYOffset2 = renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY + absoluteRectOriginY;

	                    //Draw the rectangle
	                    ctx.fillStyle = layer.colour.toHTMLColour();
	                    ctx.clearRect(_highlightXOffset2, _highlightYOffset2, absoluteRectWidth, absoluteRectHeight);
	                }
	            }
	        }

	        /**
	         * draws a rectangle of a certain layer in a canvas using absolute page coordinates
	         * @param layer
	         * @param pageIndex
	         * @param zoomLevel
	         * @param renderer
	         * @param canvas
	         */

	    }, {
	        key: 'drawOnPage',
	        value: function drawOnPage(layer, pageIndex, zoomLevel, renderer, canvas) {
	            var scaleRatio = Math.pow(2, zoomLevel),
	                ctx = canvas.getContext('2d');

	            // The following absolute values are experimental values to highlight the square on the first page of Salzinnes, CDN-Hsmu M2149.L4
	            // The relative values are used to scale the highlights according to the zoom level on the page itself
	            var absoluteRectOriginX = this.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.relativeRectHeight * scaleRatio;

	            if (this.blendMode === "select") {
	                //TODO: SELECTION CODE HERE
	                if (pageIndex === this.origin.pageIndex) {
	                    //Draw the selection rectangle
	                    ctx.fillStyle = 'rgba(147, 192, 255, 0.5)';
	                    ctx.lineWidth = 30 / scaleRatio;
	                    ctx.strokeStyle = 'rgba(97, 142, 205, 1)';
	                    ctx.fillRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                    ctx.strokeRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                }
	            }

	            // TODO: Use padded coordinates
	            else if (this.blendMode === "add") {
	                    if (pageIndex === this.origin.pageIndex && layer.layerId === -1) // "Select Region" layer 
	                        {
	                            // Draw the rectangle with a border
	                            ctx.fillStyle = layer.colour.toHTMLColour();
	                            ctx.lineWidth = 1;
	                            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
	                            ctx.fillRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                            ctx.strokeRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                        } else if (pageIndex === this.origin.pageIndex) {
	                        // Draw rectangle without border
	                        ctx.fillStyle = layer.colour.toHTMLColour();
	                        ctx.fillRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                    }
	                } else if (this.blendMode === "subtract") {
	                    if (pageIndex === this.origin.pageIndex) {
	                        //Draw the rectangle
	                        ctx.fillStyle = layer.colour.toHTMLColour();
	                        ctx.clearRect(absoluteRectOriginX, absoluteRectOriginY, absoluteRectWidth, absoluteRectHeight);
	                    }
	                }
	        }

	        /**
	         * Gets all the pixels spanned by a rectangle. Draws the image data that the rectangle covers (from the imageCanvas) in the drawingCanvas
	         * @param layer
	         * @param pageIndex
	         * @param zoomLevel
	         * @param renderer
	         * @param drawingCanvas
	         * @param imageCanvas
	         */

	    }, {
	        key: 'getPixels',
	        value: function getPixels(layer, pageIndex, zoomLevel, renderer, drawingCanvas, imageCanvas) {
	            // FIXME: sometimes copying and pasting scaled image data goes beyond the rectangle (compute bounds using the scaleRatio)

	            var scaleRatio = Math.pow(2, zoomLevel),
	                pixelCtx = drawingCanvas.getContext('2d'),
	                divaCtx = imageCanvas.getContext('2d');

	            // The following absolute values are experimental values to highlight the square on the first page of Salzinnes, CDN-Hsmu M2149.L4
	            // The relative values are used to scale the highlights according to the zoom level on the page itself
	            var absoluteRectOriginX = this.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.relativeRectHeight * scaleRatio;

	            if (pageIndex === this.origin.pageIndex) {
	                for (var row = Math.round(Math.min(absoluteRectOriginY, absoluteRectOriginY + absoluteRectHeight)); row < Math.max(absoluteRectOriginY, absoluteRectOriginY + absoluteRectHeight); row++) {
	                    for (var col = Math.round(Math.min(absoluteRectOriginX, absoluteRectOriginX + absoluteRectWidth)); col < Math.max(absoluteRectOriginX, absoluteRectOriginX + absoluteRectWidth); col++) {
	                        if (row >= 0 && col >= 0 && row < drawingCanvas.height && col < drawingCanvas.width) {
	                            if (this.blendMode === "add") {
	                                var paddedCoords = new _point.Point().getPaddedCoordinatesFromAbsolute(pageIndex, renderer, col, row),
	                                    data = divaCtx.getImageData(paddedCoords.x, paddedCoords.y, 1, 1).data,
	                                    colour = new _colour.Colour(data[0], data[1], data[2], data[3]);

	                                var maxLevelCol = col / scaleRatio * Math.pow(2, 5),
	                                    // FIXME: Replace with maxZoomLevel
	                                maxLevelRow = row / scaleRatio * Math.pow(2, 5);

	                                pixelCtx.fillStyle = colour.toHTMLColour();
	                                pixelCtx.fillRect(maxLevelCol, maxLevelRow, Math.pow(2, 5), Math.pow(2, 5));
	                            } else if (this.blendMode === "subtract") {
	                                pixelCtx.clearRect(col, row, 1, 1);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }]);

	    return Rectangle;
	}(_shape.Shape);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Shape = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*jshint esversion: 6 */


	var _point = __webpack_require__(5);

	var _colour = __webpack_require__(6);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Shape = exports.Shape = function () {
	    function Shape(point, blendMode) {
	        _classCallCheck(this, Shape);

	        this.origin = point;
	        this.type = "shape";
	        this.blendMode = blendMode;
	    }

	    /**
	     * Abstract method, to be overridden
	     */


	    _createClass(Shape, [{
	        key: 'drawInViewport',
	        value: function drawInViewport() {}

	        /**
	         * Abstract method, to be overridden
	         */

	    }, {
	        key: 'drawOnPage',
	        value: function drawOnPage() {}
	    }, {
	        key: 'changeBlendModeTo',
	        value: function changeBlendModeTo(newBlendMode) {
	            this.blendMode = newBlendMode;
	        }

	        /**
	         * Gets all the pixels spanned by a shape given its set of edges. Draws the image data that the shape covers (from the imageCanvas) in the drawingCanvas
	         * @param layer
	         * @param pageIndex
	         * @param zoomLevel
	         * @param renderer
	         * @param drawingCanvas
	         * @param imageCanvas
	         * @param ymax
	         * @param ymin
	         * @param pairOfEdges
	         */

	    }, {
	        key: 'getPixels',
	        value: function getPixels(layer, pageIndex, zoomLevel, renderer, drawingCanvas, imageCanvas, ymax, ymin, pairOfEdges) {
	            var drawingCtx = drawingCanvas.getContext('2d'),
	                imageCtx = imageCanvas.getContext('2d');

	            // TODO: Check for horizontal or vertical lines
	            // For every scan line
	            for (var y = ymin; y < ymax; y++) {
	                var intersectionPoints = [];

	                // For every line calculate the intersection edges
	                for (var e = 0; e < pairOfEdges.length; e++) {
	                    // Calculate intersection with line
	                    for (var p = 0; p < pairOfEdges[e].length - 1; p++) {
	                        var x1 = pairOfEdges[e][p].absolutePaddedX,
	                            y1 = pairOfEdges[e][p].absolutePaddedY,
	                            x2 = pairOfEdges[e][p + 1].absolutePaddedX,
	                            y2 = pairOfEdges[e][p + 1].absolutePaddedY;

	                        //ctx.fillStyle = layer.colour.toHTMLColour();
	                        var deltax = x2 - x1,
	                            deltay = y2 - y1;

	                        var x = x1 + deltax / deltay * (y - y1),
	                            roundedX = Math.round(x);

	                        if (y1 <= y && y2 > y || y2 <= y && y1 > y) {
	                            intersectionPoints.push({
	                                absolutePaddedX: roundedX,
	                                absolutePaddedY: y
	                            });
	                        }
	                    }
	                }

	                intersectionPoints.sort(function (a, b) {
	                    return a.absolutePaddedX - b.absolutePaddedX;
	                });

	                if (intersectionPoints.length <= 0) continue;

	                // Start filling
	                for (var index = 0; index < intersectionPoints.length - 1; index++) {
	                    // Draw from the first intersection to the next, stop drawing until you see a new intersection line
	                    if (index % 2 === 0) {
	                        var start = intersectionPoints[index].absolutePaddedX,
	                            // This will contain the start of the x coords to fill
	                        end = intersectionPoints[index + 1].absolutePaddedX,
	                            // This will contain the end of the x coords to fill
	                        _y = intersectionPoints[index].absolutePaddedY;

	                        for (var fill = start; fill < end; fill++) {
	                            // Remove padding to get absolute coordinates
	                            var absoluteCoords = new _point.Point().getAbsoluteCoordinatesFromPadded(pageIndex, renderer, fill, _y);

	                            if (this.blendMode === "add") {
	                                // Necessary check because sometimes the brush draws outside of a page because of brush width
	                                if (absoluteCoords.y >= 0 && absoluteCoords.x >= 0 && absoluteCoords.y <= drawingCanvas.height && absoluteCoords.x <= drawingCanvas.width) {
	                                    // TODO: Can also pass in and fill a matrix
	                                    var paddedCoords = new _point.Point().getPaddedCoordinatesFromAbsolute(pageIndex, renderer, absoluteCoords.x, absoluteCoords.y),
	                                        data = imageCtx.getImageData(paddedCoords.x, paddedCoords.y, 1, 1).data,
	                                        colour = new _colour.Colour(data[0], data[1], data[2], data[3]);

	                                    drawingCtx.fillStyle = colour.toHTMLColour();
	                                    drawingCtx.fillRect(absoluteCoords.x, absoluteCoords.y, 1, 1);
	                                }
	                            } else if (this.blendMode === "subtract") {
	                                drawingCtx.clearRect(absoluteCoords.x, absoluteCoords.y, 1, 1);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }]);

	    return Shape;
	}();

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Point = exports.Point = function () {
	    /**
	     * The relative origins allow to position the point at the same page location no matter what the zoom level is
	     * @param relativeOriginX
	     * @param relativeOriginY
	     * @param pageIndex
	     */
	    function Point(relativeOriginX, relativeOriginY, pageIndex) {
	        _classCallCheck(this, Point);

	        this.relativeOriginX = relativeOriginX;
	        this.relativeOriginY = relativeOriginY;
	        this.pageIndex = pageIndex;
	    }

	    /**
	     * Calculates the coordinates of a point on a page in pixels given the zoom level
	     * where the top left corner of the page always represents the (0,0) coordinate.
	     * The function scales the relative coordinates to the required zoom level.
	     * @param zoomLevel
	     * @returns {{x: number, y: number}}
	     */


	    _createClass(Point, [{
	        key: "getCoordsInPage",
	        value: function getCoordsInPage(zoomLevel) {
	            var scaleRatio = Math.pow(2, zoomLevel);
	            return {
	                x: this.relativeOriginX * scaleRatio,
	                y: this.relativeOriginY * scaleRatio
	            };
	        }

	        /**
	         * Calculates the coordinates of a point on the diva canvas (viewport) in pixels, where the top left corner of the canvas
	         * represents the (0,0) coordinate.
	         * This is relative to the viewport padding.
	         * @param zoomLevel
	         * @param pageIndex
	         * @param renderer
	         * @returns {{x: number, y: number}}
	         */

	    }, {
	        key: "getCoordsInViewport",
	        value: function getCoordsInViewport(zoomLevel, pageIndex, renderer) {
	            var viewportPaddingX = Math.max(0, (renderer._viewport.width - renderer.layout.dimensions.width) / 2);
	            var viewportPaddingY = Math.max(0, (renderer._viewport.height - renderer.layout.dimensions.height) / 2);

	            var absoluteCoordinates = this.getCoordsInPage(zoomLevel);

	            // Calculates where the highlights should be drawn as a function of the whole canvas coordinates system
	            // (to make it look like it is on top of a page in Diva)
	            var offsetX = renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX + absoluteCoordinates.x,
	                offsetY = renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY + absoluteCoordinates.y;

	            return {
	                x: offsetX,
	                y: offsetY
	            };
	        }

	        /**
	         * Calculates the coordinates of a point on a page in pixels
	         * from the padded coordinates used to display the point on diva canvas (viewport)
	         * @param pageIndex
	         * @param renderer
	         * @param paddedX
	         * @param paddedY
	         * @returns {{x: number, y: number}}
	         */

	    }, {
	        key: "getAbsoluteCoordinatesFromPadded",
	        value: function getAbsoluteCoordinatesFromPadded(pageIndex, renderer, paddedX, paddedY) {
	            var viewportPaddingX = Math.max(0, (renderer._viewport.width - renderer.layout.dimensions.width) / 2);
	            var viewportPaddingY = Math.max(0, (renderer._viewport.height - renderer.layout.dimensions.height) / 2);

	            return {
	                x: Math.round(paddedX - (renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX)),
	                y: Math.round(paddedY - (renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY))
	            };
	        }

	        /**
	         * Calculates the coordinates of a point on diva canvas (viewport) in pixels
	         * from the absolute coordinates on the page
	         * @param pageIndex
	         * @param renderer
	         * @param absoluteX
	         * @param absoluteY
	         * @returns {{x: *, y: *}}
	         */

	    }, {
	        key: "getPaddedCoordinatesFromAbsolute",
	        value: function getPaddedCoordinatesFromAbsolute(pageIndex, renderer, absoluteX, absoluteY) {
	            var viewportPaddingX = Math.max(0, (renderer._viewport.width - renderer.layout.dimensions.width) / 2);
	            var viewportPaddingY = Math.max(0, (renderer._viewport.height - renderer.layout.dimensions.height) / 2);

	            // Calculates where the highlights should be drawn as a function of the whole canvas coordinates system
	            // (to make it look like it is on top of a page in Diva)
	            return {
	                x: renderer._getImageOffset(pageIndex).left - renderer._viewport.left + viewportPaddingX + absoluteX,
	                y: renderer._getImageOffset(pageIndex).top - renderer._viewport.top + viewportPaddingY + absoluteY
	            };
	        }

	        /**
	         * Calculates the coordinates of a point relative to a page (used to calculate the absolute coordinates at different zoom levels) in pixels
	         * from the padded coordinates used to display the point on diva canvas (viewport)
	         * @param pageIndex
	         * @param renderer
	         * @param paddedX
	         * @param paddedY
	         * @param zoomLevel
	         * @returns {{x: number, y: number}}
	         */

	    }, {
	        key: "getRelativeCoordinatesFromPadded",
	        value: function getRelativeCoordinatesFromPadded(pageIndex, renderer, paddedX, paddedY, zoomLevel) {
	            var scaleRatio = Math.pow(2, zoomLevel);

	            var viewportPaddingX = Math.max(0, (renderer._viewport.width - renderer.layout.dimensions.width) / 2);
	            var viewportPaddingY = Math.max(0, (renderer._viewport.height - renderer.layout.dimensions.height) / 2);

	            // Calculates where the highlights should be drawn as a function of the whole webpage coordinates
	            // (to make it look like it is on top of a page in Diva)
	            var absoluteRectOriginX = paddedX - renderer._getImageOffset(pageIndex).left + renderer._viewport.left - viewportPaddingX,
	                absoluteRectOriginY = paddedY - renderer._getImageOffset(pageIndex).top + renderer._viewport.top - viewportPaddingY;

	            return {
	                x: absoluteRectOriginX / scaleRatio,
	                y: absoluteRectOriginY / scaleRatio
	            };
	        }
	    }]);

	    return Point;
	}();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Colour = exports.Colour = function () {
	    function Colour(red, green, blue, alpha) {
	        _classCallCheck(this, Colour);

	        this.red = red;
	        this.green = green;
	        this.blue = blue;
	        this.alpha = alpha;
	    }

	    /**
	     * Turns the red, green, blue and opacity values into an HTML colour
	     * @returns {string}
	     */


	    _createClass(Colour, [{
	        key: "toHTMLColour",
	        value: function toHTMLColour() {
	            return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
	        }

	        /**
	         * Returns the Colour object in a hexadecimal string format (#RRGGBB)
	         * @returns {string}
	         */

	    }, {
	        key: "toHexString",
	        value: function toHexString() {
	            var hexString = "#";

	            var red = this.red.toString(16),
	                green = this.green.toString(16),
	                blue = this.blue.toString(16);

	            if (red.length === 1) hexString = hexString.concat("0");
	            hexString = hexString.concat(red);

	            if (green.length === 1) hexString = hexString.concat("0");
	            hexString = hexString.concat(green);

	            if (blue.length === 1) hexString = hexString.concat("0");
	            hexString = hexString.concat(blue);

	            return hexString;
	        }

	        /**
	         * Compares 2 colours to each other based on a certain tolerance
	         * @param colour
	         * @param tolerance
	         * @returns {boolean}
	         */

	    }, {
	        key: "isSimilarTo",
	        value: function isSimilarTo(colour, tolerance) {
	            if (!(colour.red >= this.red - tolerance && colour.red <= this.red + tolerance)) return false;

	            if (!(colour.blue >= this.blue - tolerance && colour.blue <= this.blue + tolerance)) return false;

	            if (!(colour.green >= this.green - tolerance && colour.green <= this.green + tolerance)) return false;

	            return true;
	        }
	    }]);

	    return Colour;
	}();

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Layer = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*jshint esversion: 6 */


	var _path = __webpack_require__(8);

	var _point = __webpack_require__(5);

	var _action = __webpack_require__(9);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Layer = exports.Layer = function () {
	    function Layer(layerId, colour, layerName, pixelInstance, layerOpacity) {
	        _classCallCheck(this, Layer);

	        this.layerId = layerId;
	        this.shapes = [];
	        this.paths = [];
	        this.colour = colour;
	        this.layerName = layerName;
	        this.canvas = null;
	        this.ctx = null;
	        this.actions = [];
	        this.activated = true;
	        this.layerOpacity = layerOpacity;
	        this.pixelInstance = pixelInstance;
	        this.pageIndex = this.pixelInstance.core.getSettings().currentPageIndex;
	        this.backgroundImageCanvas = null;
	        this.pastedRegions = [];
	        this.cloneCanvas();
	    }

	    /**
	     * Creates a layer canvas that is the same size as a page in diva
	     */


	    _createClass(Layer, [{
	        key: 'cloneCanvas',
	        value: function cloneCanvas() {
	            var maxZoomLevel = this.pixelInstance.core.getSettings().maxZoomLevel;

	            var height = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, maxZoomLevel).height,
	                width = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, maxZoomLevel).width;

	            this.canvas = document.createElement('canvas');
	            this.canvas.setAttribute("class", "pixel-canvas");
	            this.canvas.setAttribute("id", "layer-" + this.layerId + "-canvas");
	            this.canvas.width = width;
	            this.canvas.height = height;

	            this.ctx = this.canvas.getContext('2d');

	            this.resizeLayerCanvasToZoomLevel(this.pixelInstance.core.getSettings().zoomLevel);
	            this.placeLayerCanvasOnTopOfEditingPage();

	            this.backgroundImageCanvas = document.createElement("canvas");
	            this.backgroundImageCanvas.width = this.canvas.width;
	            this.backgroundImageCanvas.height = this.canvas.height;
	        }
	    }, {
	        key: 'resizeLayerCanvasToZoomLevel',
	        value: function resizeLayerCanvasToZoomLevel(zoomLevel) {
	            var floorZoom = Math.floor(zoomLevel),
	                extra = zoomLevel - floorZoom,
	                scaleRatio = Math.pow(2, extra);

	            var height = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, floorZoom).height,
	                width = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, floorZoom).width;

	            width *= scaleRatio;
	            height *= scaleRatio;

	            this.canvas.style.width = width + "px";
	            this.canvas.style.height = height + "px";

	            this.placeLayerCanvasOnTopOfEditingPage();

	            if (this.pixelInstance.uiManager !== null) this.pixelInstance.uiManager.resizeBrushCursor();
	        }
	    }, {
	        key: 'placeLayerCanvasOnTopOfEditingPage',
	        value: function placeLayerCanvasOnTopOfEditingPage() {
	            var zoomLevel = this.pixelInstance.core.getSettings().zoomLevel;

	            var coords = new _point.Point(0, 0, 0).getCoordsInViewport(zoomLevel, this.pageIndex, this.pixelInstance.core.getSettings().renderer);

	            this.canvas.style.left = coords.x + "px";
	            this.canvas.style.top = coords.y + "px";
	        }
	    }, {
	        key: 'placeCanvasAfterElement',
	        value: function placeCanvasAfterElement(element) {
	            element.parentNode.insertBefore(this.canvas, element.nextSibling);
	        }
	    }, {
	        key: 'getCanvas',
	        value: function getCanvas() {
	            return this.canvas;
	        }
	    }, {
	        key: 'getCtx',
	        value: function getCtx() {
	            return this.ctx;
	        }
	    }, {
	        key: 'clearCtx',
	        value: function clearCtx() {
	            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	        }
	    }, {
	        key: 'updateLayerName',
	        value: function updateLayerName(newLayerName) {
	            this.layerName = newLayerName;
	        }
	    }, {
	        key: 'addShapeToLayer',
	        value: function addShapeToLayer(shape) {
	            this.shapes.push(shape);
	            this.addAction(new _action.Action(shape, this));
	        }
	    }, {
	        key: 'addPathToLayer',
	        value: function addPathToLayer(path) {
	            this.paths.push(path);
	            this.addAction(new _action.Action(path, this));
	        }

	        /**
	         * Creates a new path that has the brush size selector width
	         * @param point
	         * @param blendMode
	         */

	    }, {
	        key: 'addToCurrentPath',
	        value: function addToCurrentPath(point, blendMode) {
	            if (this.paths.length === 0) this.createNewPath(this.pixelInstance.uiManager.getBrushSizeSelectorValue(), blendMode);

	            this.paths[this.paths.length - 1].addPointToPath(point);
	        }
	    }, {
	        key: 'getCurrentPath',
	        value: function getCurrentPath() {
	            if (this.paths.length > 0) return this.paths[this.paths.length - 1];else return null;
	        }
	    }, {
	        key: 'createNewPath',
	        value: function createNewPath(brushSize, blendMode) {
	            var path = new _path.Path(brushSize, blendMode);
	            this.paths.push(path);
	            this.addAction(new _action.Action(path, this));
	        }
	    }, {
	        key: 'removePathFromLayer',
	        value: function removePathFromLayer(path) {
	            var _this = this;

	            var index = this.paths.indexOf(path);
	            this.paths.splice(index, 1);

	            this.actions.forEach(function (action) {
	                if (action.object === path) {
	                    _this.removeAction(action);
	                }
	            });
	        }
	    }, {
	        key: 'removeShapeFromLayer',
	        value: function removeShapeFromLayer(shape) {
	            var _this2 = this;

	            var index = this.shapes.indexOf(shape);
	            this.shapes.splice(index, 1);

	            this.actions.forEach(function (action) {
	                if (action.object === shape) _this2.removeAction(action);
	            });
	        }
	    }, {
	        key: 'removeSelectionFromLayer',
	        value: function removeSelectionFromLayer(selection) {
	            var _this3 = this;

	            var index = this.pastedRegions.indexOf(selection);
	            this.pastedRegions.splice(index, 1);

	            this.actions.forEach(function (action) {
	                if (action.object === selection) _this3.removeAction(action);
	            });
	        }
	    }, {
	        key: 'setOpacity',
	        value: function setOpacity(opacity) {
	            this.colour.alpha = opacity;
	        }
	    }, {
	        key: 'getOpacity',
	        value: function getOpacity() {
	            return this.colour.alpha;
	        }
	    }, {
	        key: 'getCurrentShape',
	        value: function getCurrentShape() {
	            if (this.shapes.length > 0) {
	                return this.shapes[this.shapes.length - 1];
	            } else {
	                return null;
	            }
	        }
	    }, {
	        key: 'isActivated',
	        value: function isActivated() {
	            return this.activated;
	        }
	    }, {
	        key: 'setLayerOpacity',
	        value: function setLayerOpacity(layerOpacity) {
	            this.layerOpacity = layerOpacity;
	        }
	    }, {
	        key: 'getLayerOpacity',
	        value: function getLayerOpacity() {
	            return this.layerOpacity;
	        }
	    }, {
	        key: 'getLayerOpacityCSSString',
	        value: function getLayerOpacityCSSString() {
	            return "opacity : " + this.layerOpacity;
	        }
	    }, {
	        key: 'drawLayer',
	        value: function drawLayer(zoomLevel, canvas) {
	            if (!this.isActivated()) return;

	            this.drawLayerInPageCoords(zoomLevel, canvas, this.pageIndex);
	        }
	    }, {
	        key: 'drawLayerInPageCoords',
	        value: function drawLayerInPageCoords(zoomLevel, canvas, pageIndex) {
	            var _this4 = this;

	            var ctx = canvas.getContext('2d');
	            // Clear canvas
	            ctx.clearRect(0, 0, canvas.width, canvas.height);

	            // Redraw PreBinarized Image on layer canvas
	            if (this.backgroundImageCanvas !== null) ctx.drawImage(this.backgroundImageCanvas, 0, 0);

	            // Redraw all actions
	            this.actions.forEach(function (action) {
	                action.object.drawOnPage(_this4, pageIndex, zoomLevel, _this4.pixelInstance.core.getSettings().renderer, canvas);
	            });
	        }
	    }, {
	        key: 'setBackgroundImageCanvas',
	        value: function setBackgroundImageCanvas(canvas) {
	            this.backgroundImageCanvas = canvas;
	        }
	    }, {
	        key: 'addToPastedRegions',
	        value: function addToPastedRegions(selection) {
	            this.pastedRegions.push(selection);
	            this.addAction(new _action.Action(selection, this));
	        }
	    }, {
	        key: 'addAction',
	        value: function addAction(action) {
	            this.actions.push(action);

	            // Selection is temporary and only concerns this layer thus no need to add to global actions
	            if (!(action.object.type === "selection" && action.object.selectedShape.blendMode === "select")) this.pixelInstance.actions.push(action);
	        }
	    }, {
	        key: 'removeAction',
	        value: function removeAction(action) {
	            var actionIndex = this.actions.indexOf(action);
	            this.actions.splice(actionIndex, 1);

	            var globalActionIndex = this.pixelInstance.actions.indexOf(action);
	            this.pixelInstance.actions.splice(globalActionIndex, 1);
	        }
	    }, {
	        key: 'displayColourOptions',
	        value: function displayColourOptions() {
	            // TODO: Implement function
	            console.log("colour clicked here");
	        }

	        /**
	         * Displays the layer options (such as opacity) as a drop down from the layer selectors
	         */

	    }, {
	        key: 'displayLayerOptions',
	        value: function displayLayerOptions() {
	            var layerOptionsDiv = document.getElementById("layer-" + this.layerId + "-options");

	            if (layerOptionsDiv.classList.contains("unchecked-layer-settings")) //It is unchecked, check it
	                {
	                    layerOptionsDiv.classList.remove("unchecked-layer-settings");
	                    layerOptionsDiv.classList.add("checked-layer-settings");
	                    this.pixelInstance.uiManager.createOpacitySlider(this, layerOptionsDiv.parentElement.parentElement, layerOptionsDiv.parentElement);
	                } else {
	                layerOptionsDiv.classList.remove("checked-layer-settings");
	                layerOptionsDiv.classList.add("unchecked-layer-settings");
	                this.pixelInstance.uiManager.destroyOpacitySlider(this);
	            }
	        }

	        /**
	         * Visually displays a layer
	         */

	    }, {
	        key: 'activateLayer',
	        value: function activateLayer() {
	            var layerActivationDiv = document.getElementById("layer-" + this.layerId + "-activation");
	            layerActivationDiv.classList.remove("layer-deactivated");
	            layerActivationDiv.classList.add("layer-activated");
	            this.getCanvas().style.opacity = this.getLayerOpacity();

	            if (this.layerId === this.pixelInstance.background.layerId) // Background
	                {
	                    this.activated = true;
	                } else {
	                this.activated = true;
	                this.pixelInstance.redrawLayer(this);
	            }
	        }
	    }, {
	        key: 'deactivateLayer',
	        value: function deactivateLayer() {
	            var layerActivationDiv = document.getElementById("layer-" + this.layerId + "-activation");
	            layerActivationDiv.classList.remove("layer-activated");
	            layerActivationDiv.classList.add("layer-deactivated");
	            this.activated = false;

	            if (this.layerId === this.pixelInstance.background.layerId) // Background
	                {
	                    this.getCanvas().style.opacity = 0;
	                } else {
	                this.clearCtx();
	            }
	        }
	    }, {
	        key: 'toggleLayerActivation',
	        value: function toggleLayerActivation() {
	            var layerActivationDiv = document.getElementById("layer-" + this.layerId + "-activation");
	            if (layerActivationDiv.classList.contains("layer-deactivated")) {
	                this.activateLayer();
	            } else {
	                this.deactivateLayer();
	            }
	        }
	    }]);

	    return Layer;
	}();

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Path = exports.Path = function () {
	    function Path(brushSize, blendMode) {
	        _classCallCheck(this, Path);

	        this.points = [];
	        this.brushSize = brushSize;
	        this.type = "path";
	        this.blendMode = blendMode;
	        this.lastAbsX = 0;
	        this.lastAbsY = 0;
	    }

	    _createClass(Path, [{
	        key: "addPointToPath",
	        value: function addPointToPath(point) {
	            this.points.push(point);
	        }
	    }, {
	        key: "drawInViewport",
	        value: function drawInViewport(layer, pageIndex, zoomLevel, renderer, canvas) {
	            var _this = this;

	            var isDown = false;
	            this.points.forEach(function (point) {
	                _this.connectPoint(layer, point, pageIndex, zoomLevel, isDown, renderer, canvas, "viewport");
	                isDown = true;
	            });
	        }
	    }, {
	        key: "drawOnPage",
	        value: function drawOnPage(layer, pageIndex, zoomLevel, renderer, canvas) {
	            var _this2 = this;

	            var isDown = false;
	            this.points.forEach(function (point) {
	                _this2.connectPoint(layer, point, pageIndex, zoomLevel, isDown, renderer, canvas, "page");
	                isDown = true;
	            });
	        }

	        /**
	         * Calculates the coordinates of the point to be added depending on the specified coordinates system
	         * Places a point in the path
	         * Only connects a point to the previous on if isDown is true
	         * This is mainly used when the user is in the process of drawing the path
	         * @param layer
	         * @param point
	         * @param pageIndex
	         * @param zoomLevel
	         * @param isDown
	         * @param renderer
	         * @param canvas
	         * @param coordinatesSystem
	         */

	    }, {
	        key: "connectPoint",
	        value: function connectPoint(layer, point, pageIndex, zoomLevel, isDown, renderer, canvas, coordinatesSystem) {
	            var scaleRatio = Math.pow(2, zoomLevel),
	                ctx = canvas.getContext('2d');

	            if (pageIndex !== point.pageIndex) return;

	            // Calculates where the highlights should be drawn as a function of the whole webpage coordinates
	            // (to make it look like it is on top of a page in Diva)
	            var coordinates = void 0;
	            switch (coordinatesSystem) {
	                case "viewport":
	                    coordinates = point.getCoordsInViewport(zoomLevel, pageIndex, renderer);
	                    break;
	                case "page":
	                    coordinates = point.getCoordsInPage(zoomLevel);
	                    break;
	                default:
	                    coordinates = point.getCoordsInViewport(zoomLevel, pageIndex, renderer);
	            }

	            var highlightXOffset = coordinates.x,
	                highlightYOffset = coordinates.y;

	            if (isDown) {
	                if (this.blendMode === "add") {
	                    ctx.globalCompositeOperation = "source-over";
	                    ctx.beginPath();
	                    ctx.strokeStyle = layer.colour.toHTMLColour();
	                    ctx.lineWidth = this.brushSize * scaleRatio;
	                    ctx.lineJoin = "round";
	                    ctx.moveTo(this.lastAbsX, this.lastAbsY);
	                    ctx.lineTo(highlightXOffset, highlightYOffset);
	                    ctx.closePath();
	                    ctx.stroke();
	                } else if (this.blendMode === "subtract") {
	                    ctx.globalCompositeOperation = "destination-out";
	                    ctx.beginPath();
	                    ctx.strokeStyle = "rgba(250,250,250,1)"; // It is important to have the alpha always equal to 1. RGB are not important when erasing
	                    ctx.lineWidth = this.brushSize * scaleRatio;
	                    ctx.lineJoin = "round";
	                    ctx.moveTo(this.lastAbsX, this.lastAbsY);
	                    ctx.lineTo(highlightXOffset, highlightYOffset);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	                ctx.globalCompositeOperation = "source-over";
	            }
	            this.lastAbsX = highlightXOffset;
	            this.lastAbsY = highlightYOffset;
	        }
	    }]);

	    return Path;
	}();

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Action = exports.Action = function Action(object, layer) {
	    _classCallCheck(this, Action);

	    this.object = object;
	    this.layer = layer;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Export = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*jshint esversion: 6 */


	var _colour = __webpack_require__(6);

	var _point = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Export = exports.Export = function () {
	    function Export(pixelInstance, layers, pageIndex, zoomLevel, uiManager) {
	        _classCallCheck(this, Export);

	        this.pixelInstance = pixelInstance;
	        this.layers = layers;
	        this.exportLayersCount = layers.length;
	        this.interrupted = false;
	        this.dataCanvases = [];
	        this.pageIndex = pageIndex;
	        this.zoomLevel = zoomLevel;
	        this.matrix = null;
	        this.uiManager = uiManager;
	    }

	    /**
	     * Creates a PNG for each layer where the pixels spanned by the layers are replaced by the actual image data
	     * of the Diva page
	     */


	    _createClass(Export, [{
	        key: 'exportLayersAsImageData',
	        value: function exportLayersAsImageData() {
	            var _this = this;

	            this.dataCanvases = [];

	            var height = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).height,
	                width = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).width;

	            var progressCanvas = this.uiManager.createExportElements(this).progressCanvas;

	            // The idea here is to draw each layer on a canvas and scan the pixels of that canvas to fill the matrix
	            this.layers.forEach(function (layer) {
	                var layerCanvas = document.createElement('canvas');
	                layerCanvas.setAttribute("class", "export-page-canvas");
	                layerCanvas.setAttribute("id", "layer-" + layer.layerId + "-export-canvas");
	                layerCanvas.setAttribute("style", "position: absolute; top: 0; left: 0;");
	                layerCanvas.width = width;
	                layerCanvas.height = height;

	                layer.drawLayerInPageCoords(_this.zoomLevel, layerCanvas, _this.pageIndex);

	                var pngCanvas = document.createElement('canvas');
	                pngCanvas.setAttribute("class", "export-page-data-canvas");
	                pngCanvas.setAttribute("id", "layer-" + layer.layerId + "-export-canvas");
	                pngCanvas.setAttribute("value", layer.layerName);
	                pngCanvas.setAttribute("style", "position: absolute; top: 0; left: 0;");
	                pngCanvas.width = width;
	                pngCanvas.height = height;

	                _this.dataCanvases.push(pngCanvas);
	                _this.getImageData(_this.pixelInstance.core.getSettings().renderer._canvas, pngCanvas, _this.pageIndex, layerCanvas, progressCanvas);
	            });
	        }

	        /**
	         * Creates a PNG for each layer where the pixels spanned by the layers are replaced by the actual image data
	         * of the Diva page
	         */

	    }, {
	        key: 'exportLayersAsCSV',
	        value: function exportLayersAsCSV() {
	            var _this2 = this;

	            var core = this.pixelInstance.core,
	                height = core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).height,
	                width = core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).width;

	            var progressCanvas = this.uiManager.createExportElements(this).progressCanvas;
	            this.initializeMatrix();
	            this.exportLayersCount = this.layers.length;

	            // The idea here is to draw each layer on a canvas and scan the pixels of that canvas to fill the matrix
	            this.layers.forEach(function (layer) {
	                var layerCanvas = document.createElement('canvas');
	                layerCanvas.setAttribute("class", "export-page-canvas");
	                layerCanvas.setAttribute("id", "layer-" + layer.layerId + "-export-canvas");
	                layerCanvas.width = width;
	                layerCanvas.height = height;

	                layer.drawLayerInPageCoords(_this2.zoomLevel, layerCanvas, _this2.pageIndex);
	                _this2.fillMatrix(layer, _this2.matrix, layerCanvas, progressCanvas);
	            });
	        }

	        /**
	         * Creates a PNG for each layer where the pixels spanned by the layers are replaced by the layer colour
	         */

	    }, {
	        key: 'exportLayersAsPNG',
	        value: function exportLayersAsPNG() {
	            var linksDiv = document.getElementById("png-links-div");

	            if (linksDiv !== null) {
	                linksDiv.parentElement.removeChild(linksDiv);
	            }

	            linksDiv = document.createElement("div");
	            linksDiv.setAttribute("id", "png-links-div");

	            // The idea here is to draw each layer on a canvas and scan the pixels of that canvas to fill the matrix
	            this.layers.forEach(function (layer) {
	                layer.getCanvas().toBlob(function (blob) {
	                    var text = document.createTextNode("Download " + layer.layerName + " PNG "),
	                        link = document.getElementById(layer.layerName + "-png-download");

	                    if (link === null) {
	                        var newImg = document.createElement('img'),
	                            _url = URL.createObjectURL(blob);

	                        newImg.src = _url;

	                        link = document.createElement("a");
	                        link.appendChild(text);
	                        linksDiv.appendChild(link);
	                    }

	                    // Browsers that support HTML5 download attribute
	                    var url = URL.createObjectURL(blob);
	                    link.setAttribute("class", "export-download");
	                    link.setAttribute("id", layer.layerName + "-png-download");
	                    link.setAttribute("href", url);
	                    link.setAttribute("download", layer.layerName);
	                });
	            });

	            document.body.appendChild(linksDiv);
	        }

	        /**
	         * Scans the layer canvas and replaces its pixels with the actual image data from a divaCanvas
	         * @param divaCanvas
	         * @param drawingCanvas
	         * @param pageIndex
	         * @param canvasToScan
	         * @param progressCanvas: Outputs a preview of the export image
	         */

	    }, {
	        key: 'getImageData',
	        value: function getImageData(divaCanvas, drawingCanvas, pageIndex, canvasToScan, progressCanvas) {
	            var _this3 = this;

	            var chunkSize = canvasToScan.width,
	                chunkNum = 0,
	                row = 0,
	                col = 0,
	                pixelCtx = canvasToScan.getContext('2d'),
	                renderer = this.pixelInstance.core.getSettings().renderer;

	            // Necessary for doing computation without blocking the UI
	            var doChunk = function doChunk() {
	                var cnt = chunkSize;
	                chunkNum++;

	                // This simulates a nested for loop that is limited by a certain number of iterations (cnt)
	                while (cnt--) {
	                    if (row >= canvasToScan.height) break;

	                    if (col < canvasToScan.width) {
	                        var data = pixelCtx.getImageData(col, row, 1, 1).data,
	                            colour = new _colour.Colour(data[0], data[1], data[2], data[3]);

	                        if (colour.alpha !== 0) _this3.drawImageDataOnCanvas(row, col, pageIndex, renderer, divaCanvas, drawingCanvas, progressCanvas);

	                        col++;
	                    } else // New row
	                        {
	                            row++;
	                            col = 0;
	                        }
	                }

	                if (_this3.postProcessImageDataIteration(row, drawingCanvas, chunkNum, chunkSize, canvasToScan).needsRecall) setTimeout(doChunk, 1);
	            };

	            // First call to the doChunck function
	            doChunk();
	        }

	        /**
	         * Gets the image data of a specific pixel by its location on Diva's image (row, col)
	         * The challenge with this is that we don't have access to the full diva image, only the visible tiles
	         * The suggested temporary solution is to force loading a non visible tile by going to its location
	         * @param row
	         * @param col
	         * @param pageIndex
	         * @param renderer
	         * @param imageCanvas
	         * @param drawingCanvas
	         * @param progressCanvas
	         */

	    }, {
	        key: 'drawImageDataOnCanvas',
	        value: function drawImageDataOnCanvas(row, col, pageIndex, renderer, imageCanvas, drawingCanvas, progressCanvas) {
	            var drawingCtx = drawingCanvas.getContext('2d'),
	                originalImageCtx = imageCanvas.getContext('2d'),
	                progressCtx = progressCanvas.getContext('2d');

	            // Fill with diva colours
	            var paddedCoords = new _point.Point().getPaddedCoordinatesFromAbsolute(pageIndex, renderer, col, row);

	            // FIXME: Sometimes the Diva canvas is not fully rendered!! Have to force a full diva page to render
	            // If row and col are not visible then go there
	            if (paddedCoords.y < 0) renderer.goto(pageIndex, row, col);else if (paddedCoords.y > imageCanvas.height) renderer.goto(pageIndex, row + imageCanvas.height, col);else if (paddedCoords.x < 0) renderer.goto(pageIndex, row, col);else if (paddedCoords.x > imageCanvas.width) renderer.goto(pageIndex, row, col + imageCanvas.width);

	            // Get image data from diva page
	            var data = originalImageCtx.getImageData(paddedCoords.x, paddedCoords.y, 1, 1).data,
	                colour = new _colour.Colour(data[0], data[1], data[2], data[3]);

	            drawingCtx.fillStyle = colour.toHTMLColour();
	            drawingCtx.fillRect(col, row, 1, 1);

	            // Export animation
	            progressCtx.fillStyle = colour.toHTMLColour();
	            progressCtx.fillRect(col, row, 1, 1);
	        }

	        /**
	         * 1. Updates the progress bar
	         * 2. Creates image URLs to the images after they are successfully processed
	         * 3. Handles export interruption
	         * 4. Removes export page overlay
	         * @param row
	         * @param drawingCanvas
	         * @param chunkNum
	         * @param chunkSize
	         * @param canvasToScan
	         * @returns {{needsRecall: boolean}}
	         */

	    }, {
	        key: 'postProcessImageDataIteration',
	        value: function postProcessImageDataIteration(row, drawingCanvas, chunkNum, chunkSize, canvasToScan) {
	            // Finished exporting a layer
	            if (row === canvasToScan.height || this.exportInterrupted) this.exportLayersCount -= 1;

	            // still didn't finish processing. Update progress and call function again
	            if (row < canvasToScan.height && !this.exportInterrupted) {
	                var percentage = chunkNum * chunkSize * 100 / (canvasToScan.height * canvasToScan.width),
	                    roundedPercentage = percentage > 100 ? 100 : Math.round(percentage * 10) / 10;
	                this.pixelInstance.uiManager.updateProgress(roundedPercentage);

	                // Recall doChunk function
	                return {
	                    needsRecall: true
	                };
	            }

	            // Finished exporting a layer
	            else {
	                    // Last layer to be processed is cancelled
	                    if (this.exportInterrupted && this.exportLayersCount === 0) {
	                        this.exportInterrupted = false;
	                        this.uiManager.destroyExportElements();
	                    } else if (this.exportInterrupted) {
	                        // Do nothing and wait until last layer has finished processing to cancel
	                    } else {
	                        // TODO: Create download buttons that the user can click whenever they want
	                        drawingCanvas.toBlob(function (blob) {
	                            var text = document.createTextNode("Download " + drawingCanvas.getAttribute("value") + " image data ");
	                            var link = document.getElementById(drawingCanvas.getAttribute("value") + "-image-data-download");
	                            if (link === null) {
	                                var newImg = document.createElement('img'),
	                                    _url2 = URL.createObjectURL(blob);

	                                newImg.src = _url2;

	                                link = document.createElement("a");
	                                link.appendChild(text);
	                                document.body.appendChild(link);
	                            }

	                            // Browsers that support HTML5 download attribute
	                            var url = URL.createObjectURL(blob);
	                            link.setAttribute("class", "export-download");
	                            link.setAttribute("id", drawingCanvas.getAttribute("value") + "-image-data-download");
	                            link.setAttribute("href", url);
	                            link.setAttribute("download", drawingCanvas.getAttribute("value") + " image data");
	                        });

	                        // Finished exporting all layers
	                        if (this.exportLayersCount === 0) {
	                            this.uiManager.destroyExportElements();
	                        }
	                    }
	                }

	            return {
	                needsRecall: false
	            };
	        }

	        /**
	         * Scans the canvas and populates the matrix entries with the ID of the layer that spans the pixel corresponding
	         * to the matrix entry
	         * @param layer
	         * @param matrix
	         * @param canvasToScan
	         * @param progressCanvas
	         */

	    }, {
	        key: 'fillMatrix',
	        value: function fillMatrix(layer, matrix, canvasToScan, progressCanvas) {
	            var _this4 = this;

	            var chunkSize = canvasToScan.width,
	                chunkNum = 0,
	                index = 3,
	                // 0: red, 1: green, 2: blue, 3: alpha
	            progressCtx = progressCanvas.getContext('2d');

	            var imageData = canvasToScan.getContext('2d').getImageData(0, 0, canvasToScan.width, canvasToScan.height),
	                data = imageData.data;

	            // Necessary for doing computation without blocking the UI
	            var doChunk = function doChunk() {
	                var cnt = chunkSize;
	                chunkNum++;

	                while (cnt--) {
	                    if (index > data.length) break;

	                    if (data[index] !== 0) {
	                        var pixelNum = Math.floor(index / 4);

	                        var row = parseInt(pixelNum / canvasToScan.height),
	                            col = parseInt(pixelNum % canvasToScan.width);

	                        matrix[row][col] = layer.layerId;

	                        progressCtx.fillStyle = layer.colour.toHTMLColour();
	                        progressCtx.fillRect(col, row, 1, 1);
	                    }
	                    index += 4;
	                }

	                // Finished exporting a layer
	                if (index >= data.length || _this4.exportInterrupted) _this4.exportLayersCount -= 1;

	                // still didn't finish processing. Update progress and call function again
	                else {
	                        var percentage = index / data.length * 100,
	                            roundedPercentage = percentage > 100 ? 100 : Math.round(percentage * 10) / 10;
	                        _this4.pixelInstance.uiManager.updateProgress(roundedPercentage);

	                        // Recall doChunk function
	                        setTimeout(doChunk, 1);
	                    }

	                // End of Exporting
	                if (_this4.exportLayersCount === 0) {
	                    _this4.uiManager.destroyExportElements();
	                    if (_this4.exportInterrupted) {
	                        _this4.exportInterrupted = false;
	                    } else {
	                        // this.pixelInstance.printMatrix();
	                        _this4.transformMatrixToCSV();
	                    }
	                }
	            };
	            // First call to the doChunck function
	            doChunk();
	        }

	        /**
	         * Creates a matrix the size of the image
	         */

	    }, {
	        key: 'initializeMatrix',
	        value: function initializeMatrix() {
	            var core = this.pixelInstance.core;

	            var height = core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).height,
	                width = core.publicInstance.getPageDimensionsAtZoomLevel(this.pageIndex, this.zoomLevel).width;

	            this.matrix = new Array(height).fill(null).map(function () {
	                return new Array(width).fill(0);
	            });
	        }
	    }, {
	        key: 'transformMatrixToCSV',
	        value: function transformMatrixToCSV() {
	            var csvContent = "",
	                filename = "pixel-export";

	            for (var row = 0; row < this.matrix.length; row++) {
	                var data = this.matrix[row].join(",");

	                csvContent += data;
	                csvContent += "\n";
	            }

	            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	            if (navigator.msSaveBlob) {
	                // IE 10+
	                navigator.msSaveBlob(blob, filename);
	            } else {
	                var text = document.createTextNode("Download CSV "),
	                    link = document.getElementById("csv-download");

	                if (link === null) {
	                    link = document.createElement("a");
	                    link.appendChild(text);
	                    document.body.appendChild(link);
	                }
	                // Browsers that support HTML5 download attribute
	                var url = URL.createObjectURL(blob);
	                link.setAttribute("class", "export-download");
	                link.setAttribute("id", "csv-download");
	                link.setAttribute("href", url);
	                link.setAttribute("download", filename);
	            }
	        }
	    }, {
	        key: 'printMatrixOnCanvas',
	        value: function printMatrixOnCanvas(canvas) {
	            var _this5 = this;

	            // Need to implement a buffering page
	            // let renderer = this.core.getSettings().renderer;
	            var rowlen = this.matrix[0].length,
	                ctx = canvas.getContext('2d');

	            var handleHit = function handleHit(row, col) {
	                _this5.layers.forEach(function (layer) {
	                    if (layer.layerId === _this5.matrix[row][col]) {
	                        ctx.fillStyle = layer.colour.toHTMLColour();
	                        ctx.fillRect(col, row, 1, 1);
	                    }
	                });
	            };

	            for (var row = 0; row < this.matrix.length; row++) {
	                for (var col = 0; col < rowlen; col++) {
	                    if (this.matrix[row][col] !== 0) {
	                        handleHit(row, col);
	                    }
	                }
	            }
	        }
	    }]);

	    return Export;
	}();

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.UIManager = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*jshint esversion: 6 */


	var _point = __webpack_require__(5);

	var _exceptions = __webpack_require__(12);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var UIManager = exports.UIManager = function () {
	    function UIManager(pixelInstance) {
	        _classCallCheck(this, UIManager);

	        this.pixelInstance = pixelInstance;

	        this.mouse = {
	            x: 0,
	            y: 0,
	            startX: 0,
	            startY: 0
	        };
	    }

	    _createClass(UIManager, [{
	        key: 'createPluginElements',
	        value: function createPluginElements(layers) {
	            this.placeLayerCanvasesInDiva(layers);
	            this.createUndoButton();
	            this.createRedoButton();
	            // Enable buttons only if in standalone Pixel 
	            if (typeof numberInputLayers === 'undefined') {
	                this.createDeleteLayerButton();
	                this.createCreateLayerButton();
	            }
	            this.createLayersView(layers);
	            this.createToolsView(this.pixelInstance.tools.getAllTools());
	            this.createExportButtons();
	            this.createImportButtons();
	        }
	    }, {
	        key: 'destroyPluginElements',
	        value: function destroyPluginElements(layers, background) {
	            this.destroyLayerSelectors(layers);
	            this.destroyBrushSizeSelector();
	            this.destroyUndoButton();
	            this.destroyRedoButton();
	            // Enable buttons only if in standalone Pixel 
	            if (typeof numberInputLayers === 'undefined') {
	                this.destroyDeleteLayerButton();
	                this.destroyCreateLayerButton();
	            }
	            this.destroyExportButtons();
	            this.destroyImportButtons();
	            this.destroyPixelCanvases(layers);
	            this.destroyToolsView(this.pixelInstance.tools.getAllTools());
	            this.destroyLockedLayerSelectors(background);
	            this.destroyDownloadLinks();
	            this.destroyBrushCursor();
	            this.restoreDefaultCursor();
	        }

	        // Tools are strings or enums

	    }, {
	        key: 'createToolsView',
	        value: function createToolsView(tools) {
	            var _this = this;

	            var form = document.createElement("form");
	            form.setAttribute("id", "tool-selector");
	            form.setAttribute("class", "tool-selector");

	            var handleClick = function handleClick(radio) {
	                radio.addEventListener("click", function () {
	                    _this.pixelInstance.tools.setCurrentTool(radio.value);
	                });
	            };

	            // Create an element for each tool and
	            for (var index = 0; index < tools.length; index++) {
	                var tool = tools[index],
	                    radio = document.createElement("input"),

	                //content = document.createTextNode(tool),
	                content = document.createElement("label");

	                content.setAttribute("for", tool);
	                content.innerHTML = tool;

	                radio.setAttribute("id", tool);
	                radio.setAttribute("type", "radio");
	                radio.setAttribute("value", tool);
	                radio.setAttribute("name", "tool-selector");
	                radio.setAttribute("class", "radio-select");
	                handleClick(radio);

	                form.appendChild(radio);
	                form.appendChild(content);
	            }
	            document.body.appendChild(form);
	            // Set tool cursor after tools view creation
	            this.pixelInstance.tools.setCurrentTool(this.pixelInstance.tools.getCurrentTool());
	        }
	    }, {
	        key: 'destroyToolsView',
	        value: function destroyToolsView() {
	            var form = document.getElementById("tool-selector");
	            form.parentNode.removeChild(form);
	        }
	    }, {
	        key: 'placeLayerCanvasesInDiva',
	        value: function placeLayerCanvasesInDiva(layers) {
	            var divaCanvas = this.pixelInstance.core.getSettings().renderer._canvas;
	            for (var index = layers.length - 1; index >= 0; index--) {
	                var layer = layers[index];
	                layer.placeCanvasAfterElement(divaCanvas);

	                if (layer.isActivated()) layer.getCanvas().style.opacity = layer.getLayerOpacity();else layer.getCanvas().style.opacity = 0;
	            }

	            if (this.pixelInstance.background.isActivated()) this.pixelInstance.background.getCanvas().style.opacity = this.pixelInstance.background.getLayerOpacity();else this.pixelInstance.background.getCanvas().style.opacity = 0;
	        }
	    }, {
	        key: 'destroyPixelCanvases',
	        value: function destroyPixelCanvases(layers) {
	            layers.forEach(function (layer) {
	                if (layer.getCanvas().parentNode !== null) layer.getCanvas().parentNode.removeChild(layer.getCanvas());
	            });
	        }
	    }, {
	        key: 'createOpacitySlider',
	        value: function createOpacitySlider(layer, parentElement, referenceNode) {
	            var br = document.createElement("br"),
	                opacityDiv = document.createElement("div"),
	                opacityText = document.createElement("p"),
	                opacitySlider = document.createElement("input"),
	                text = document.createTextNode("Opacity");

	            br.setAttribute("id", "opacity-br-" + layer.layerId);

	            opacityDiv.setAttribute("class", "layer-tool");
	            opacityDiv.setAttribute("id", "layer-" + layer.layerId + "-opacity-tool");

	            opacityText.setAttribute("class", "layer-tool-text");
	            opacityText.setAttribute("id", "layer-" + layer.layerId + "-opacity-text");

	            opacitySlider.setAttribute("class", "layer-tool-slider");
	            opacitySlider.setAttribute("id", "layer-" + layer.layerId + "-opacity-slider");
	            opacitySlider.setAttribute("type", "range");
	            opacitySlider.setAttribute('max', 50);
	            opacitySlider.setAttribute('min', 0);

	            opacitySlider.setAttribute('value', layer.getLayerOpacity() * 50);
	            opacitySlider.setAttribute("draggable", "false");

	            opacitySlider.addEventListener("input", function () {
	                layer.setLayerOpacity(opacitySlider.value / 50);
	                if (layer.isActivated()) // Re-specify opacity only when the layer is activated
	                    layer.getCanvas().style.opacity = layer.getLayerOpacity();
	            });

	            opacityText.appendChild(text);
	            opacityDiv.appendChild(opacityText);
	            opacityDiv.appendChild(opacitySlider);
	            parentElement.insertBefore(opacityDiv, referenceNode.nextSibling);
	            parentElement.insertBefore(br, referenceNode.nextSibling);
	        }
	    }, {
	        key: 'destroyOpacitySlider',
	        value: function destroyOpacitySlider(layer) {
	            var opacitySlider = document.getElementById("layer-" + layer.layerId + "-opacity-tool"),
	                br = document.getElementById("opacity-br-" + layer.layerId);
	            opacitySlider.parentElement.removeChild(opacitySlider);
	            br.parentElement.removeChild(br);
	        }
	    }, {
	        key: 'createBackground',
	        value: function createBackground() {
	            var backgroundViewDiv = document.createElement("div");
	            backgroundViewDiv.setAttribute("id", "background-view");
	            backgroundViewDiv.setAttribute("class", "background-view");

	            // Should only have 1 element, but perhaps there will one day be more than 1 background
	            var layer = this.pixelInstance.background,
	                layerDiv = document.createElement("div"),
	                colourDiv = document.createElement("div"),
	                layerName = document.createElement("input"),
	                layerOptionsDiv = document.createElement("div"),
	                layerActivationDiv = document.createElement("div");

	            layerDiv.setAttribute("draggable", "false");
	            layerDiv.setAttribute("class", "layer-div");
	            layerDiv.setAttribute("value", layer.layerId);
	            layerDiv.setAttribute("id", "layer-" + layer.layerId + "-selector");

	            layerName.setAttribute("type", "text");
	            layerName.setAttribute("readonly", "true");
	            layerName.setAttribute("value", layer.layerName);

	            colourDiv.setAttribute("class", "color-box");
	            colourDiv.setAttribute("style", "background-color: " + layer.colour.toHexString() + ";");

	            layerOptionsDiv.setAttribute("class", "unchecked-layer-settings");
	            layerOptionsDiv.setAttribute("id", "layer-" + layer.layerId + "-options");

	            if (this.pixelInstance.background.isActivated()) {
	                layerActivationDiv.setAttribute("class", "layer-activated");
	                this.pixelInstance.background.getCanvas().style.opacity = 1;
	            } else {
	                layerActivationDiv.setAttribute("class", "layer-deactivated");
	                this.pixelInstance.background.getCanvas().style.opacity = 0;
	            }

	            layerActivationDiv.setAttribute("id", "layer-" + layer.layerId + "-activation");

	            colourDiv.addEventListener("click", function () {
	                layer.displayColourOptions();
	            });
	            layerActivationDiv.addEventListener("click", function () {
	                layer.toggleLayerActivation();
	            });
	            layerOptionsDiv.onclick = function () {
	                layer.displayLayerOptions();
	            };

	            layerDiv.appendChild(layerName);
	            layerDiv.appendChild(layerOptionsDiv);
	            layerDiv.appendChild(colourDiv);
	            layerDiv.appendChild(layerActivationDiv);
	            backgroundViewDiv.appendChild(layerDiv);

	            document.body.appendChild(backgroundViewDiv);
	        }
	    }, {
	        key: 'destroyLockedLayerSelectors',
	        value: function destroyLockedLayerSelectors() {
	            var backgroundViewDiv = document.getElementById("background-view");
	            backgroundViewDiv.parentNode.removeChild(backgroundViewDiv);
	        }
	    }, {
	        key: 'createLayersView',
	        value: function createLayersView(layers) {
	            var _this2 = this;

	            var departureIndex = void 0,
	                destinationIndex = void 0,
	                duringSwap = false;

	            var layersViewDiv = document.createElement("div");
	            layersViewDiv.setAttribute("id", "layers-view");
	            layersViewDiv.setAttribute("class", "layers-view");

	            var handleEvents = function handleEvents(layer, colourDiv, layerActivationDiv, layerName, layerOptionsDiv, layerDiv) {
	                colourDiv.addEventListener("click", function () {
	                    layer.displayColourOptions();
	                });
	                layerActivationDiv.addEventListener("click", function () {
	                    layer.toggleLayerActivation();
	                });
	                layerName.addEventListener('keypress', function (e) {
	                    _this2.pixelInstance.editLayerName(e, layerName, layerDiv, false, duringSwap, layer);
	                });
	                layerOptionsDiv.onclick = function () {
	                    layer.displayLayerOptions();
	                };

	                layerDiv.ondrag = function (evt) {
	                    _this2.pixelInstance.dragging(evt);
	                    duringSwap = true;
	                };
	                layerDiv.ondragstart = function (evt) {
	                    _this2.pixelInstance.dragStart(evt);
	                };
	                layerDiv.ondrop = function (evt) {
	                    _this2.pixelInstance.drop(evt, departureIndex, destinationIndex);
	                    duringSwap = false;
	                };
	                layerDiv.onmousedown = function () {
	                    departureIndex = layerDiv.getAttribute("index");
	                    _this2.highlightLayerSelectorById(layer.layerId);
	                };

	                layerDiv.ondragover = function (evt) {
	                    _this2.pixelInstance.allowDrop(evt);
	                    destinationIndex = layerDiv.getAttribute("index");
	                };
	            };

	            // Backwards because layers' display should be the same as the layers' order/visual "z-index" priority (depth)

	            var _loop = function _loop() {
	                var layer = layers[index],
	                    layerDiv = document.createElement("div"),
	                    linebreak = document.createElement("br"),
	                    colourDiv = document.createElement("div"),
	                    layerName = document.createElement("input"),
	                    layerOptionsDiv = document.createElement("div"),
	                    layerActivationDiv = document.createElement("div");

	                layerDiv.setAttribute("index", index);
	                layerDiv.setAttribute("draggable", "true");
	                layerDiv.setAttribute("class", "layer-div");
	                layerDiv.setAttribute("value", layer.layerId);
	                layerDiv.setAttribute("id", "layer-" + layer.layerId + "-selector");
	                layerDiv.setAttribute("title", "Hotkey: " + layer.layerId);
	                layerName.setAttribute("type", "text");
	                layerName.setAttribute("readonly", "true");
	                layerName.setAttribute("value", layer.layerName);
	                layerName.setAttribute("ondblclick", "this.readOnly='';");

	                //sets draggable attribute to false on double click
	                //only allows the onblur event after a double click
	                layerName.addEventListener('dblclick', function (e) {
	                    _this2.pixelInstance.editLayerName(e, layerName, layerDiv, false, duringSwap, layer);
	                    layerName.onblur = function (e) {
	                        _this2.pixelInstance.editLayerName(e, layerName, layerDiv, true, duringSwap, layer);
	                    };
	                });

	                colourDiv.setAttribute("class", "color-box");
	                colourDiv.setAttribute("style", "background-color: " + layer.colour.toHexString() + ";");

	                layerOptionsDiv.setAttribute("class", "unchecked-layer-settings");
	                layerOptionsDiv.setAttribute("id", "layer-" + layer.layerId + "-options");

	                if (layer.isActivated()) {
	                    layerActivationDiv.setAttribute("class", "layer-activated");
	                } else {
	                    layerActivationDiv.setAttribute("class", "layer-deactivated");
	                }

	                layerActivationDiv.setAttribute("id", "layer-" + layer.layerId + "-activation");

	                if (layer.layerId === _this2.pixelInstance.layers[_this2.pixelInstance.selectedLayerIndex].layerId) {
	                    layerDiv.classList.add("selected-layer");
	                }

	                handleEvents(layer, colourDiv, layerActivationDiv, layerName, layerOptionsDiv, layerDiv);

	                layerDiv.appendChild(layerName);
	                layerDiv.appendChild(layerOptionsDiv);
	                layerDiv.appendChild(colourDiv);
	                layerDiv.appendChild(layerActivationDiv);
	                layersViewDiv.appendChild(layerDiv);
	                layersViewDiv.appendChild(linebreak);
	            };

	            for (var index = layers.length - 1; index >= 0; index--) {
	                _loop();
	            }
	            document.body.appendChild(layersViewDiv);

	            this.createBackground(layers);
	        }
	    }, {
	        key: 'destroyLayerSelectors',
	        value: function destroyLayerSelectors() {
	            var layersViewDiv = document.getElementById("layers-view");
	            layersViewDiv.parentNode.removeChild(layersViewDiv);
	        }
	    }, {
	        key: 'highlightLayerSelectorById',
	        value: function highlightLayerSelectorById(layerToHighlightId) {
	            var _this3 = this;

	            var matchFound = false;

	            this.pixelInstance.layers.forEach(function (layer) {
	                if (layer.layerId === layerToHighlightId) {
	                    matchFound = true;
	                }
	            });

	            if (!matchFound) {
	                throw new _exceptions.CannotSelectLayerException("The layer you are trying to select does not exist.");
	            }

	            this.pixelInstance.layers.forEach(function (layer) {
	                // Highlight only the selected layer and remove highlights from all other layers
	                if (layer.layerId === layerToHighlightId) {
	                    var div = document.getElementById("layer-" + layer.layerId + "-selector");

	                    if (!div.hasAttribute("selected-layer")) div.classList.add("selected-layer");
	                    _this3.pixelInstance.changeCurrentlySelectedLayerIndex(_this3.pixelInstance.layers.indexOf(layer));
	                } else {
	                    var _div = document.getElementById("layer-" + layer.layerId + "-selector");
	                    if (_div.classList.contains("selected-layer")) _div.classList.remove("selected-layer");
	                }
	            });
	        }
	    }, {
	        key: 'createBrushSizeSelector',
	        value: function createBrushSizeSelector() {
	            var _this4 = this;

	            var brushSizeDiv = document.createElement("div");
	            brushSizeDiv.setAttribute("class", "tool-settings");
	            brushSizeDiv.setAttribute("id", "brush-size");

	            var text = document.createTextNode("Brush size:"),
	                brushSizeSelector = document.createElement("input");

	            brushSizeSelector.setAttribute("id", "brush-size-selector");
	            brushSizeSelector.setAttribute("type", "range");
	            brushSizeSelector.setAttribute('max', 40);
	            brushSizeSelector.setAttribute('min', 1);
	            brushSizeSelector.setAttribute('value', 25);

	            brushSizeSelector.addEventListener("input", function () {
	                _this4.createBrushCursor();
	            });

	            brushSizeDiv.appendChild(text);
	            brushSizeDiv.appendChild(brushSizeSelector);
	            document.body.appendChild(brushSizeDiv);
	        }
	    }, {
	        key: 'destroyBrushSizeSelector',
	        value: function destroyBrushSizeSelector() {
	            var brushSizeDiv = document.getElementById("brush-size");
	            if (brushSizeDiv !== null) brushSizeDiv.parentNode.removeChild(brushSizeDiv);
	        }
	    }, {
	        key: 'createUndoButton',
	        value: function createUndoButton() {
	            var _this5 = this;

	            var undoButton = document.createElement("button"),
	                text = document.createTextNode("Undo");

	            this.undo = function () {
	                _this5.pixelInstance.undoAction();
	            };

	            undoButton.setAttribute("id", "undo-button");
	            undoButton.appendChild(text);
	            undoButton.addEventListener("click", this.undo);

	            document.body.appendChild(undoButton);
	        }
	    }, {
	        key: 'destroyUndoButton',
	        value: function destroyUndoButton() {
	            var undoButton = document.getElementById("undo-button");
	            undoButton.parentNode.removeChild(undoButton);
	        }
	    }, {
	        key: 'createRedoButton',
	        value: function createRedoButton() {
	            var _this6 = this;

	            var redoButton = document.createElement("button"),
	                text = document.createTextNode("Redo");

	            this.redo = function () {
	                _this6.pixelInstance.redoAction();
	            };

	            redoButton.setAttribute("id", "redo-button");
	            redoButton.appendChild(text);
	            redoButton.addEventListener("click", this.redo);

	            document.body.appendChild(redoButton);
	        }
	    }, {
	        key: 'destroyRedoButton',
	        value: function destroyRedoButton() {
	            var redoButton = document.getElementById("redo-button");
	            redoButton.parentNode.removeChild(redoButton);
	        }
	    }, {
	        key: 'createDeleteLayerButton',
	        value: function createDeleteLayerButton() {
	            var _this7 = this;

	            var deleteLayerButton = document.createElement("button"),
	                text = document.createTextNode("Delete selected layer");

	            this.deleteLayer = function () {
	                try {
	                    _this7.pixelInstance.deleteLayer();
	                } catch (e) {
	                    if (e instanceof _exceptions.CannotDeleteLayerException) {
	                        alert(e.message);
	                    }
	                }
	            };

	            deleteLayerButton.setAttribute("id", "delete-layer-button");
	            deleteLayerButton.appendChild(text);
	            deleteLayerButton.addEventListener("click", this.deleteLayer);

	            document.body.appendChild(deleteLayerButton);
	        }
	    }, {
	        key: 'destroyDeleteLayerButton',
	        value: function destroyDeleteLayerButton() {
	            var deleteLayerButton = document.getElementById("delete-layer-button");
	            deleteLayerButton.parentNode.removeChild(deleteLayerButton);
	        }
	    }, {
	        key: 'createCreateLayerButton',
	        value: function createCreateLayerButton() {
	            var _this8 = this;

	            var createLayerButton = document.createElement("button"),
	                text = document.createTextNode("Create new layer");

	            this.createLayer = function () {
	                _this8.pixelInstance.createLayer();
	            };

	            createLayerButton.setAttribute("id", "create-layer-button");
	            createLayerButton.appendChild(text);
	            createLayerButton.addEventListener("click", this.createLayer);

	            document.body.appendChild(createLayerButton);
	        }
	    }, {
	        key: 'destroyCreateLayerButton',
	        value: function destroyCreateLayerButton() {
	            var createLayerButton = document.getElementById("create-layer-button");
	            createLayerButton.parentNode.removeChild(createLayerButton);
	        }
	    }, {
	        key: 'createExportButtons',
	        value: function createExportButtons() {
	            var _this9 = this;

	            var csvExportButton = document.createElement("button"),
	                csvExportText = document.createTextNode("Export as CSV"),
	                pngExportButton = document.createElement("button"),
	                pngExportText = document.createTextNode("Export as PNG"),
	                pngDataExportButton = document.createElement("button"),
	                pngDataExportText = document.createTextNode("Export as image Data PNG");

	            this.exportCSV = function () {
	                _this9.pixelInstance.exportAsCSV();
	            };
	            this.exportPNG = function () {
	                _this9.pixelInstance.exportAsPNG();
	            };
	            this.exportPNGData = function () {
	                _this9.pixelInstance.exportAsImageData();
	            };

	            csvExportButton.setAttribute("id", "csv-export-button");
	            csvExportButton.appendChild(csvExportText);
	            csvExportButton.addEventListener("click", this.exportCSV);

	            pngExportButton.setAttribute("id", "png-export-button");
	            pngExportButton.appendChild(pngExportText);
	            pngExportButton.addEventListener("click", this.exportPNG);

	            pngDataExportButton.setAttribute("id", "png-export-data-button");
	            pngDataExportButton.appendChild(pngDataExportText);
	            pngDataExportButton.addEventListener("click", this.exportPNGData);

	            document.body.appendChild(csvExportButton);
	            document.body.appendChild(pngExportButton);
	            document.body.appendChild(pngDataExportButton);
	        }
	    }, {
	        key: 'destroyExportButtons',
	        value: function destroyExportButtons() {
	            var csvexportButton = document.getElementById("csv-export-button"),
	                pngexportButton = document.getElementById("png-export-button"),
	                pngexportDataButton = document.getElementById("png-export-data-button");

	            csvexportButton.parentNode.removeChild(csvexportButton);
	            pngexportButton.parentNode.removeChild(pngexportButton);
	            pngexportDataButton.parentNode.removeChild(pngexportDataButton);
	        }
	    }, {
	        key: 'createImportButtons',
	        value: function createImportButtons() {
	            var _this10 = this;

	            var imageLoader = document.createElement("input");
	            imageLoader.setAttribute("type", "file");
	            imageLoader.setAttribute("id", "imageLoader");
	            imageLoader.setAttribute("name", "imageLoader");

	            this.import = function (e) {
	                _this10.pixelInstance.importPNGToLayer(e);
	            };

	            imageLoader.addEventListener('change', this.import, false);

	            document.body.appendChild(imageLoader);
	        }
	    }, {
	        key: 'destroyImportButtons',
	        value: function destroyImportButtons() {
	            var imageLoader = document.getElementById("imageLoader");
	            imageLoader.parentNode.removeChild(imageLoader);
	        }
	    }, {
	        key: 'updateProgress',
	        value: function updateProgress(percentage) {
	            var percentageStr = percentage + "%",
	                widthStr = "width: " + percentageStr;

	            document.getElementById("pbar-inner-div").setAttribute("style", widthStr);
	            document.getElementById("pbar-inner-text").innerHTML = percentageStr;
	        }
	    }, {
	        key: 'destroyBackground',
	        value: function destroyBackground(layers) {
	            this.pixelInstance.destroyLockedLayerSelectors(layers);
	        }
	    }, {
	        key: 'createExportElements',
	        value: function createExportElements(exportInstance) {
	            var exportDiv = document.createElement('div'),
	                text = document.createTextNode("Exporting"),
	                progressText = document.createTextNode("0%"),
	                progressBarOuterDiv = document.createElement('div'),
	                progressBarInnerDiv = document.createElement('div'),
	                progressBarInnerText = document.createElement('div'),
	                progressBarExportText = document.createElement('div'),
	                cancelExportDiv = document.createElement('div'),
	                cancelExportText = document.createTextNode("Cancel");

	            exportDiv.setAttribute("class", "export-div");
	            exportDiv.setAttribute("id", "pixel-export-div");

	            progressBarOuterDiv.setAttribute("class", "pbar-outer-div");
	            progressBarOuterDiv.setAttribute("id", "pbar-outer-div");

	            progressBarInnerDiv.setAttribute("class", "pbar-inner-div");
	            progressBarInnerDiv.setAttribute("id", "pbar-inner-div");

	            progressBarInnerText.setAttribute("class", "pbar-inner-text");
	            progressBarInnerText.setAttribute("id", "pbar-inner-text");

	            progressBarExportText.setAttribute("class", "pbar-export-text");
	            progressBarExportText.setAttribute("id", "pbar-export-text");

	            cancelExportDiv.setAttribute("class", "cancel-export-div");
	            cancelExportDiv.setAttribute("id", "cancel-export-div");
	            cancelExportDiv.addEventListener("click", function () {
	                cancelExportDiv.setAttribute("style", "background-color: #AAAAAA;");
	                exportInstance.exportInterrupted = true;
	            });

	            progressBarExportText.appendChild(text);
	            cancelExportDiv.appendChild(cancelExportText);
	            progressBarInnerText.appendChild(progressText);
	            progressBarOuterDiv.appendChild(progressBarInnerDiv);
	            progressBarOuterDiv.appendChild(progressBarInnerText);
	            progressBarOuterDiv.appendChild(progressBarExportText);
	            progressBarOuterDiv.appendChild(cancelExportDiv);
	            exportDiv.appendChild(progressBarOuterDiv);

	            document.body.appendChild(exportDiv);

	            return {
	                progressCanvas: this.createProgressCanvas(exportInstance.pageIndex, exportInstance.zoomLevel)
	            };
	        }
	    }, {
	        key: 'destroyExportElements',
	        value: function destroyExportElements() {
	            var exportDiv = document.getElementById("pixel-export-div");
	            exportDiv.parentNode.removeChild(exportDiv);
	        }
	    }, {
	        key: 'destroyDownloadLinks',
	        value: function destroyDownloadLinks() {
	            var downloadElements = document.getElementsByClassName("export-download");

	            while (downloadElements[0]) {
	                downloadElements[0].parentNode.removeChild(downloadElements[0]);
	            }
	        }
	    }, {
	        key: 'createProgressCanvas',
	        value: function createProgressCanvas(pageIndex, zoomLevel) {
	            var height = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(pageIndex, zoomLevel).height,
	                width = this.pixelInstance.core.publicInstance.getPageDimensionsAtZoomLevel(pageIndex, zoomLevel).width;

	            var progressCanvas = document.createElement('canvas');
	            progressCanvas.setAttribute("id", "progress-canvas");
	            progressCanvas.style.opacity = 0.3;
	            progressCanvas.width = width;
	            progressCanvas.height = height;
	            progressCanvas.globalAlpha = 1;

	            var w = window,
	                d = document,
	                e = d.documentElement,
	                g = d.getElementsByTagName('body')[0],
	                y = w.innerHeight || e.clientHeight || g.clientHeight;

	            progressCanvas.style.height = y + "px";

	            var exportDiv = document.getElementById("pixel-export-div");
	            exportDiv.appendChild(progressCanvas);

	            return progressCanvas;
	        }
	    }, {
	        key: 'markToolSelected',
	        value: function markToolSelected(tool) {
	            document.getElementById(tool).checked = true;
	        }
	    }, {
	        key: 'getBrushSizeSelectorValue',
	        value: function getBrushSizeSelectorValue() {
	            // Brush size relative to scaleRatio to allow for more precise manipulations on higher zoom levels
	            var brushSizeSlider = document.getElementById("brush-size-selector"),
	                brushSizeValue = brushSizeSlider.value / brushSizeSlider.max * 10;

	            return 0.05 + Math.exp(brushSizeValue - 6); // 0.05 + e ^ (x - 6) was the most intuitive function we found in terms of brush size range
	        }
	    }, {
	        key: 'createBrushCursor',
	        value: function createBrushCursor() {
	            var cursorDiv = document.getElementById("brush-cursor-div"),
	                divaViewport = document.getElementById("diva-1-viewport"),
	                divaOuter = document.getElementById("diva-1-outer");

	            if (cursorDiv === null) {
	                cursorDiv = document.createElement('div');
	                cursorDiv.setAttribute("id", "brush-cursor-div");
	                divaOuter.insertBefore(cursorDiv, divaViewport);
	            }

	            cursorDiv.setAttribute("oncontextmenu", "return false");
	            this.resizeBrushCursor();
	        }
	    }, {
	        key: 'resizeBrushCursor',
	        value: function resizeBrushCursor() {
	            var cursorDiv = document.getElementById("brush-cursor-div");

	            if (cursorDiv === null) return;

	            var scaleRatio = Math.pow(2, this.pixelInstance.core.getSettings().zoomLevel),
	                brushSizeSelectorValue = this.getBrushSizeSelectorValue() * scaleRatio;

	            cursorDiv.style.width = brushSizeSelectorValue + "px";
	            cursorDiv.style.height = brushSizeSelectorValue + "px";
	        }
	    }, {
	        key: 'destroyBrushCursor',
	        value: function destroyBrushCursor() {
	            var cursorDiv = document.getElementById("brush-cursor-div");

	            if (cursorDiv !== null) {
	                cursorDiv.parentNode.removeChild(cursorDiv);
	            }
	        }
	    }, {
	        key: 'moveBrushCursor',
	        value: function moveBrushCursor(mousePos) {
	            var cursorDiv = document.getElementById("brush-cursor-div"),
	                scaleRatio = Math.pow(2, this.pixelInstance.core.getSettings().zoomLevel),
	                brushSize = this.getBrushSizeSelectorValue() * scaleRatio;

	            cursorDiv.style.left = mousePos.x - brushSize / 2 - 1 + "px"; // the -1 is to account for the border width
	            cursorDiv.style.top = mousePos.y - brushSize / 2 - 1 + "px"; // the -1 is to account for the border width
	        }
	    }, {
	        key: 'restoreDefaultCursor',
	        value: function restoreDefaultCursor() {
	            var mouseClickDiv = document.getElementById("diva-1-outer");
	            mouseClickDiv.style.cursor = "default";
	        }
	    }, {
	        key: 'setMousePosition',
	        value: function setMousePosition(mousePos) {
	            // Rectangle border width
	            var borderWidth = 1;

	            this.mouse.x = mousePos.x - borderWidth;
	            this.mouse.y = mousePos.y - borderWidth;
	        }
	    }, {
	        key: 'createRectanglePreview',
	        value: function createRectanglePreview(mousePos, layer) {
	            this.setMousePosition(mousePos);

	            var divaViewport = document.getElementById("diva-1-viewport");
	            var divaOuter = document.getElementById("diva-1-outer");

	            this.mouse.startX = this.mouse.x;
	            this.mouse.startY = this.mouse.y;
	            var element = document.createElement('div');
	            element.className = 'rectangle';
	            element.id = 'preview-rectangle';
	            element.style.left = this.mouse.x + 'px';
	            element.style.top = this.mouse.y + 'px';
	            element.style.border = "1px solid " + layer.colour.toHexString();

	            divaOuter.insertBefore(element, divaViewport);
	        }
	    }, {
	        key: 'resizeRectanglePreview',
	        value: function resizeRectanglePreview(mousePos, layer) {
	            this.setMousePosition(mousePos);
	            var element = document.getElementById("preview-rectangle");

	            if (element !== null) {
	                element.style.border = "1px solid " + layer.colour.toHexString();
	                element.style.width = Math.abs(this.mouse.x - this.mouse.startX) + 'px';
	                element.style.height = Math.abs(this.mouse.y - this.mouse.startY) + 'px';
	                element.style.left = this.mouse.x - this.mouse.startX < 0 ? this.mouse.x + 'px' : this.mouse.startX + 'px';
	                element.style.top = this.mouse.y - this.mouse.startY < 0 ? this.mouse.y + 'px' : this.mouse.startY + 'px';
	            }
	        }
	    }, {
	        key: 'removeRectanglePreview',
	        value: function removeRectanglePreview() {
	            var element = document.getElementById("preview-rectangle");
	            if (element !== null) element.parentNode.removeChild(element);
	        }
	    }, {
	        key: 'isInPageBounds',
	        value: function isInPageBounds(relativeX, relativeY) {
	            var pageIndex = this.pixelInstance.core.getSettings().currentPageIndex,
	                zoomLevel = this.pixelInstance.core.getSettings().zoomLevel,
	                renderer = this.pixelInstance.core.getSettings().renderer;

	            var pageDimensions = this.pixelInstance.core.publicInstance.getCurrentPageDimensionsAtCurrentZoomLevel(),
	                absolutePageOrigin = new _point.Point().getCoordsInViewport(zoomLevel, pageIndex, renderer),
	                absolutePageWidthOffset = pageDimensions.width + absolutePageOrigin.x,
	                //Taking into account the padding, etc...
	            absolutePageHeightOffset = pageDimensions.height + absolutePageOrigin.y,
	                relativeBounds = new _point.Point().getRelativeCoordinatesFromPadded(pageIndex, renderer, absolutePageWidthOffset, absolutePageHeightOffset, zoomLevel);

	            if (relativeX < 0 || relativeY < 0 || relativeX > relativeBounds.x || relativeY > relativeBounds.y) return false;

	            return true;
	        }

	        /**
	         * ===============================================
	         *                     Tutorial
	         * ===============================================
	         **/

	    }, {
	        key: 'tutorial',
	        value: function tutorial() {
	            var overlay = document.createElement('div');
	            overlay.setAttribute("id", "tutorial-div");

	            var background = document.createElement('div');
	            background.setAttribute("id", "tutorial-overlay");

	            var modal = document.createElement('div');
	            modal.setAttribute("id", "myModal");
	            modal.setAttribute("class", "modal");

	            var modalContent = document.createElement('div');
	            modalContent.setAttribute("class", "modal-content");

	            var modalHeader = document.createElement('div');
	            modalHeader.setAttribute("class", "modal-header");

	            var text = document.createTextNode("Hello, World");
	            var h2 = document.createElement('h2');
	            h2.appendChild(text);

	            var closeModal = document.createElement('span');
	            closeModal.setAttribute("class", "close");
	            closeModal.innerHTML = "&times;";

	            var modalBody = document.createElement('div');
	            modalBody.setAttribute("class", "modal-body");

	            var tutorialP = document.createElement('p');
	            tutorialP.innerHTML = "The following is a glossary of the hotkeys you will find useful when using Pixel.js";

	            var hotkeyGlossary = document.createElement('ul');
	            hotkeyGlossary.setAttribute("style", "list-style-type:none;");

	            var LayerSelect = document.createElement('li');
	            LayerSelect.innerHTML = "<kbd>1</kbd> ... <kbd>9</kbd> layer select";

	            var brushTool = document.createElement('li');
	            brushTool.innerHTML = "<kbd>b</kbd> brush tool";

	            var rectangleTool = document.createElement('li');
	            rectangleTool.innerHTML = "<kbd>r</kbd> rectangle tool";

	            var grabTool = document.createElement('li');
	            grabTool.innerHTML = "<kbd>g</kbd> grab tool";

	            var eraserTool = document.createElement('li');
	            eraserTool.innerHTML = "<kbd>e</kbd> eraser tool";

	            var shift = document.createElement('li');
	            shift.innerHTML = "<kbd>Shift</kbd>  force tools to paint in an exact way.";

	            var undo = document.createElement('li');
	            undo.innerHTML = "<kbd>cmd</kbd> + <kbd>z</kbd> undo";

	            var redo = document.createElement('li');
	            redo.innerHTML = "<kbd>cmd</kbd> + <kbd>Shift</kbd> + <kbd>z</kbd> redo";

	            var modalFooter = document.createElement('div');
	            modalFooter.setAttribute("class", "modal-footer");

	            var close = document.createElement('h2');
	            close.innerHTML = "Got It!";

	            hotkeyGlossary.appendChild(LayerSelect);
	            hotkeyGlossary.appendChild(brushTool);
	            hotkeyGlossary.appendChild(rectangleTool);
	            hotkeyGlossary.appendChild(grabTool);
	            hotkeyGlossary.appendChild(eraserTool);
	            hotkeyGlossary.appendChild(shift);
	            hotkeyGlossary.appendChild(undo);
	            hotkeyGlossary.appendChild(redo);

	            modal.appendChild(modalContent);
	            modalContent.appendChild(modalHeader);
	            modalContent.appendChild(modalBody);
	            modalContent.appendChild(modalFooter);
	            modalHeader.appendChild(h2);
	            modalHeader.appendChild(closeModal);
	            modalBody.appendChild(tutorialP);
	            modalBody.appendChild(hotkeyGlossary);
	            modalFooter.appendChild(close);

	            overlay.appendChild(background);
	            overlay.appendChild(modal);
	            document.body.appendChild(overlay);

	            modal.style.display = "block";

	            modalFooter.addEventListener("click", function () {
	                overlay.parentNode.removeChild(overlay);
	            });
	        }
	    }]);

	    return UIManager;
	}();

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var PixelException = function PixelException(message) {
	    _classCallCheck(this, PixelException);

	    this.message = message;
	};

	var CannotDeleteLayerException = exports.CannotDeleteLayerException = function (_PixelException) {
	    _inherits(CannotDeleteLayerException, _PixelException);

	    function CannotDeleteLayerException() {
	        _classCallCheck(this, CannotDeleteLayerException);

	        return _possibleConstructorReturn(this, (CannotDeleteLayerException.__proto__ || Object.getPrototypeOf(CannotDeleteLayerException)).apply(this, arguments));
	    }

	    return CannotDeleteLayerException;
	}(PixelException);

	var CannotSelectLayerException = exports.CannotSelectLayerException = function (_PixelException2) {
	    _inherits(CannotSelectLayerException, _PixelException2);

	    function CannotSelectLayerException() {
	        _classCallCheck(this, CannotSelectLayerException);

	        return _possibleConstructorReturn(this, (CannotSelectLayerException.__proto__ || Object.getPrototypeOf(CannotSelectLayerException)).apply(this, arguments));
	    }

	    return CannotSelectLayerException;
	}(PixelException);

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Tools = exports.Tools = function () {
	    function Tools(pixelInstance) {
	        _classCallCheck(this, Tools);

	        this.pixelInstance = pixelInstance;
	        this.type = {
	            brush: "brush",
	            rectangle: "rectangle",
	            grab: "grab",
	            erase: "erase",
	            select: "select"
	        };
	        this.currentTool = this.type.brush;
	    }

	    _createClass(Tools, [{
	        key: "getAllTools",
	        value: function getAllTools() {
	            var allTools = [];

	            for (var type in this.type) {
	                allTools.push(type);
	            }
	            return allTools;
	        }
	    }, {
	        key: "setCurrentTool",
	        value: function setCurrentTool(tool) {
	            // Remove actions that were specific to the previous tool
	            switch (this.currentTool) {
	                case this.type.grab:
	                    this.pixelInstance.disableDragScrollable();
	                    break;
	                case this.type.brush:
	                    this.pixelInstance.uiManager.destroyBrushCursor();
	                    break;
	                case this.type.erase:
	                    this.pixelInstance.uiManager.destroyBrushCursor();
	                    break;
	                case this.type.rectangle:
	                    this.pixelInstance.uiManager.destroyBrushCursor();
	                    break;
	                default:
	                    break;
	            }

	            this.currentTool = tool;
	            this.pixelInstance.uiManager.markToolSelected(tool);
	            var mouseClickDiv = document.getElementById("diva-1-outer");

	            // Add actions that are specific to the current tool
	            var slider = document.getElementById("brush-size");
	            if (slider === null) {
	                this.pixelInstance.uiManager.createBrushSizeSelector();
	                slider = document.getElementById("brush-size");
	            }
	            switch (tool) {
	                case this.type.grab:
	                    this.pixelInstance.enableDragScrollable();
	                    slider.style.visibility = "hidden";
	                    mouseClickDiv.style.cursor = "-webkit-grab";
	                    break;
	                case this.type.rectangle:
	                    slider.style.visibility = "hidden";
	                    mouseClickDiv.style.cursor = "crosshair";
	                    break;
	                case this.type.brush:
	                    slider.style.visibility = "visible";
	                    this.pixelInstance.uiManager.createBrushCursor();
	                    mouseClickDiv.style.cursor = "none";
	                    break;
	                case this.type.erase:
	                    slider.style.visibility = "visible";
	                    this.pixelInstance.uiManager.createBrushCursor();
	                    mouseClickDiv.style.cursor = "none";
	                    break;
	                case this.type.select:
	                    slider.style.visibility = "hidden";
	                    mouseClickDiv.style.cursor = "crosshair";
	                    break;
	                default:
	                    mouseClickDiv.style.cursor = "default";
	            }
	        }
	    }, {
	        key: "getCurrentTool",
	        value: function getCurrentTool() {
	            return this.currentTool;
	        }
	    }]);

	    return Tools;
	}();

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */

	var Import = exports.Import = function () {
	    function Import(pixelInstance, layers, pageIndex, zoomLevel, uiManager) {
	        _classCallCheck(this, Import);

	        this.pixelInstance = pixelInstance;
	        this.layers = layers;
	        this.exportInterrupted = false;
	        this.pageIndex = pageIndex;
	        this.zoomLevel = zoomLevel;
	        this.matrix = null;
	        this.uiManager = uiManager;
	    }

	    /**
	     * Allows a user to upload an image from their local machine to a layer as its background image.
	     * @param layer
	     * @param e
	     */


	    _createClass(Import, [{
	        key: "uploadLocalImageToLayer",
	        value: function uploadLocalImageToLayer(layer, e) {
	            var _this = this;

	            var reader = new FileReader();

	            reader.onload = function (event) {
	                _this.importFromImageURLToLayer(layer, event.target.result);
	            };

	            reader.readAsDataURL(e.target.files[0]);
	        }

	        /**
	         * Imports an image from a url to canvas and converts the RGB values of the image to the layer's RGB colours
	         * Transparent pixels will stay transparent
	         * @param layer
	         * @param url: Data URLs are fully supported but file urls can cause the canvas to be "tainted" according to CORS
	         * specifications since it comes from a different origin
	         */

	    }, {
	        key: "importFromImageURLToLayer",
	        value: function importFromImageURLToLayer(layer, url) {
	            var _this2 = this;

	            var imageCanvas = document.createElement("canvas");
	            imageCanvas.width = layer.getCanvas().width;
	            imageCanvas.height = layer.getCanvas().height;

	            var ctx = imageCanvas.getContext("2d");
	            var img = new Image();
	            img.src = url;

	            img.onload = function () {
	                ctx.drawImage(img, 0, 0);

	                var imageData = ctx.getImageData(0, 0, layer.getCanvas().width, layer.getCanvas().height),
	                    data = imageData.data;

	                // Convert the colour of the image to the layer's colour
	                for (var i = 0; i < data.length; i += 4) {
	                    data[i] = layer.colour.red; // red
	                    data[i + 1] = layer.colour.green; // green
	                    data[i + 2] = layer.colour.blue; // blue
	                }
	                // overwrite original image
	                ctx.putImageData(imageData, 0, 0);

	                // Set this as the background image of the canvas
	                layer.setBackgroundImageCanvas(imageCanvas);
	                layer.drawLayer(_this2.pixelInstance.core.getSettings().maxZoomLevel, layer.getCanvas());
	            };
	        }
	    }]);

	    return Import;
	}();

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*jshint esversion: 6 */
	var Selection = exports.Selection = function () {
	    function Selection() {
	        _classCallCheck(this, Selection);

	        this.layer = null;
	        this.selectedShape = null;
	        this.type = "selection";
	        this.imageData = null;
	    }

	    _createClass(Selection, [{
	        key: "copyShape",
	        value: function copyShape(maxZoomLevel) {
	            this.layer.removeShapeFromLayer(this.selectedShape);
	            this.layer.drawLayer(maxZoomLevel, this.layer.getCanvas());

	            var scaleRatio = Math.pow(2, maxZoomLevel);

	            // Get coordinates of the selection shape (a rectangle here)
	            var absoluteRectOriginX = this.selectedShape.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.selectedShape.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.selectedShape.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.selectedShape.relativeRectHeight * scaleRatio;

	            var xmin = Math.min(absoluteRectOriginX, absoluteRectOriginX + absoluteRectWidth),
	                ymin = Math.min(absoluteRectOriginY, absoluteRectOriginY + absoluteRectHeight);

	            var selectedLayerCtx = this.layer.getCanvas().getContext("2d");
	            var imageData = selectedLayerCtx.getImageData(xmin, ymin, Math.abs(absoluteRectWidth), Math.abs(absoluteRectHeight));

	            this.imageData = imageData;

	            this.selectedShape.changeBlendModeTo("add");
	        }
	    }, {
	        key: "cutShape",
	        value: function cutShape(maxZoomLevel) {
	            this.layer.removeShapeFromLayer(this.selectedShape);
	            this.layer.drawLayer(maxZoomLevel, this.layer.getCanvas());

	            var scaleRatio = Math.pow(2, maxZoomLevel);

	            // Get coordinates of the selection shape (a rectangle here)
	            var absoluteRectOriginX = this.selectedShape.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.selectedShape.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.selectedShape.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.selectedShape.relativeRectHeight * scaleRatio;

	            var xmin = Math.min(absoluteRectOriginX, absoluteRectOriginX + absoluteRectWidth),
	                ymin = Math.min(absoluteRectOriginY, absoluteRectOriginY + absoluteRectHeight);

	            var selectedLayerCtx = this.layer.getCanvas().getContext("2d");
	            var imageData = selectedLayerCtx.getImageData(xmin, ymin, Math.abs(absoluteRectWidth), Math.abs(absoluteRectHeight));

	            this.imageData = imageData;

	            this.selectedShape.changeBlendModeTo("subtract");
	            this.layer.addShapeToLayer(this.selectedShape);
	            this.layer.drawLayer(maxZoomLevel, this.layer.getCanvas());
	        }

	        /**
	         * Must redraw layer after calling
	         * @param layerToPasteTo
	         * @param maxZoomLevel
	         */

	    }, {
	        key: "pasteShapeToLayer",
	        value: function pasteShapeToLayer(layerToPasteTo) {
	            var data = this.imageData.data;

	            // Change imageData colour to layer's colour
	            for (var i = 0; i < data.length; i += 4) {
	                data[i] = layerToPasteTo.colour.red; // red
	                data[i + 1] = layerToPasteTo.colour.green; // green
	                data[i + 2] = layerToPasteTo.colour.blue; // blue
	            }
	            layerToPasteTo.addToPastedRegions(this);
	        }
	    }, {
	        key: "setSelectedShape",
	        value: function setSelectedShape(selectedShape, selectedLayer) {
	            this.selectedShape = selectedShape;
	            this.layer = selectedLayer;
	        }
	    }, {
	        key: "clearSelection",
	        value: function clearSelection(maxZoomLevel) {
	            if (this.layer !== null && this.selectedShape !== null) {
	                if (this.selectedShape.blendMode === "select") this.layer.removeShapeFromLayer(this.selectedShape);
	                this.layer.drawLayer(maxZoomLevel, this.layer.getCanvas());
	            }
	        }
	    }, {
	        key: "drawOnPage",
	        value: function drawOnPage(layer, pageIndex, zoomLevel, renderer, canvas) {
	            var scaleRatio = Math.pow(2, zoomLevel);

	            // Get coordinates of the selection shape (a rectangle here)
	            var absoluteRectOriginX = this.selectedShape.origin.relativeOriginX * scaleRatio,
	                absoluteRectOriginY = this.selectedShape.origin.relativeOriginY * scaleRatio,
	                absoluteRectWidth = this.selectedShape.relativeRectWidth * scaleRatio,
	                absoluteRectHeight = this.selectedShape.relativeRectHeight * scaleRatio;

	            var xmin = Math.min(absoluteRectOriginX, absoluteRectOriginX + absoluteRectWidth);
	            var ymin = Math.min(absoluteRectOriginY, absoluteRectOriginY + absoluteRectHeight);

	            var pasteCanvas = document.createElement("canvas");
	            pasteCanvas.width = Math.abs(absoluteRectWidth);
	            pasteCanvas.height = Math.abs(absoluteRectHeight);

	            pasteCanvas.getContext("2d").putImageData(this.imageData, 0, 0);

	            canvas.getContext("2d").drawImage(pasteCanvas, xmin, ymin);
	        }
	    }]);

	    return Selection;
	}();

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Created by zeyadsaleh on 2017-08-14.
	 */
	var Tutorial = exports.Tutorial = function () {
	    function Tutorial(pixelInstance) {
	        _classCallCheck(this, Tutorial);

	        this.pixelInstance = pixelInstance;
	        this.currentTutorialPageIndex = 0;
	        this.modalContent = document.createElement('div');
	        this.createTutorial();
	    }

	    _createClass(Tutorial, [{
	        key: 'createTutorial',
	        value: function createTutorial() {
	            var overlay = document.createElement('div');
	            overlay.setAttribute("id", "tutorial-div");

	            var background = document.createElement('div');
	            background.setAttribute("id", "tutorial-overlay");

	            var modal = document.createElement('div');
	            modal.setAttribute("id", "myModal");
	            modal.setAttribute("class", "modal");

	            this.modalContent.setAttribute("class", "modal-content");

	            var modalHeader = document.createElement('div');
	            modalHeader.setAttribute("class", "modal-header");

	            var text = document.createTextNode("Tutorial");
	            var h2 = document.createElement('h2');
	            h2.appendChild(text);

	            var closeModal = document.createElement('span');
	            closeModal.setAttribute("class", "close");
	            closeModal.innerHTML = "&times;";

	            var modalBody = this.getModalBody(this.currentTutorialPageIndex);

	            var modalFooter = document.createElement('div');
	            modalFooter.setAttribute("class", "modal-footer");
	            modalFooter.setAttribute("id", "modal-footer");

	            var close = document.createElement('h2');
	            close.innerHTML = "Got It!";

	            modal.appendChild(this.modalContent);
	            this.modalContent.appendChild(modalHeader);
	            this.modalContent.appendChild(modalBody);
	            this.modalContent.appendChild(modalFooter);
	            modalHeader.appendChild(h2);
	            modalHeader.appendChild(closeModal);
	            modalFooter.appendChild(close);

	            overlay.appendChild(background);
	            overlay.appendChild(modal);
	            document.body.appendChild(overlay);

	            modal.style.display = "block";

	            modalFooter.addEventListener("click", function () {
	                overlay.parentNode.removeChild(overlay);
	            });
	        }
	    }, {
	        key: 'getModalBody',
	        value: function getModalBody(tutorialPageIndex) {
	            var _this = this;

	            var modalBody = document.createElement('div');
	            modalBody.setAttribute("class", "modal-body");
	            modalBody.setAttribute("id", "modal-body");

	            var tutorialP = document.createElement('p');
	            var img = new Image();
	            img.className = "tutorial-image";
	            var next = document.createElement("button");
	            next.innerHTML = "Next";
	            var previous = document.createElement("button");
	            previous.innerHTML = "Previous";
	            var progress = document.createElement('p');
	            progress.setAttribute("id", "tutorial-progress");
	            progress.innerHTML = tutorialPageIndex + 1 + "/16";

	            next.addEventListener("click", function () {
	                _this.currentTutorialPageIndex++;
	                _this.getTutorialPage(_this.currentTutorialPageIndex);
	            });
	            previous.addEventListener("click", function () {
	                _this.currentTutorialPageIndex--;
	                _this.getTutorialPage(_this.currentTutorialPageIndex);
	            });

	            switch (tutorialPageIndex) {
	                case 0:
	                    tutorialP.innerHTML = "Navigate to the page you would like to edit and click the Pixel.js icon to open the toolboxes and layers view.";
	                    img.src = "https://media.giphy.com/media/aL9oQ0f1sDIpq/giphy.gif";
	                    break;
	                case 1:
	                    tutorialP.innerHTML = "Each layer has its own specific colour and represents a classification category. Create as many layers as needed. <br> A collection of keyboard shortcuts have been implemented. Each layer can be selected by its number (from <kbd>1</kbd> to <kbd>9</kbd>). Hover over the layers to receive a prompt.";
	                    img.src = "https://media.giphy.com/media/rBiuWy5YUsIow/giphy.gif";
	                    break;
	                case 2:
	                    tutorialP.innerHTML = "You can upload images to the currently selected layer. The image will be converted to the specified layer's colour. <br> In this example, we have uploaded the output images of a classification method in order to correct it.";
	                    img.src = "https://media.giphy.com/media/Qy4u6oHru8OpG/giphy.gif";
	                    break;
	                case 3:
	                    tutorialP.innerHTML = "Double click on the layer's name to rename it.";
	                    img.src = "https://media.giphy.com/media/LRxzQa1ogqKAw/giphy.gif";
	                    break;
	                case 4:
	                    tutorialP.innerHTML = "Use zoom along with the grab tool <kbd>g</kbd> to navigate a page.";
	                    img.src = "https://media.giphy.com/media/hcLjZ9dFHOKDm/giphy.gif";
	                    break;
	                case 5:
	                    tutorialP.innerHTML = "Use the select tool <kbd>s</kbd> to copy <kbd>Ctrl</kbd> + <kbd>c</kbd> or cut <kbd>Ctrl</kbd> + <kbd>x</kbd> and paste <kbd>Ctrl</kbd> + <kbd>v</kbd> rectangular regions of pixels from one layer to another.";
	                    img.src = "https://media.giphy.com/media/ruMD98axGjdyE/giphy.gif";
	                    break;
	                case 6:
	                    tutorialP.innerHTML = "Right-click and drag right and left on the erase <kbd>e</kbd> and brush <kbd>b</kbd> tools to change the brush size.";
	                    img.src = "https://media.giphy.com/media/NhvALG9MhGYta/giphy.gif";
	                    break;
	                case 7:
	                    tutorialP.innerHTML = "Press <kbd>Shift</kbd> and drag on the erase <kbd>e</kbd> and brush <kbd>b</kbd> tools to draw straight lines.";
	                    img.src = "https://media.giphy.com/media/t74TeR1gd9aaA/giphy.gif";
	                    break;
	                case 8:
	                    tutorialP.innerHTML = "Right-click and drag on rectangle tool <kbd>r</kbd> to erase rectangular regions, left-click to draw rectangle. Press <kbd>Shift</kbd> to draw squares.";
	                    img.src = "https://media.giphy.com/media/i497rUNYB8t32/giphy.gif";
	                    break;
	                case 9:
	                    tutorialP.innerHTML = "Use the Fullscreen mode <kbd>f</kbd> and the browser zoom to get more precision, when needed. <br> To exit Fullscreen mode, press on <kbd>f</kbd> again.";
	                    img.src = "https://media.giphy.com/media/FkzOAenUJxfGg/giphy.gif";
	                    break;
	                case 10:
	                    tutorialP.innerHTML = "You can bring a layer forward/backward by clicking and dragging them to their desired position.";
	                    img.src = "https://media.giphy.com/media/DImPhyGZ3OltC/giphy.gif";
	                    break;
	                case 11:
	                    tutorialP.innerHTML = "You can undo <kbd>Ctrl</kbd> + <kbd>z</kbd> and redo <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>z</kbd> an action.";
	                    img.src = "https://media.giphy.com/media/24kHpWLzbHFrq/giphy.gif";
	                    break;
	                case 12:
	                    tutorialP.innerHTML = "You can delete a layer by selecting it and then using <kbd>Ctrl</kbd> + <kbd>del</kbd>.";
	                    img.src = "https://media.giphy.com/media/cmQesBkeEvdmM/giphy.gif";
	                    break;
	                case 13:
	                    tutorialP.innerHTML = "You can mute (press <kbd>m</kbd> to toggle on/off) or hide (hold <kbd>h</kbd> to turn off, release to turn on) layers.";
	                    img.src = "https://media.giphy.com/media/BhVXr7ONVdStq/giphy.gif";
	                    break;
	                case 14:
	                    tutorialP.innerHTML = "Change the opacity of a layer by displaying the layer options.";
	                    img.src = "https://media.giphy.com/media/94EtnDoG2yNAQ/giphy.gif";
	                    break;
	                case 15:
	                    tutorialP.innerHTML = "Export layers as PNGs to save a specific layer as an image. See the " + '<a href="https://github.com/DDMAL/Pixel.js/wiki">wiki</a>' + " for details on the different export buttons and more information.";
	                    img.src = "https://media.giphy.com/media/kBAau6Gebio7e/giphy.gif";
	                    break;

	                // let hotkeyGlossary = document.createElement('ul');
	                // hotkeyGlossary.setAttribute("style", "list-style-type:none;");
	                //
	                // let LayerSelect = document.createElement('li');
	                // LayerSelect.innerHTML = "<kbd>1</kbd> ... <kbd>9</kbd> layer select";
	                //
	                // let brushTool = document.createElement('li');
	                // brushTool.innerHTML = "<kbd>b</kbd> brush tool";
	                //
	                // let rectangleTool = document.createElement('li');
	                // rectangleTool.innerHTML = "<kbd>r</kbd> rectangle tool";
	                //
	                // let grabTool = document.createElement('li');
	                // grabTool.innerHTML = "<kbd>g</kbd> grab tool";
	                //
	                // let eraserTool = document.createElement('li');
	                // eraserTool.innerHTML = "<kbd>e</kbd> eraser tool";
	                //
	                // let shift = document.createElement('li');
	                // shift.innerHTML = "<kbd>Shift</kbd>  force tools to paint in an exact way.";
	                //
	                // let undo = document.createElement('li');
	                // undo.innerHTML = "<kbd>cmd</kbd> + <kbd>z</kbd> undo";
	                //
	                // let redo = document.createElement('li');
	                // redo.innerHTML = "<kbd>cmd</kbd> + <kbd>Shift</kbd> + <kbd>z</kbd> redo";
	            }

	            modalBody.appendChild(img);
	            modalBody.appendChild(tutorialP);
	            if (this.currentTutorialPageIndex !== 0) modalBody.appendChild(previous);
	            if (this.currentTutorialPageIndex !== 15) modalBody.appendChild(next);
	            modalBody.appendChild(progress);

	            return modalBody;
	        }
	    }, {
	        key: 'getTutorialPage',
	        value: function getTutorialPage(pageIndex) {
	            var modalBody = document.getElementById("modal-body");
	            modalBody.parentElement.removeChild(modalBody);

	            this.modalContent.insertBefore(this.getModalBody(pageIndex), document.getElementById("modal-footer"));
	        }
	    }]);

	    return Tutorial;
	}();

/***/ })
/******/ ]);