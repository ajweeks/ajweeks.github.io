//  Copyright AJ Weeks 2015 Liqwidice Games
function get(what) {
    return document.getElementById(what);
}
var Game = (function () {
    function Game() {
    }
    Game.init = function () {
        Game.canvas = get('gameCanvas');
        Game.canvasSize = { w: Game.canvas.width, h: Game.canvas.height };
        Game.context = Game.canvas.getContext('2d');
        Game.board = new Board();
        Game.render();
    };
    Game.render = function () {
        Game.context.fillStyle = "white";
        Game.context.fillRect(0, 0, Game.canvasSize.w, Game.canvasSize.h);
        Board.render();
    };
    Game.mode = 'AI';
    Game.over = false;
    return Game;
})();
var Board = (function () {
    function Board() {
        Board.clear(Game.mode);
    }
    Board.prototype.hover = function (xx, yy) {
        if (Game.over)
            return;
        var bx = Math.floor((xx - 10) / (Board.tileSize * 3 + 10)), by = Math.floor((yy - 10) / (Board.tileSize * 3 + 10));
        bx = Board.clamp(bx, 0, 2);
        by = Board.clamp(by, 0, 2);
        var x = Math.floor((xx - 10 - (Board.tileSize * 3 + 10) * bx) / (Board.tileSize)), y = Math.floor((yy - 10 - (Board.tileSize * 3 + 10) * by) / (Board.tileSize));
        x = Board.clamp(x, 0, 2);
        y = Board.clamp(y, 0, 2);
        if (Board.tiles[bx + by * 3][x + y * 3] === '' && !Board.winStates[bx + by * 3]) {
            Board.hoverTile.bx = bx;
            Board.hoverTile.by = by;
            Board.hoverTile.x = x;
            Board.hoverTile.y = y;
        }
        else {
            Board.hoverTile.x = null;
            Board.hoverTile.y = null;
            Board.hoverTile.bx = null;
            Board.hoverTile.by = null;
        }
    };
    Board.click = function (event, xx, yy) {
        var type = clickType(event);
        if ((type === 'right' || type === 'left') && Board.hoverTile.x !== null && Board.hoverTile.y !== null) {
            var bxy = Board.hoverTile.bx + Board.hoverTile.by * 3, xy = Board.hoverTile.x + Board.hoverTile.y * 3;
            if (bxy === Board.playableArea || Board.playableArea === 10) {
                Board.setTile(bxy, xy, Board.playerTurn);
                Board.playableArea = xy;
                Board.checkForBoardWinners();
                if (Board.winStates[Board.playableArea] && Board.winStates[Board.playableArea] !== '')
                    Board.playableArea = 10;
                Board.hoverTile.x = null;
                Board.hoverTile.y = null;
                Board.hoverTile.bx = null;
                Board.hoverTile.by = null;
                if (Game.mode === 'AI') {
                    AI.makeMove(Board.playableArea);
                    if (Board.winStates[Board.playableArea] !== '')
                        Board.playableArea = 10;
                }
                else {
                    Board.playerTurn = Board.playerTurn === 'X' ? 'O' : 'X';
                }
            }
        }
    };
    Board.clamp = function (n, min, max) {
        return n >= min && n <= max ? n : null;
    };
    Board.checkForBoardWinners = function () {
        for (var b = 0; b < Board.tiles.length; b++) {
            Board.winStates[b] = Board.getBoardWinState(Board.tiles[b]);
        }
        Board.checkForGameWinners();
    };
    Board.checkForGameWinners = function () {
        var gamewinner = Board.getBoardWinState(Board.winStates);
        if (gamewinner && gamewinner !== '') {
            Game.over = true;
            Board.playableArea = -1;
            createPopup('gameover');
        }
    };
    Board.getBoardWinState = function (tiles) {
        if (tiles[0] && tiles[0] === tiles[1] && tiles[1] === tiles[2])
            return tiles[0];
        if (tiles[3] && tiles[3] === tiles[4] && tiles[4] === tiles[5])
            return tiles[3];
        if (tiles[6] && tiles[6] === tiles[7] && tiles[7] === tiles[8])
            return tiles[6];
        if (tiles[0] && tiles[0] === tiles[3] && tiles[3] === tiles[6])
            return tiles[0];
        if (tiles[1] && tiles[1] === tiles[4] && tiles[4] === tiles[7])
            return tiles[1];
        if (tiles[2] && tiles[2] === tiles[5] && tiles[5] === tiles[8])
            return tiles[2];
        if (tiles[0] && tiles[0] === tiles[4] && tiles[4] === tiles[8])
            return tiles[0];
        if (tiles[2] && tiles[2] === tiles[4] && tiles[4] === tiles[6])
            return tiles[2];
        return '';
    };
    Board.render = function () {
        Game.context.strokeStyle = "#222";
        Game.context.lineWidth = 3;
        Board.drawGrid(5, 5, Board.tileSize * 3 + 10);
        if (Board.playableArea === -1)
            ;
        else if (Board.playableArea === 10) {
            Game.context.strokeStyle = "#6D7";
            Game.context.lineWidth = 20;
            Game.context.lineJoin = 'round';
            Game.context.strokeRect(0, 0, (Board.tileSize * 3 + 10) * 3 + 10, (Board.tileSize * 3 + 10) * 3 + 10);
        }
        else {
            Game.context.strokeStyle = "#6D7";
            Game.context.lineWidth = 10;
            Game.context.lineJoin = 'round';
            Game.context.strokeRect((Board.playableArea % 3) * (Board.tileSize * 3 + 10) + 5, Math.floor(Board.playableArea / 3) * (Board.tileSize * 3 + 10) + 5, (Board.tileSize * 3 + 10), (Board.tileSize * 3 + 10));
        }
        for (var b = 0; b < Board.tiles.length; b++) {
            var boardOffset = {
                x: (b % 3) * (3 * Board.tileSize + 10) + 10,
                y: Math.floor(b / 3) * (3 * Board.tileSize + 10) + 10
            };
            if (Board.winStates[b] && Board.winStates[b] !== '') {
                Game.context.fillStyle = Board.winStates[b] === 'X' ? '#6C6' : '#E56';
                Game.context.fillRect(boardOffset.x, boardOffset.y, Board.tileSize * 3, Board.tileSize * 3);
                Game.context.font = '210px SourceSansPro-Regular';
                Game.context.fillStyle = Board.winStates[b] === 'X' ? '#7F7' : '#F67';
                Game.context.fillText(Board.winStates[b], boardOffset.x + (Board.winStates[b] === 'X' ? 30 : 16), boardOffset.y + 153);
            }
            Game.context.fillStyle = "black";
            Game.context.font = '60px SourceSansPro-ExtraLight';
            for (var x = 0; x < Board.tiles[b].length; x++) {
                var innerOffset = {
                    x: (x % 3) * Board.tileSize + boardOffset.x + (Board.tiles[b][x] === 'X' ? 15 : 9),
                    y: Math.floor(x / 3) * Board.tileSize + boardOffset.y
                };
                Game.context.fillText(Board.tiles[b][x], innerOffset.x - 1, innerOffset.y + 49);
            }
        }
        Game.context.strokeStyle = "#777";
        Game.context.lineWidth = 2;
        for (var i = 0; i < 9; i++) {
            var offset = {
                x: (i % 3) * (3 * Board.tileSize + 10) + 10,
                y: Math.floor(i / 3) * (3 * Board.tileSize + 10) + 10
            };
            Board.drawGrid(offset.x, offset.y, Board.tileSize);
        }
        if (Board.hoverTile.x !== null && Board.hoverTile.y !== null) {
            Game.context.fillStyle = "rgba(130, 100, 160, 0.2)";
            Game.context.fillRect(Board.hoverTile.x * Board.tileSize + 10 + (Board.tileSize * 3 + 10) * Board.hoverTile.bx, Board.hoverTile.y * Board.tileSize + 10 + (Board.tileSize * 3 + 10) * Board.hoverTile.by, Board.tileSize, Board.tileSize);
            Game.context.fillStyle = 'white';
            Game.context.fillText(Board.playerTurn, Board.hoverTile.x * Board.tileSize + 10 + (Board.tileSize * 3 + 10) * Board.hoverTile.bx + (Board.playerTurn === 'X' ? 15 : 9), Board.hoverTile.y * Board.tileSize + 10 + (Board.tileSize * 3 + 10) * Board.hoverTile.by + 49);
        }
    };
    Board.drawGrid = function (x, y, colw) {
        Game.context.beginPath();
        Game.context.moveTo(x, y + colw);
        Game.context.lineTo(x + 3 * colw, y + colw);
        Game.context.stroke();
        Game.context.moveTo(x, y + 2 * colw);
        Game.context.lineTo(x + 3 * colw, y + 2 * colw);
        Game.context.stroke();
        Game.context.moveTo(x + colw, y);
        Game.context.lineTo(x + colw, y + 3 * colw);
        Game.context.stroke();
        Game.context.moveTo(x + 2 * colw, y);
        Game.context.lineTo(x + 2 * colw, y + 3 * colw);
        Game.context.stroke();
        Game.context.closePath();
    };
    Board.setTile = function (board, position, player) {
        var tile = Board.tiles[board][position];
        if (tile !== 'X' && tile !== 'O') {
            Board.tiles[board][position] = player;
            return true;
        }
        return false;
    };
    Board.clear = function (mode) {
        Board.winStates = new Array(9);
        Board.tiles = new Array(9);
        for (var i = 0; i < Board.tiles.length; i++) {
            Board.tiles[i] = new Array(9);
            for (var j = 0; j < Board.tiles[i].length; j++) {
                Board.tiles[i][j] = '';
            }
        }
        Board.playableArea = 10;
        Game.over = false;
        Board.playerTurn = 'X';
        Game.mode = mode;
        Board.hoverTile.x = null;
        Board.hoverTile.y = null;
        Board.hoverTile.bx = null;
        Board.hoverTile.by = null;
    };
    Board.isFull = function () {
        for (var i = 0; i < Board.tiles.length; i++) {
            for (var j = 0; j < Board.tiles[i].length; j++) {
                if (Board.tiles[i][j] === '')
                    return false;
            }
        }
        return true;
    };
    Board.tileSize = 56;
    Board.hoverTile = { x: null, y: null, bx: null, by: null };
    Board.playerTurn = 'X';
    Board.playableArea = 10;
    return Board;
})();
var AI = (function () {
    function AI() {
    }
    AI.makeMove = function (playableArea) {
        window.setTimeout(AI.move, 500, playableArea);
    };
    AI.move = function (playableArea) {
        if (Board.isFull())
            Game.over = true;
        if (Game.over)
            return;
        var b, p;
        if (0) {
        }
        else {
            do {
                if (playableArea === 10)
                    b = Math.floor(Math.random() * 9);
                else
                    b = playableArea;
                p = Math.floor(Math.random() * 9);
            } while (!Board.setTile(b, p, 'O'));
        }
        Board.tiles[b][p] = 'O';
        Board.checkForBoardWinners();
        if (Board.winStates[p])
            Board.playableArea = 10;
        else
            Board.playableArea = p;
        Game.render();
    };
    return AI;
})();
function createPopup(type) {
    switch (type) {
        case 'newgame':
            var str = '<h2>New Game</h2>' +
                '<h4 style="margin-bottom: 5px; margin-top: 0">VS:</h4>' +
                '<div class="onoffswitch" style="margin-left: 75px; display: block; margin-bottom: 10px;">' +
                '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked>' +
                '<label class="onoffswitch-label" for="myonoffswitch">' +
                '<span class="onoffswitch-inner"></span>' +
                '<span class="onoffswitch-switch"></span>' +
                '</label></div>' +
                '<div style="height: 48px"><div class="button" onclick="Board.clear((get(\'myonoffswitch\').checked ? \'AI\' : \'PLAYER\')); clearPopup(); Game.render();">Confirm</div>' +
                '<div class="button" onclick="clearPopup()">Cancel</div></div>';
            showPopup(str);
            break;
        case 'rules':
            var str = '<h2>Rules</h2>' +
                '<span style="font-size: 24px"><p>Each turn you mark one of the small squares.<br />' +
                'When you get three in a row on a small board, you\'ve won that board.<br />' +
                'To win the game, you need to connect three small boards in a row.</p>' +
                '<p>However, You can not play on just any small board, whichever <em>square</em> your opponent picked last turn determines which <em>board</em> you must play in this turn.</p>' +
                '<img src="res/small_board.png" style="margin-right: 20px"></img><img src="res/large_board.png"></img>' +
                '<p>eg. Playing in the top-right <em>square</em> of a small board, forces your opponent to play in the top-right <em>board</em> on their turn.</p>' +
                '<p>What if you get sent to a board which has already been won?<br />Then you can play wherever you want!<br />' +
                'And what if a board ends with a tie? Then that board doesn\'t count for anyone.</p></span>' +
                '<div class="button" onclick="clearPopup();">Got it</div>';
            showPopup(str, 'width: 750px; margin-left: 50%; margin-top: -60px; left: -390px; top: 12%;');
            break;
        case 'gameover':
            var str = '<h2>Game Over!</h2>' +
                '<h4>Winner: ' + Board.playerTurn + '</h4>' +
                '<div class="button" onclick="clearPopup(); createPopup(\'newgame\');">New Game</div>' +
                '<div class="button" onclick="clearPopup();">Close</div>';
            showPopup(str);
            break;
    }
}
function showPopup(html, css) {
    if (css === void 0) { css = ''; }
    get('darken').style.display = 'initial';
    get('popup').style.cssText = css;
    get('popup').innerHTML = html + '<a class="popupClose" onclick="clearPopup()">X</a>';
    get('popup').style.display = 'initial';
}
function clearPopup() {
    get('darken').style.display = 'none';
    get('popup').innerHTML = '';
    get('popup').style.display = 'none';
}
function clickType(event) {
    if (event.which === 3 || event.button === 2)
        return "right";
    else if (event.which === 1 || event.button === 0)
        return "left";
    else if (event.which === 2 || event.button === 1)
        return "middle";
}
function boardHover(event) {
    if (Game.board) {
        Game.board.hover(event.offsetX, event.offsetY);
        Game.render();
    }
}
function boardClick(event) {
    Board.click(event, event.offsetX, event.offsetY);
    Game.render();
}
window.onload = function (event) {
    Game.init();
};
