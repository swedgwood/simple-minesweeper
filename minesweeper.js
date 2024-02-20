const CELL_STATE = {
    NONE: "none",
    CLEARED: "cleared",
    FLAGGED: "flagged"
}

const GAME_STATE = {
    IN_PROGRESS: "in progress",
    LOST: "lost",
    WON: "won"
}

const MOUSE_BUTTON = {
    LEFT: "left",
    RIGHT: "right"
}

class Sprite {
    constructor(image, x, y, w, h) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Game {
    constructor(canvasElement, scale, spritesheet) {
        this.BORDER_SIDE = 8;
        this.BORDER_TOP = 24;
        this.BORDER_BOTTOM = 8;
        this.CELL_SIDE = 16;
        this.sprite = {
            border: {
                topleft: new Sprite(spritesheet, 64, 16, 8, 24),
                top: new Sprite(spritesheet, 72, 16, 8, 24),
                topright: new Sprite(spritesheet, 80, 16, 8, 24),
                side: new Sprite(spritesheet, 88, 16, 8, 8),
                bottomleft: new Sprite(spritesheet, 88, 32, 8, 8),
                bottom: new Sprite(spritesheet, 88, 24, 8, 8),
                bottomright: new Sprite(spritesheet, 88, 40, 8, 8)
            },
            cell: new Sprite(spritesheet, 64, 0, 16, 16),
            empty: new Sprite(spritesheet, 80, 0, 16, 16),
            icon: {
                mine_count: [
                    new Sprite(spritesheet, 0, 0, 16, 16), // 1
                    new Sprite(spritesheet, 16, 0, 16, 16), // 2
                    new Sprite(spritesheet, 0, 16, 16, 16), // 3
                    new Sprite(spritesheet, 16, 16, 16, 16), // 4
                    new Sprite(spritesheet, 0, 32, 16, 16), // 5
                    new Sprite(spritesheet, 16, 32, 16, 16), // 6
                    new Sprite(spritesheet, 0, 48, 16, 16), // 7
                    new Sprite(spritesheet, 16, 48, 16, 16), // 8
                ],
                wrong_mine: new Sprite(spritesheet, 32, 16, 16, 16),
                happy_mine: new Sprite(spritesheet, 32, 32, 16, 16),
                sad_mine: new Sprite(spritesheet, 32, 48, 16, 16),
                flag: new Sprite(spritesheet, 32, 0, 16, 16),
                happy_face: new Sprite(spritesheet, 48, 0, 16, 16),
                sad_face: new Sprite(spritesheet, 48, 16, 16, 16),
                cool_face: new Sprite(spritesheet, 48, 32, 16, 16),
                cog: new Sprite(spritesheet, 48, 48, 16, 16),
            },
            digits: {
                leftSegment: new Sprite(spritesheet, 64, 40, 3, 7),
                rightSegement: new Sprite(spritesheet, 74, 40, 3, 7),
                topSegment: new Sprite(spritesheet, 67, 40, 7, 3),
                bottomSegment: new Sprite(spritesheet, 67, 44, 7, 3),
                middleSegment: new Sprite(spritesheet, 68, 40, 5, 2),
                digitDisplay: new Sprite(spritesheet, 64, 48, 29, 16)
            }
        }
        this.element = canvasElement;
        let theGame = this;
        this.element.onclick = function(e) {
            theGame.onClick(e.clientX, e.clientY, MOUSE_BUTTON.LEFT, theGame);
        };
        this.element.oncontextmenu = function(e) {
            theGame.onClick(e.clientX, e.clientY, MOUSE_BUTTON.RIGHT, theGame);
            return false;
        }
        this.scale = scale;
        this.nextBoardWidth = 30;
        this.nextBoardHeight = 16;
        this.nextMines = 99;                    
        this.round = new Round(
            this.nextBoardWidth,
            this.nextBoardHeight,
            this.nextMines
        );
        this.start_time = performance.now();
        this.initCanvas();
        this.drawGame();
        this.new_game = true;
    }
    initCanvas() {
        this.element.width = this.scale*(this.BORDER_SIDE*2 + this.CELL_SIDE*this.round.width);
        this.element.height = this.scale*(this.BORDER_TOP + this.BORDER_BOTTOM + this.CELL_SIDE*this.round.height);
        this.boardTopLeft = {
            x: this.BORDER_SIDE,
            y: this.BORDER_TOP
        };
        this.boardBottomRight = {
            x: this.boardTopLeft.x + this.CELL_SIDE*this.round.width,
            y: this.boardTopLeft.y + this.CELL_SIDE*this.round.height
        };
        this.startButtonTopLeft = {
            x: this.BORDER_SIDE + (this.CELL_SIDE*this.round.width - this.CELL_SIDE)/2,
            y: (this.BORDER_TOP - this.CELL_SIDE)/2
        };
        this.startButtonBottomRight = {
            x: this.startButtonTopLeft.x + this.CELL_SIDE,
            y: this.startButtonTopLeft.y + this.CELL_SIDE
        };
        this.ctx = this.element.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
    }
    onClick(clientX, clientY, button, theGame) {
        const rect = theGame.element.getBoundingClientRect();
        let x = (clientX - rect.left)/this.scale;
        let y = (clientY - rect.top)/this.scale;

        if (x > this.boardTopLeft.x && x < this.boardBottomRight.x &&
            y > this.boardTopLeft.y && y < this.boardBottomRight.y) {
            let cellX = Math.floor((x - this.BORDER_SIDE)/this.CELL_SIDE);
            let cellY = Math.floor((y - this.BORDER_TOP)/this.CELL_SIDE);
            if (theGame.round.gameState == GAME_STATE.IN_PROGRESS) {
                if (button == MOUSE_BUTTON.LEFT) {
                    if (theGame.new_game) {
                        while (theGame.round.board[cellY][cellX].mine || theGame.round.board[cellY][cellX].adjacent_mines > 0) {
                            theGame.round = new Round(theGame.nextBoardWidth, theGame.nextBoardHeight, theGame.nextMines);

                        }
                        theGame.new_game = false;
                        theGame.start_time = performance.now();
                        theGame.updateTime();
                    }
                    theGame.round.clearCell(cellX, cellY);
                } else if (button == MOUSE_BUTTON.RIGHT) {
                    theGame.round.flagCell(cellX, cellY);
                }
            }
        } else if (x > this.startButtonTopLeft.x && x < this.startButtonBottomRight.x &&
                   y > this.startButtonTopLeft.y && y < this.startButtonBottomRight.y) {
            theGame.round = new Round(this.nextBoardWidth, this.nextBoardHeight, this.nextMines);
            theGame.new_game = true;
            theGame.start_time = performance.now();
            theGame.initCanvas();
            theGame.drawGame();
        }
    
        theGame.checkGameState();
        theGame.drawGame();
    }
    checkGameState() {
        let won = true;
        for (let x=0; x<this.round.width; x++) {
            for (let y=0; y<this.round.height; y++) {
                if (this.round.board[y][x].state != CELL_STATE.CLEARED && !this.round.board[y][x].mine) {
                    won = false;
                } else if (this.round.board[y][x].state == CELL_STATE.CLEARED && this.round.board[y][x].mine) {
                    this.round.gameState = GAME_STATE.LOST;
                    return;
                }
            }
        }
        if (won) {
            this.round.gameState = GAME_STATE.WON;
        }
    }
    drawImage(sprite, x, y, w, h) {
        w = w || sprite.w;
        h = h || sprite.h;
        this.ctx.drawImage(sprite.image,
            sprite.x, sprite.y, sprite.w, sprite.h,
            x*this.scale, y*this.scale, w*this.scale, h*this.scale);
    }
    drawImageOnBoard(sprite, x, y, w, h) {
        this.drawImage(sprite, x*this.CELL_SIDE + this.BORDER_SIDE, y*this.CELL_SIDE + this.BORDER_TOP, w, h);
    }
    drawDigits(num, x, y) {
        this.drawImage(this.sprite.digits.digitDisplay, x, y);
        this.drawDigit(Math.floor(num/100), x, y);
        num %= 100;
        this.drawDigit(Math.floor(num/10), x+10, y);
        num %= 10;
        this.drawDigit(num, x+20, y);
    }
    drawDigit(num, x, y) {
        if ([0, 2, 3, 5, 6, 7, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.topSegment, x+1, y);
        } if ([0, 4, 5, 6, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.leftSegment, x, y+1);
        } if ([0, 1, 2, 3, 4, 7, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.rightSegement, x+6, y+1);
        } if ([2, 3, 4, 5, 6, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.middleSegment, x+2, y+7); 
        } if ([0, 2, 6, 8].includes(num)) {
            this.drawImage(this.sprite.digits.leftSegment, x, y+8);
        } if ([0, 1, 3, 4, 5, 6, 7, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.rightSegement, x+6, y+8); 
        } if ([0, 2, 3, 5, 6, 8, 9].includes(num)) {
            this.drawImage(this.sprite.digits.bottomSegment, x+1, y+13);
        }
    }
    drawTime() {
        this.drawDigits(Math.min(999, Math.floor((performance.now()-this.start_time)/1000)),
        this.BORDER_SIDE*2+this.CELL_SIDE*this.round.width -(this.BORDER_TOP-this.CELL_SIDE)/2-29,
        (this.BORDER_TOP-this.CELL_SIDE)/2);
    }
    drawBorder() {
        this.drawImage(this.sprite.border.topleft, 0, 0);
        this.drawImage(this.sprite.border.topright, this.BORDER_SIDE + this.CELL_SIDE*this.round.width, 0);
        this.drawImage(this.sprite.border.bottomleft, 0, this.BORDER_TOP + this.CELL_SIDE*this.round.height);
        this.drawImage(this.sprite.border.bottomright, this.BORDER_SIDE + this.CELL_SIDE*this.round.width, this.BORDER_TOP + this.CELL_SIDE*this.round.height);
        this.drawImage(this.sprite.border.top, 
            this.BORDER_SIDE, 0, 
            this.CELL_SIDE*this.round.width, this.BORDER_TOP
        );
        this.drawImage(this.sprite.border.bottom,
            this.BORDER_SIDE, this.BORDER_TOP + this.CELL_SIDE*this.round.height,
            this.CELL_SIDE*this.round.width, this.BORDER_BOTTOM
        );
        this.drawImage(this.sprite.border.side,
            0, this.BORDER_TOP,
            this.BORDER_SIDE, this.CELL_SIDE*this.round.height
        );
        this.drawImage(this.sprite.border.side,
            this.BORDER_SIDE + this.CELL_SIDE*this.round.width, this.BORDER_TOP,
            this.BORDER_SIDE, this.CELL_SIDE*this.round.height
        );
    }
    drawBoard() {
        for (let y = 0; y < this.round.height; y++) {
            for (let x = 0; x < this.round.width; x++) {
                if (this.round.board[y][x].state != CELL_STATE.CLEARED) {
                    this.drawImageOnBoard(this.sprite.cell, x, y);
                } else {
                    this.drawImageOnBoard(this.sprite.empty, x, y);
                    if (this.round.board[y][x].adjacent_mines > 0) {
                        this.drawImageOnBoard(this.sprite.icon.mine_count[this.round.board[y][x].adjacent_mines - 1], x, y);
                    }
                }

                if (this.round.gameState == GAME_STATE.IN_PROGRESS) {
                    if (this.round.board[y][x].state == CELL_STATE.FLAGGED) {
                        this.drawImageOnBoard(this.sprite.icon.flag, x, y);
                    }
                } else if (this.round.gameState == GAME_STATE.WON) {
                    if (this.round.board[y][x].mine) {
                        this.drawImageOnBoard(this.sprite.icon.happy_mine, x, y);
                    }
                } else if (this.round.gameState == GAME_STATE.LOST) {
                    if (this.round.board[y][x].mine) {
                        this.drawImageOnBoard(this.sprite.icon.sad_mine, x, y);
                    } else if (this.round.board[y][x].state == CELL_STATE.FLAGGED) {
                        this.drawImageOnBoard(this.sprite.icon.wrong_mine, x, y);
                    }
                }
            }
        }
    }
    drawGame(){
        this.drawBorder();
        this.drawBoard();
        this.drawImage(this.sprite.cell,
            this.startButtonTopLeft.x, this.startButtonTopLeft.y);
        if (this.round.gameState == GAME_STATE.IN_PROGRESS) {
            this.drawImage(this.sprite.icon.happy_face,
                this.startButtonTopLeft.x, this.startButtonTopLeft.y);
        } else if (this.round.gameState == GAME_STATE.WON) {
            this.drawImage(this.sprite.icon.cool_face,
                this.startButtonTopLeft.x, this.startButtonTopLeft.y);
        } else {
            this.drawImage(this.sprite.icon.sad_face,
                this.startButtonTopLeft.x, this.startButtonTopLeft.y);
        }

        this.drawDigits(this.round.getRemainingMines(),
            (this.BORDER_TOP-this.CELL_SIDE)/2, (this.BORDER_TOP-this.CELL_SIDE)/2);

        this.drawTime();
    }
    updateTime() {
        this.drawTime();
        if (!this.new_game && this.round.gameState == GAME_STATE.IN_PROGRESS) {
            let theGame = this;
            setTimeout(function(){theGame.updateTime()}, 200);
        }
    }
}

class Round {
    constructor(width, height, mines) {
        this.width = width;
        this.height = height;
        this.board = this.createBoard(mines);
        this.gameState = GAME_STATE.IN_PROGRESS
    }
    createBoard(mines) {
        let board = [];
        for (let i = 0; i < this.height; i++) {
            let row = [];
            for (let col = 0; col < this.width; col++) {
                row.push({
                    state: CELL_STATE.NONE,
                    mine: false,
                    adjacent_mines: 0
                });
            }
            board.push(row);
        }
    
        let mines_left = mines;
        while (mines_left > 0) {
            let x = Math.floor(Math.random()*this.width)
            let y = Math.floor(Math.random()*this.height)
    
            if (!board[y][x].mine) {
                board[y][x].mine = true;
                if (y > 0 && x > 0) { // top left
                    board[y-1][x-1].adjacent_mines += 1;
                }
                if (y > 0) { // top
                    board[y-1][x].adjacent_mines += 1;
                }
                if (y > 0 && x < this.width - 1) { // top right
                    board[y-1][x+1].adjacent_mines += 1;
                }
                if (x < this.width - 1) { // right
                    board[y][x+1].adjacent_mines += 1;
                }
                if (y < this.height - 1 && x < this.width - 1) { // bottom right
                    board[y+1][x+1].adjacent_mines += 1;
                }
                if (y < this.height - 1) { // bottom
                    board[y+1][x].adjacent_mines += 1;
                }
                if (y < this.height - 1 && x > 0) { // bottom left
                    board[y+1][x-1].adjacent_mines += 1;
                }
                if (x > 0) { // left
                    board[y][x-1].adjacent_mines += 1;
                }
                mines_left -= 1;
            }
        }
        return board;
    }
    exists(x, y) {
        return this.board[y] && this.board[y][x] != undefined;
    }
    getRemainingMines() {
        let mines = 0;
        let flags = 0;
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                if (this.board[y][x].mine) {
                    mines += 1;
                } if (this.board[y][x].state == CELL_STATE.FLAGGED) {
                    flags += 1;
                }
            }
        }
        return Math.max(0, mines-flags);
    }
    clearCell(x, y, firstCall=true) {
        if (this.exists(x, y)) {
            if (this.board[y][x].state == CELL_STATE.NONE) {
                this.board[y][x].state = CELL_STATE.CLEARED;
                if (this.board[y][x].adjacent_mines == 0 && !this.board[y][x].mine) {
                    this.clearAdjacent(x, y, false);
                }
            } else if (firstCall && this.board[y][x].state == CELL_STATE.CLEARED) {
                let flags = this.countAdjacentFlags(x, y);
                if (this.board[y][x].adjacent_mines == flags) {
                    this.clearAdjacent(x, y, false);
                }
            }
        }
    }
    clearAdjacent(x, y, firstCall=true) {
        this.clearCell(x-1, y-1, firstCall);
        this.clearCell(x, y-1, firstCall);
        this.clearCell(x+1, y-1, firstCall);
        this.clearCell(x+1, y, firstCall);
        this.clearCell(x+1, y+1, firstCall);
        this.clearCell(x, y+1, firstCall);
        this.clearCell(x-1, y+1, firstCall);
        this.clearCell(x-1, y, firstCall);
    }
    countAdjacentFlags(x, y) {
        let flags = 0;
        for (let xo=-1; xo<=1; xo++) {
            for (let yo=-1; yo<=1; yo++) {
                if (!(xo==0 && yo==0) && this.exists(x+xo, y+yo) && this.board[y+yo][x+xo].state == CELL_STATE.FLAGGED) {
                    flags += 1
                }
            }
        }
        return flags
    }
    flagCell(x, y) {
        if (this.board[y][x].state != CELL_STATE.CLEARED)  {
            if (this.board[y][x].state == CELL_STATE.NONE) {
                this.board[y][x].state = CELL_STATE.FLAGGED
            } else {
                this.board[y][x].state = CELL_STATE.NONE
            }
        }
    }
}

let spritesheet = new Image();
spritesheet.src = "spritesheet.png";
let curGame
spritesheet.onload = function() {
    curGame = new Game(
        document.getElementById("game"), 2, spritesheet
    );
}

