// Copyright AJ Weeks 2015 
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */
/* global Bugsnag */

var get = function (what) {
    return document.getElementById(what);
};

var Game = {};

Game.init = function () {
    Game.version = 0.031;
    document.title = "Mirrors V" + Game.version;
    get('versionNumber').innerHTML = '<a href="https://github.com/ajweeks/mirrors-js" target="_blank" style="color: inherit; text-decoration: none;">' + "V." + Game.version + '</a>';
    Bugsnag.appVersion = Game.version;
    
    
    Game.types = {};
    Game.types.tiles = {};
    Game.types.colours = {};
    Game.types.states = {};
    
    Game.types.tiles.BLANK = 0;
    Game.types.tiles.MIRROR = 1;
    Game.types.tiles.POINTER = 2;
    Game.types.tiles.RECEPTOR = 3;
    
    Game.types.colours.RED = 0;
    Game.types.colours.GREEN = 1;
    Game.types.colours.BLUE = 2;
    
    Game.types.states.MAIN_MENU = "mainmenustate";
    Game.types.states.GAME = "gamestate";
    Game.types.states.ABOUT = "aboutstate";
    
    Game.selectedTile = Game.types.tiles.BLANK;
    
    //-------------------//
    //      IMAGES       //
    //-------------------//
    
    Game.images = {};
    Game.images.lasers = {};
    
    Game.images[Game.types.tiles.BLANK] = new Image();
    Game.images[Game.types.tiles.BLANK].src = "res/blank.png";
    Game.images[Game.types.tiles.BLANK].alt = "blank";

    Game.images[Game.types.tiles.MIRROR] = new Image();
    Game.images[Game.types.tiles.MIRROR].src = "res/mirror.png";
    Game.images[Game.types.tiles.MIRROR].alt = "mirror";

    Game.images[Game.types.tiles.POINTER] = new Image();
    Game.images[Game.types.tiles.POINTER].src = "res/pointer.png";
    Game.images[Game.types.tiles.POINTER].alt = "pointer";

    Game.images[Game.types.tiles.RECEPTOR] = new Image();
    Game.images[Game.types.tiles.RECEPTOR].src = "res/receptor_white.png";
    Game.images[Game.types.tiles.RECEPTOR].alt = "receptor";

    Game.images.lasers[Game.types.colours.RED] = [];
    Game.images.lasers[Game.types.colours.RED] = new Image();
    Game.images.lasers[Game.types.colours.RED].src = "res/laser_red.png";
    Game.images.lasers[Game.types.colours.RED].alt = "red laser";

    Game.images.lasers[Game.types.colours.GREEN] = new Image();
    Game.images.lasers[Game.types.colours.GREEN].src = "res/laser_green.png";
    Game.images.lasers[Game.types.colours.GREEN].alt = "green laser";

    Game.images.lasers[Game.types.colours.BLUE] = new Image();
    Game.images.lasers[Game.types.colours.BLUE].src = "res/laser_blue.png";
    Game.images.lasers[Game.types.colours.BLUE].alt = "blue laser";

    Game.tileSize = 64;

    Game.offset = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // tile offsets (N, E, S, W)
    Game.NORTH = 0;
    Game.EAST = 1;
    Game.SOUTH = 2;
    Game.WEST = 3;

    Game.NW = 0;
    Game.NE = 1;

    Game.ticks = 0;
    Game.fps = 65;

    Game.KEYBOARD = {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    ESC:      27,
    SPACE:    32,
    PAGEUP:   33,
    PAGEDOWN: 34,
    END:      35,
    HOME:     36,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDE:    192
    };
    Game.keysdown = [];
    
// LATER add mobile support
//Game.clickStr = Game.mobile ? 'ontouchend' : 'onclick';
    
    Game.stats = new Stats();
    Game.stats.setMode(0); // 0: fps, 1: ms
    Game.stats.domElement.style.position = 'absolute';
    Game.stats.domElement.style.left = '0px';
    Game.stats.domElement.style.top = '0px';
    document.body.appendChild( Game.stats.domElement );

    Game.prefs = [];

    Game.defaultPrefs = function () {
        setDebug(false); // RELEASE make false
        setLevelEditMode(false); // RELEASE make false
        Game.prefs.warn = !Game.debug;
    };
    Game.defaultPrefs();

    // @param text: text to display
    // @param state: the state to enter when this object is clicked
    Game.StateButton = function (text, state, callback, w, h) {
        this.text = text + "Button";

        var btn = '<div id="' + this.text + '" style="width: ' + w + 'px; height: ' + h + 'px; line-height: ' + h + 'px;"' +
        'onclick="Game.sm.enterState(\'' + state + '\');' + (callback||'') + '">' + text +'</div>';
        get('mainmenubuttons').innerHTML += btn;

        this.hide = function () {
            get(this.text).style.display = "none";
        };

        this.restore = function () {
            get(this.text).style.display = "block";
        };
        
        this.remove = function () {
            get('mainmenubuttons').removeChild(get(this.text));
        };

    }; // end Game.StateButton


    ////////////////////////////////////////////////////////////////////////////
    //                               STATES                                   //
    ////////////////////////////////////////////////////////////////////////////

    Game.MainMenuState = function () {
        this.type = Game.types.states.MAIN_MENU;
        
        this.play = new Game.StateButton("Play", "game", "", 180, 80);
        this.play = new Game.StateButton("About", "about", "", 180, 80);

        this.init = function (sm) {
            this.sm = sm;
        };

        this.update = function () {
//                if (Game.lmb) {
//                    this.prototype.sm.enterState(new Game.GameState(this.prototype.sm));
//                    Game.bgCanvas.style.visibility = "hidden";
//                }
//            this.sm.enterState('game');
        };

        this.render = function () {
//                var context = get('backgroundCanvas').getContext('2d');
//                context.fillStyle = "green";
//                context.fillRect(400, 10, 250, 250);
//
//                context.fillStyle = "white";
//                context.font = "64px Consolas";
//                context.fillText("Main Menu!", 400, 60);
        };

        this.click = function (event, down) {
          // LATER implement main menu state clicks
        };
        
        this.hover = function (into) {
            
        };
        
        // gets called when another state is placed on top of the stack and therefore covering this one
        this.hide = function () {
//            this.play.hide();
            get('mainmenubuttons').style.display = "none";
        };

        this.restore = function () {
//            this.play.restore();
            get('mainmenubuttons').style.display = "block";
        };

        this.destroy = function () {
//            this.play.hide();
        };
    }; // end Game.MainMenuState

    Game.AboutState = function () {
        this.init = function (sm) {
            this.sm = sm;
            this.type = Game.types.states.ABOUT;
            get('aboutinfo').style.display = "block";
        };

        this.update = function () {};

        this.render = function () {};

        this.restore = function () {
            get('aboutinfo').style.display = "block";
        };

        this.destroy = function () {
            get('aboutinfo').style.display = "none";
        };
        
    };
    
    Game.GameState = function () {
        this.init = function (sm) {
            this.sm = sm;
            this.type = Game.types.states.GAME;
            this.board = new Game.GameState.Board(10, 8, this);
            this.board.updateBoard();
            get('gamecanvas').style.display = "block";

            var lvledittiles = '<div class="col">'+
                '<div class="selectionTile" id="0tile" onmousedown="selectionTileClick(event, true, 0);" onmouseup="selectionTileClick(event, false, 0);"></div>' +
                '<div class="selectionTile" id="1tile" onmousedown="selectionTileClick(event, true, 1);" onmouseup="selectionTileClick(event, false, 1);"></div>' +
                '<div class="selectionTile" id="2tile" onmousedown="selectionTileClick(event, true, 2);" onmouseup="selectionTileClick(event, false, 2);"></div>' +
                '<div class="selectionTile" id="3tile" onmousedown="selectionTileClick(event, true, 3);" onmouseup="selectionTileClick(event, false, 3);"></div>' +
                '</div>';
            get('lvledittiles').innerHTML = lvledittiles;
            get('0tile').style.backgroundColor = "red";
            
            get('lvledittilescanvas').width = Game.tileSize;
            get('lvledittilescanvas').height = 4 * Game.tileSize;
            
            if (Game.levelEditMode) {
                get('lvledittilesarea').style.display = "block";
            }
        };

        this.update = function () {
            this.board.update();
        };

        this.render = function () {
            this.board.render();
            if (Game.levelEditMode) {
                var context = get('lvledittilescanvas').getContext('2d');
                context.fillStyle = "orange";
                context.fillRect(0, 0, 64, 64);
                context.fillRect(0, 64, 64, 64);
                context.fillRect(0, 128, 64, 64);
                context.fillRect(0, 192, 64, 64);
            }
        };

        this.restore = function () {
            this.board.updateBoard();
            get('gamecanvas').style.display = "block";
            if (Game.levelEditMode) get('lvledittilesarea').style.display = "block";
        };

        this.destroy = function () {
            get('tiles').innerHTML = "";
            get('gamecanvas').style.display = "none";
            get('lvledittilesarea').style.display = "none";
        };
        
        this.click = function (event, down, x, y) {
            this.board.click(event, down, x, y);
        };
        
        this.hover = function (into, x, y) {
            this.board.hover(into, x, y);
        };
        
    }; // end Game.GameState()

    /* @param colours: an array of size two [single laser, corner laser]
       @param dir: direction the tile is facing */
    Game.GameState.Laser = function (entering, exiting, image) { 
        this.entering = entering;
        this.exiting = exiting;
        this.image = image;

        this.render = function (x, y, dir, size) {
//                if (this.entering !== null) Game.renderImage(context, x, y, this.image, add(dir, this.entering), size);
//                if (this.exiting !== null) Game.renderImage(context, x, y, this.image, add(dir, this.exiting), size);
        };
    }; // end Game.GameState.Laser()

    // represents an actual receptor, in a receptor tile (receptor tiles can have 0-4 of these things)
    Game.GameState.Receptor = function (dir, col) {
        this.dir = dir; // the dir we are facing relative to our host tile
        this.col = col;
        this.laser = null;
        this.on = false;

        this.update = function (dir) {
            if (this.dir === null) return;
            this.on = false;
            if (this.laser !== null) {
                if (this.laser.entering === add(this.dir, dir) && this.colourTurnsMeOn(this, this.laser.col)) {
                    this.on = true;
                }
            }

            if (!this.on) {
                this.laser = null;
            }
        };

        this.render = function(context, dir, x, y) {
            if (this.dir === null) return;

            if (this.on) {
                context.fillStyle = "green";
                context.fillRect(x, y, Game.tileSize, Game.tileSize);
            }
            
            Game.renderImage(context, x, y, Game.images[Game.types.tiles.RECEPTOR], add(this.dir, dir), Game.tileSize);
            Game.renderImage(context, x, y, Game.images.lasers[col], add(this.dir, dir), Game.tileSize);
        };

        // returns whether or not the specified color turns the specified receptor on
        this.colourTurnsMeOn = function (receptor, col) {
            if (receptor.dir === null) return false;
            return true;
            // LATER implement colour turns me on method
//            if (col === Game.images.receptors.white) return true;
//            if (col === receptor.image) return true;
        };
    }; // end Game.GameState.Receptor()

    Game.GameState.Tile = function (x, y, type, dir) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hovering = false;
        this.lasers = [];
        this.dir = dir;
        
        this.maxdir = function () {
            switch(this.type) {
                case Game.types.tiles.BLANK:
                    return 0;
                case Game.types.tiles.MIRROR:
                    return 1;
                case Game.types.tiles.POINTER:
                case Game.types.tiles.RECEPTOR:
                    return 3;
                default:
                    return 0;
            }
        };

        // init
        switch (this.type) {
            case Game.types.tiles.BLANK:
            case Game.types.tiles.MIRROR:
                this.init = function () {};
                break;
            case Game.types.tiles.POINTER:
                this.init = function () {
                    this.on = false;
                };
                break;
            case Game.types.tiles.RECEPTOR:
                this.init = function () {
                    this.receptors = [new Game.GameState.Receptor(Game.NORTH, Game.types.colours.RED), null, new Game.GameState.Receptor(Game.NORTH, Game.types.colours.RED), null];
                };
                break;
            default:
                this.init = function () {};
                break;
        }

        // click
        switch (this.type) {
            case Game.types.tiles.BLANK:
            case Game.types.tiles.MIRROR:
            case Game.types.tiles.RECEPTOR:
                this.click = function (event, down) {
                    if (down === false) return; // for now we don't care about mouse releases FUTURE use mouse releases for something?
                    if (event.which === 3 || event.button === 2) { // right click
                        // Rotate clockwise by default on right click
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (event.which === 1 || event.button === 0){ // left click
                        if (Game.levelEditMode) {
                            this.type += 1;
                            if (this.type > Game.types.tiles.RECEPTOR) this.type = 0;
                        }
                    }
                };
                break;
            case Game.types.tiles.POINTER:
                this.click = function (event, down) {
                    if (!down) return; // for now we don't care about mouse releases FUTURE use mouse releases for something?
                    if (event.which === 3 || event.button === 2) { // right click
                        // Rotate clockwise by default on right click
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (event.which === 1 || event.button === 0) { // left click
                        this.on = !this.on;
                        if (this.on === false) {
                            this.removeAllLasers();
                        } else {
                            if (this.lasers.length === 0) {
                                this.lasers.push(new Game.GameState.Laser(null, Game.NORTH, Game.images.lasers[Game.types.colours.RED]));
                            }
                        }
                        if (Game.levelEditMode) {
                            this.type += 1;
                            if (this.type > Game.types.tiles.RECEPTOR) this.type = 0;
                        }
                    }
                };
                break;
            default:
                this.click = function (event, down) {};
                break;
        }
        
        // hover
        switch (this.type) {
            case Game.types.tiles.BLANK:
            case Game.types.tiles.MIRROR:
            case Game.types.tiles.RECEPTOR:
            case Game.types.tiles.POINTER:
                this.hover = function (into) {
                    this.hovering = into;
                };
                break;
            default:
                this.hover = function (into) {
                    this.hovering = into;
                };
                break;
        }

        // update
        switch (this.type) {
            case Game.types.tiles.BLANK:
            case Game.types.tiles.MIRROR:
            case Game.types.tiles.RECEPTOR:
                this.update = function () {};
                break;
            case Game.types.tiles.POINTER:
                this.update = function (board) {
                    if (this.on === false) return;

                    // Begin laser path! (iteratively, not recusively) ((cause recursion is scary))
                    var checkedTiles = [this.w * this.h], // 0=not checked, 1=checked once, 2=checked twice (done)
                        nextDir = this.dir, // direction towards next tile
                        nextTile = board.getTile(this.x, this.y),
                        xx,
                        yy;

                    do {
                        xx = nextTile.x + Game.offset[nextDir][0];
                        yy = nextTile.y + Game.offset[nextDir][1];

                        if (xx < 0 || xx >= board.w || yy < 0 || yy >= board.h) break; // The next direction is leading us into the wall
                        if (checkedTiles[xx + yy * board.w] >= 2) break; // we've already checked this tile twice (this line avoids infinite loops)
                        else checkedTiles[xx + yy * board.w]++;

                        nextTile = board.getTile(xx, yy); // get the tile to be updated
                        if (!nextTile) break; // we hit a wall

                        if (nextTile.type === Game.types.tiles.POINTER) { // !!!! Add all other opaque tiles here
                            break;
                        }

                        // Find the next direction *after* setting the new laser object
                        nextTile.addLaser(new Game.GameState.Laser(opposite(nextDir), null, Game.images.lasers[this.lasers[0].col]));
                        if (nextTile.lasers.length > 0) {
                            nextDir = nextTile.lasers[nextTile.lasers.length - 1].exiting;
                        } else break; // they didn't add the laser, end the chain
                    } while (nextDir !== null);

                };
                break;
            default:
                this.update = function () {};
                break;
        }

        // render
        switch (this.type) {
            case Game.types.tiles.BLANK:
            case Game.types.tiles.MIRROR:
            case Game.types.tiles.POINTER:
                this.render = function (context, x, y) {
                    // Default render function
                    for (var i = 0; i < this.lasers.length; i++) {
                        this.lasers[i].render(context, this.type === Game.types.tiles.POINTER ? this.dir : 0, x, y);
                    }

                    var image = Game.images[this.type];

                    Game.renderImage(context, x, y, image, this.dir, Game.tileSize);
                };
                break;
            case Game.types.tiles.RECEPTOR:
                this.render = function (context, x, y, dir) {/* render */
                    for (var i = 0; i < this.receptors.length; i++) {
                        if (this.receptors[i] !== null) this.receptors[i].render(context, dir, x, y);
                    }
                };
                break;
            default:
                this.render = function (context, x, y) {};
                break;
        }

        this.addLaser = function (laser) {
            switch (this.type) {
                case Game.types.tiles.BLANK:
                    laser.exiting = opposite(laser.entering);
                    break;
                case Game.types.tiles.POINTER:
                    return; // pointers already have their own laser!! don't add another one!
                case Game.types.tiles.RECEPTOR:
                    break;
                case Game.types.tiles.MIRROR:
                    // there's probably a better way to do this, this will work for now though. FUTURE - implement a cool algorithm which elegantly handles this
                    if (this.dir === Game.NW) {
                        if (laser.entering === Game.NORTH) laser.exiting = Game.EAST;
                        else if (laser.entering === Game.EAST) laser.exiting = Game.NORTH;
                        else if (laser.entering === Game.SOUTH) laser.exiting = Game.WEST;
                        else if (laser.entering === Game.WEST) laser.exiting = Game.SOUTH;
                    } else if (this.dir === Game.NE) {
                        if (laser.entering === Game.NORTH) laser.exiting = Game.WEST;
                        else if (laser.entering === Game.WEST) laser.exiting = Game.NORTH;
                        else if (laser.entering === Game.EAST) laser.exiting = Game.SOUTH;
                        else if (laser.entering === Game.SOUTH) laser.exiting = Game.EAST;
                    }
                    break;
                }
                this.lasers.push(laser);
        };

        this.removeAllLasers = function () {
            this.lasers = [];
        };

        this.init();
    }; // end Game.GameState.Tile()

    Game.GameState.Board = function (w, h, gs) {
        var str, i, y, x, bgimg, type, dir;
        this.w = w;
        this.h = h;
        this.gs = gs;
        this.tiles = [w * h];

        for (i = 0; i < w * h; i++) {
            this.tiles[i] =  new Game.GameState.Tile(i % w, Math.floor(i / w), Game.types.tiles.MIRROR, Game.NORTH);
            this.tiles[i].init();
        }
        
        // create div tags! (used only for handling input, all rendering is done with a canvas)
        // div tags only get created (or recreated) when loading a new level
        this.updateBoard = function () {
            str = "";
            get('tiles').innerHTML = str; // clear any previous game board
            for (y = 0; y < h; y++) {
                str += '<div class="row">';
                for (x = 0; x < w; x++) {
                    type = this.tiles[y * w + x].type;
                    dir = this.tiles[y * w + x].dir;
                    this.tiles[y * w + x] = new Game.GameState.Tile(i % w, Math.floor(i / w), type, dir);
                    this.tiles[y * w + x].init();
                    bgimg = Game.images[this.tiles[y * w + x].type].src || "res/blank.png";
                    str += '<div class="tile"' +
                        'onmousedown="boardClick(event, true, ' + y + ', ' + x + ');"' +
                        'onmouseup="boardClick(event, false, ' + y + ', ' + x + ');"' +
                        'onmouseover="boardHover(true, ' + y + ', ' + x + ');"' +
                        'onmouseout="boardHover(false, ' + y + ', ' + x + ');"' +
                        'style="top: ' + (y * Game.tileSize) + 'px; ' +
                        'left: ' + (x * Game.tileSize) + 'px;"></div>';
                }
                str += '</div>';
            }
            get('tiles').innerHTML= str;
            
            // centering code:
            get('gameboard').style.left = "50%";
            get('gameboard').style.marginLeft = -(w * Game.tileSize) / 2 + "px";
            
            get('gameboard').style.width = w * Game.tileSize+ "px";
            get('gameboard').style.height = h * Game.tileSize + "px";
            
            get('gamecanvas').width = w * Game.tileSize;
            get('gamecanvas').height = h * Game.tileSize;
            
        };
        this.updateBoard();

        this.update = function () {
            // FIXME update all tiles here
//            //remove all lasers (except for pointer tiles
//            for (i = 0; i < this.tiles.length; i++) {
//                if (this.tiles[i].type !== Game.types.POINTER) this.tiles[i].removeAllLasers();
//            }
//
//            for (i = 0; i < w * h; i++) {
//                this.tiles[i].update(this);
//            }
        };

        this.getTile = function (x, y) {
            if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
                if (this.tiles[x * this.w + y]) {
                    return this.tiles[x + y * this.w];
                }
            }
            return null;
        };

        this.render = function () {
            var context = get('gamecanvas').getContext('2d');
            context.fillStyle = '#0a0a0a';
            context.fillRect(0, 0, this.w * Game.tileSize, this.h * Game.tileSize);
            var i = 0;

            context.strokeStyle = '#444444';
            for (i = 0; i < w * h; i++) {
                context.strokeRect((i % w) * Game.tileSize, Math.floor(i / w) * Game.tileSize, Game.tileSize, Game.tileSize);
                this.tiles[i].render(context, (i % w) * Game.tileSize + Game.tileSize / 2, Math.floor(i / w) * Game.tileSize + Game.tileSize / 2);
            }
        };

        this.click = function (event, down, x, y) {
            this.tiles[y * this.w + x].click(event, down);
        };
        
        this.hover = function (into, x, y) {
            this.tiles[y * this.w + x].hover(into);
        };
        
    }; // end Game.GameState.Board

    Game.InitStateList = function (sm) {
        Game.StatesList = {
            'mainmenu' : new Game.MainMenuState(),
            'about' : new Game.AboutState(),
            'game' : new Game.GameState()
        };
    };

    Game.StateManager = function () {
        this.init = function () {
            Game.InitStateList(this);
            this.states = [];
            this.states.push(Game.StatesList.mainmenu);
            this.currentState().init(this);
        };

        this.update = function () {
            if (this.states.length > 0) {
                this.currentState().update();
            }
        };

        this.render = function () {
            if (this.states.length > 0) {
                this.currentState().render();
            }
        };

        this.enterState = function (state) {
            this.currentState().hide();
            this.states.push(Game.StatesList[state]);
            this.currentState().init(this);
        };

        this.enterPreviousState = function () {
            if (this.states.length > 1) { // if there is only one state, we can't go back any further
                this.currentState().destroy();
                this.states.pop();
                this.currentState().restore();
                return true;
            }
            return false;
        };

        this.currentState = function () {
            return this.states[this.states.length - 1];
        };

        this.init();
    }; // end Game.StateManager()
    Game.sm = new Game.StateManager();

    Game.renderImage = function (context, x, y, image, dir, size) {
        context.save();
        context.translate(x, y);
        context.rotate(dir * 90 * (Math.PI / 180));

        context.drawImage(image, -size / 2, -size / 2);

        context.restore();
    };

    Game.update = function () {
        Game.ticks += 1;
        
        if (Game.keysdown[Game.KEYBOARD.ESC]) {
            this.sm.enterPreviousState();
        } else if (Game.keysdown[Game.KEYBOARD.ZERO]) {
            toggleLevelEditMode();
        } else if (Game.keysdown[Game.KEYBOARD.NINE]) {
            toggleDebug();
        }
        
        Game.sm.update();
        
        for (var i = 0; i < Game.keysdown.length; i++) {
            Game.keysdown[i] = false;
        }
    };

    Game.render = function () {
        Game.sm.render();
//        var context = get('gamecanvas').getContext('2d');
    };
        
    // Main loop
    Game.loop = function () {
        Game.stats.begin();
        
        Game.update();
        if (document.hasFocus() || Game.ticks % 5 === 0) {
            Game.render();
        }
        
        Game.stats.end();
        
        window.setTimeout(Game.loop, 1000 / Game.fps);
    };
    
}; // end Game.init()

