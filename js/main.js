// Copyright AJ Weeks 2015 
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */

var get = function (what) {
    return document.getElementById(what);
};

var Game = {};

Game.init = function () {
    Game.version = 0.030;
    document.title = "Mirrors JS V" + Game.version;
    
    //-------------------//
    //      IMAGES       //
    //-------------------//
    Game.types = {};
    
    Game.types.BLANK = 0;
    Game.types.MIRROR = 1;
    Game.types.POINTER = 2;
    Game.types.RECEPTOR = 3;
    
    Game.types.RED = 0;
    Game.types.GREEN = 1;
    Game.types.BLUE = 2;
    
    Game.images = {};
    Game.images.lasers = {};

    Game.images[Game.types.BLANK] = new Image();
    Game.images[Game.types.BLANK].src = "res/blank.png";
    Game.images[Game.types.BLANK].alt = "blank";

    Game.images[Game.types.MIRROR] = new Image();
    Game.images[Game.types.MIRROR].src = "res/mirror.png";
    Game.images[Game.types.MIRROR].alt = "mirror";

    Game.images[Game.types.POINTER] = new Image();
    Game.images[Game.types.POINTER].src = "res/pointer.png";
    Game.images[Game.types.POINTER].alt = "pointer";

    Game.images[Game.types.RECEPTOR] = new Image();
    Game.images[Game.types.RECEPTOR].src = "res/receptor_white.png";
    Game.images[Game.types.RECEPTOR].alt = "receptor";

    Game.images.lasers[Game.types.RED] = [];
    Game.images.lasers[Game.types.RED] = new Image();
    Game.images.lasers[Game.types.RED].src = "res/laser_red.png";
    Game.images.lasers[Game.types.RED].alt = "red laser";

    Game.images.lasers[Game.types.GREEN] = new Image();
    Game.images.lasers[Game.types.GREEN].src = "res/laser_green.png";
    Game.images.lasers[Game.types.GREEN].alt = "green laser";

    Game.images.lasers[Game.types.BLUE] = new Image();
    Game.images.lasers[Game.types.BLUE].src = "res/laser_blue.png";
    Game.images.lasers[Game.types.BLUE].alt = "blue laser";

    Game.tileSize = 64;

    Game.offset = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // tile offsets (N, E, S, W)
    Game.NORTH = 0;
    Game.EAST = 1;
    Game.SOUTH = 2;
    Game.WEST = 3;

    Game.NW = 0;
    Game.NE = 1;

    Game.ticks = 0;
    Game.fps = 60;

    Game.keysdown = [];
    
// LATER add mobile support
//Game.clickStr = Game.mobile ? 'ontouchend' : 'onclick';

    Game.prefs = [];

    Game.defaultPrefs = function () {
        Game.debug = true; // RELEASE make false
        Game.levelEditMode = true; // RELEASE make false
        Game.prefs.warn = !Game.debug;
    };
    Game.defaultPrefs();

    Game.stats = new Stats();
    Game.stats.setMode(0); // 0: fps, 1: ms
    Game.stats.domElement.style.position = 'absolute';
    Game.stats.domElement.style.left = '0px';
    Game.stats.domElement.style.top = '0px';
    // LATER don't render fps if in debug mode
    document.body.appendChild( Game.stats.domElement );
    
    // @param text: text to display
    // @param state: the state to enter when this object is clicked
    Game.StateButton = function (text, state, callback, w, h) {
//            this.onclick = function (event) {
//                console.log("btn! " + this.text);
//            };
        this.text = text;

        var textObj = '<a style="text-align: center; color: white;">' + text + '</a>';
        var btn = '<div id="' + text + '" style="position: relative; top: 50%; left: 50%; width: ' + w + '; height: ' + h + 
            '; backgroundColor: #3b154b" onclick="Game.sm.enterState(\'' + state + '\');' + (callback||'') + '">' + textObj + '</div>';
        get('mainmenubuttons').innerHTML += btn;

        this.hide = function () {
            get(this.text).style.display = "none";
        };

        this.restore = function () {
            get(this.text).style.display = "block";
        };

    };


    ////////////////////////////////////////////////////////////////////////////
    //                               STATES                                   //
    ////////////////////////////////////////////////////////////////////////////

    Game.MainMenuState = function () {
//            this.play = new Game.StateButton("play", "game", "", 200, 120);

        this.init = function (sm) {
            this.sm = sm;
        };

        this.update = function () {
//                if (Game.lmb) {
//                    this.prototype.sm.enterState(new Game.GameState(this.prototype.sm));
//                    Game.bgCanvas.style.visibility = "hidden";
//                }
            this.sm.enterState('game');
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
//            get('backgroundCanvas').style.visibility = "hidden";
        };

        this.restore = function () {
//            this.play.restore();
//            get('backgroundCanvas').style.visibility = "visible";
        };

        this.destroy = function () {
//            this.play.hide();
//            get('backgroundCanvas').style.visibility = "hidden";
        };
    }; // end Game.MainMenuState

    Game.GameState = function () {
        this.init = function (sm) {
            this.sm = sm;
            this.board = new Game.GameState.Board(10, 8);
            this.board.updateBoard();
        };

        this.update = function () {
            if (Game.keysdown[27]) {
                this.sm.enterPreviousState();
            }
            this.board.update();
        };

        this.render = function () {
            this.board.render();
        };

        this.restore = function () {
            this.board.updateBoard();
        };

        this.destroy = function () {
            get('gameboard').innerHTML = '<canvas id="gamecanvas"></canvas>';
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
            
            Game.renderImage(context, x, y, Game.images[Game.types.RECEPTOR], add(this.dir, dir), Game.tileSize);
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
                case Game.types.BLANK:
                    return 0;
                case Game.types.MIRROR:
                    return 1;
                case Game.types.POINTER:
                case Game.types.RECEPTOR:
                    return 3;
                default:
                    return 0;
            }
        };

        // init
        switch (this.type) {
            case Game.types.BLANK:
            case Game.types.MIRROR:
                this.init = function () {};
                break;
            case Game.types.POINTER:
                this.init = function () {
                    this.on = false;
                };
                break;
            case Game.types.RECEPTOR:
                this.init = function () {
                    this.receptors = [new Game.GameState.Receptor(Game.NORTH, Game.types.RED), null, new Game.GameState.Receptor(Game.NORTH, Game.types.RED), null];
                };
                break;
            default:
                this.init = function () {};
                break;
        }

        // click
        switch (this.type) {
            case Game.types.BLANK:
            case Game.types.MIRROR:
            case Game.types.RECEPTOR:
                this.click = function (event, down) {
                    if (!down) return; // for now we don't care about mouse releases FUTURE use mouse releases for something?
                    if (event.which === 3 || event.button === 2) {
                        // Rotate clockwise by default on right click
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (event.which === 1 || event.button === 0){ // left click
                        if (Game.levelEditMode) {
                            this.type += 1;
                            if (this.type > Game.types.RECEPTOR) this.type = 0;
                        }
                    }
                };
                break;
            case Game.types.POINTER:
                this.click = function (event, down) {
                    if (!down) return; // for now we don't care about mouse releases FUTURE use mouse releases for something?
                    if (event.which === 3 || event.button === 2) {
                        // Rotate clockwise by default on right click
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (event.which === 1 || event.button === 0) { // left click
                        if (Game.levelEditMode) {
                            this.type += 1;
                            if (this.type > Game.types.RECEPTOR) this.type = 0;
                        } else {
                            this.on = !this.on;
                            if (this.on === false) {
                                this.removeAllLasers();
                            } else {
                                if (this.lasers.length === 0) {
                                    this.lasers.push(new Game.GameState.Laser(null, Game.NORTH, Game.images.lasers[Game.types.RED]));
                                }
                            }
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
            case Game.types.BLANK:
            case Game.types.MIRROR:
            case Game.types.RECEPTOR:
            case Game.types.POINTER:
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
            case Game.types.BLANK:
            case Game.types.MIRROR:
            case Game.types.RECEPTOR:
                this.update = function () {};
                break;
            case Game.types.POINTER:
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

                        if (nextTile.type === Game.types.POINTER) { // !!!! Add all other opaque tiles here
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
            case Game.types.BLANK:
            case Game.types.MIRROR:
            case Game.types.POINTER:
                this.render = function (context, x, y) {
                    // Default render function
                    for (var i = 0; i < this.lasers.length; i++) {
                        this.lasers[i].render(context, this.type === Game.types.POINTER ? this.dir : 0, x, y);
                    }

                    var image = Game.images[this.type];

                    Game.renderImage(context, x, y, image, this.dir, Game.tileSize);
                };
                break;
            case Game.types.RECEPTOR:
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
                case Game.types.BLANK:
                    laser.exiting = opposite(laser.entering);
                    break;
                case Game.types.POINTER:
                    return; // pointers already have their own laser!! don't add another one!
                case Game.types.RECEPTOR:
                    break;
                case Game.types.MIRROR:
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

    Game.GameState.Board = function (w, h) {
        var str, i, y, x, bgimg, type, dir;
        this.w = w;
        this.h = h;
        this.tiles = [w * h];

        for (i = 0; i < w * h; i++) {
            this.tiles[i] =  new Game.GameState.Tile(i % w, Math.floor(i / w), Game.types.MIRROR, Game.NORTH);
            this.tiles[i].init();
        }
        
        // create div tags! (used only for handling input, all rendering is done with a canvas)
        // div tags only get created / recreated when loading a new level, they just know their x/y pos, not their type
        this.updateBoard = function () {
            str = "";
            get('gameboard').innerHTML = str; // clear any previous game board
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
//                        'style="background-image: url(\'' + bgimg + '\'); ' +
                        'style="top: ' + (y * Game.tileSize) + 'px; ' +
                        'left: ' + (x * Game.tileSize) + 'px;"></div>';
                }
                str += '</div>';
            }
            str += '<canvas id="gamecanvas" width="' + (w * Game.tileSize) + '" height="' + (h * Game.tileSize) + '"></canvas>';
            get('gameboard').innerHTML= str;

            get('gameboard').style.width = this.w * Game.tileSize;
            get('gameboard').style.height = this.h * Game.tileSize;
                // centering code:
            get('gameboard').style.left = "50%";
                get('gameboard').style.top = "50%";
                get('gameboard').style.marginLeft = -(this.w * Game.tileSize) / 2;
                get('gameboard').style.marginTop = -(this.h * Game.tileSize) / 2;
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
            if (!this.isEmpty()) {
                this.currentState().update();
            }
        };

        this.render = function () {
            if (!this.isEmpty()) {
                this.currentState().render();
            }
        };

        this.enterState = function (state) {
            this.currentState().hide();
            this.states.push(Game.StatesList[state]);
            this.currentState().init(this);
        };

        this.enterPreviousState = function () {
            if (!this.isEmpty()) {
                this.currentState().destroy();
                this.states.pop();
                this.currentState().restore();
                return true;
            }
            return false;
        };

        this.isEmpty = function () {
            return this.states.length === 0;
        };

        this.currentState = function () {
            var last = this.states.length - 1;
            return this.states[last];
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
        Game.sm.update();
    };

    Game.render = function () {
        Game.sm.render();
        var context = get('gamecanvas').getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, 50, 21);
        context.fillStyle = "white";
        context.font = "10px Consolas";
        if (Game.debug) context.fillText("debug", 2, 10);
        if (Game.levelEditMode) context.fillText("lvl edit", 2, 20);
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
    Game.keysdown[event.keyCode ? event.keyCode : event.which] = down;
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
    Game.init();
    Game.loop();
};