function selectionTileClick(event, down, type) {
    if (down) {
        Game.selectedTile = type;
    }
}

function toggleLevelEditMode () {
    setLevelEditMode(!Game.levelEditMode);
}

function setLevelEditMode (levelEditMode) {
    Game.levelEditMode = levelEditMode;
    if (Game.levelEditMode) {
        get('lvlEditInfo').style.backgroundColor = "#134304";
        
        if (Game.sm.currentState().type === Game.types.states.GAME) {
            get('lvledittilesarea').style.display = "block";
        }
    } else {
        get('lvlEditInfo').style.backgroundColor = "initial";
        get('lvledittilesarea').style.display = "none";
    }
}

function toggleDebug () {
    setDebug(!Game.debug);
}

function setDebug (debug) {
    Game.debug = debug;
    if (Game.debug) Game.stats.domElement.style.display = "block";
    else Game.stats.domElement.style.display = "none";
    
    if (Game.debug) {
        get('infoarea').style.display = "block";
        get('debugInfo').style.backgroundColor = "#134304";
    } else {
        get('infoarea').style.display = "none";
        get('debugInfo').style.backgroundColor = "initial";
    }
}

function clockwise (dir) {
    dir += 1;
    if (dir > 3) {
        dir = 0;
    }
    return dir;
}

function anticlockwise (dir) {
    dir -= 1;
    if (dir < 0) {
        dir = 3;
    }
    return dir;
}

function add (dir1, dir2) {
    return (dir1 + dir2) % 4;
}

function sub (dir1, dir2) {
    var result = dir1 - dir2;
    if (result < 0) {
        dir1 = (4 + result) % 4;
    } else {
        dir1 = result;
    }
    return dir1;
}

function opposite (dir) {
    if (dir === Game.NORTH) {
        dir = Game.SOUTH;
    } else if (dir === Game.EAST) {
        dir = Game.WEST;
    } else if (dir === Game.SOUTH) {
        dir = Game.NORTH;
    } else if (dir === Game.WEST) {
        dir = Game.EAST;
    } else {
        console.log("Invalid direction!! Direction: " + dir);
    }
    return dir;
}

// IMPLEMENT MOUSE AND KEYBOARD INPUT LATER
//function rightClick(event) {
//    // prevent default context menu from appearing, the actual click is handled in boardClick()
//    return false;
//}
//
//function boardClick(event) {
//    boardHover(event, true);
//    if ("which" in event) { // firefox, safari, chrome, opera
//        if (event.which === 1) Game.lmb = true;
//        else if (event.which === 3) Game.rmb = true;
//    } else if ("button" in event) { // IE 8+, opera
//        if (event.button === 0) Game.lmb = true;
//        else if (event.button === 2) Game.rmb = true;
//    }
//}
//
//function boardHover(event, inside) {
//    if (inside) {
//        if (event.pageX||event.pageY) {
//            Game.mousex = event.pageX;
//            Game.mousey = event.pageY;
//        } else if (event.clientX||event.clientY) {
//            Game.mousex = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
//            Game.mousey = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
//        }
//    } else {
//        Game.mousex = -1;
//        Game.mousey = -1;
//    }
//}
//
function keyPressed(event, down) {
    if(Game.keysdown) Game.keysdown[event.keyCode ? event.keyCode : event.which] = down;
}

window.onkeydown = function (event) { keyPressed(event, true); };
window.onkeyup = function (event) { keyPressed(event, false); };

function boardClick(event, down, y, x) {
    Game.sm.currentState().click(event, down, x, y);
}

function boardHover(into, y, x) {
    Game.sm.currentState().hover(into, x, y);
}

window.onbeforeunload=function(event) {
    if (Game.prefs.warn) {
        if (typeof event == 'undefined') event = window.event;
        if (event) event.returnValue='Are you sure you want to close Mirrors?';
    }
};

window.onload = function () {
    Bugsnag.user = {
      id: 0,
      name: "AJ Weeks",
      email: "ajweeks@shaw.ca"
    };
    
    Game.init();
    Game.loop();
};
