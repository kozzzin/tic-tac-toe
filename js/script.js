// 2. AI
// refactor the code
// 3. ?? add animations
// 4. ?? change name
// 5. automatic choice for second player

"use strict";

const game = (function() {

})();


const gameboard = (function() {
    return {
        boardArray: [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ],

        clearBoard() {
            this.boardArray.forEach((e) => {
                e.forEach((_,index) => e[index] = 0);
            });
        },
    
        markers: {
            1: 'X',
            2: 'O'
        },

        getBoardContainer() {
            return document.querySelector('.gameboard-container');
        },
    
        buildBoard() {
            const boardContainer = this.getBoardContainer();
            boardContainer.innerHTML = '';
            gameboard.boardArray.forEach((e,row) => {
                e.forEach((e,column) => {
                    let boardSquare = document.createElement('span');
                    boardSquare.classList.add('marker-game');
                    boardSquare.setAttribute('data-row',`${row}`);
                    boardSquare.setAttribute('data-column',`${column}`);
                    boardSquare.setAttribute('onClick','events.squareClick(event)');
                    boardContainer.appendChild(boardSquare);
                })
            });
        },
    }
})();


function newPlayer(name, marker) {
    return {
        name: name,
        marker: marker,
        score:0
    }
}

const gameLogic = (function() {
    return {
        checkEnd() {
            // prepare diagonals and verticals
            const board = gameboard.boardArray;
            const diagonalOne = board[0].map((_, index) => board[index][index]);
            const diagonalTwo = board[0].map((_, index) => board[index][Math.abs(2-index)]);
            const transposedBoard = tranposeArray(board);

            const that = this;
    
            // transposing array to check vierticals in simple loop
            function tranposeArray(array) {
                const transposedArray = array[0].map((_,colIndex) => {
                    return array.map(row => row[colIndex]);
                });
                return transposedArray;
            }
          
            function checker(lines) {
                lines.forEach(line => {
                    if (line.every(el => el == 1) || line.every(el => el == 2)) {
                        const winner = this.chooseWinner(line[0]);
                        console.log('player ' + (winner) + ' is winner');
                        gameFlow.gameActive = false;
                        gameInterface.showResult(winner);
                        const scoreResult = `${gameFlow.players[0].score}:${gameFlow.players[1].score}`;
                        document.querySelector('.score').innerHTML = scoreResult;
                    }
                })
            }
    
            // in case of tie, we count players turns
            if (gameFlow.turns >= 9) {
                gameFlow.gameActive = false;
                gameInterface.activePlayer();
                gameInterface.showResult("it's a tie");
            }
    
            // checking rows & diagonals
            checker.call(this,board.concat([diagonalOne],[diagonalTwo],transposedBoard));  
        },
    
        chooseWinner(marker) {
            gameInterface.activePlayer();
            const winner = gameFlow.players.filter((e) => e.marker == marker)[0];
            const name = winner.name;
            winner.score += 1;
            return name;
        },
    
    }
})();


const gameFlow = (function() {
    return {
        /*
        -- render interface
        -- choose play vs player or vs AI
        -- choose marker
        -- who goes first
        -- show new button: continue or new game
        */

        newGame() {
            events.docReady();
        },

        players: [],

        addPLayer(player) {
            this.players.push(player);
        },

        turn(val=0) {
            this.lastTurn = val == 0 ? 1 : 0;
            return this.lastTurn;
        },

        nextTurn(row,column) {
            let turn = this.turn(this.lastTurn);
            this.currentMarker = this.players[turn].marker;
            this.putMarker(this.currentMarker, row, column);
            this.turns += 1;
            gameLogic.checkEnd();
        },

        putMarker(marker, row, column) {
            gameboard.boardArray[row][column] = marker;
        },

        lastTurn: 1,

        currentMarker: 0,

        turns: 0,

        gameActive: true,

        restartGame() {
            gameboard.clearBoard();
            gameboard.buildBoard();
            gameFlow.turns = 0;
            gameFlow.gameActive = true;
            gameInterface.activePlayer();
            gameInterface.showResult();
        }
        
    }
})();

const events = {
    squareClick(e) {
        if (gameFlow.gameActive) {
            // read properties of event
            const target = e.target;
            const row = target.getAttribute(['data-row']);
            const column = target.getAttribute(['data-column']);
            
            // making next turn and rendering result
            gameFlow.nextTurn(row, column);
            gameInterface.renderMarker(target,gameFlow.currentMarker);

            // disabling square to avoid double click or rewriting marker
            target.removeAttribute('onClick');

            // highlight current player
            gameInterface.activePlayer();        
        }
    },
 

    docReady() {
        const whenDocReady = this;
        document.addEventListener('DOMContentLoaded', function(e) {
            gameboard.buildBoard();
        
            document.querySelectorAll('.marker').forEach((e) => {
                e.addEventListener('click', whenDocReady.initialMarkerChoice);
            });
        
            whenDocReady.onClick('.start',gameInterface.showGameBoard);
            whenDocReady.onClick('#restart',gameFlow.restartGame);
            whenDocReady.onClick('#end-game',function(){location.reload()});    
        });

    },

    onClick(target,handler) {
        document.querySelector(target).addEventListener('click',handler);
    },

    initialMarkerChoice(e) {
            e.stopPropagation();
            const target = e.target;
            const player = target.getAttribute('data-player');
            const marker = target.getAttribute('data-marker');
               
            gameInterface.chooseMarker(target,player,marker);
            gameFlow.addPLayer(newPlayer(player,marker));
            gameInterface.showStartButton();
        }
}

const gameInterface = {

    init() {

    },

    toggleClass(target, className) {
        document.querySelector(target).classList.toggle(className);
    },

    showGameBoard() {
        // toggle classes
        [
            {target: '.new-game', class: 'hide'},
            {target: '.gameboard-container', class: 'hide'},
            {target: '#restart', class: 'hide'},
            {target: '#end-game', class: 'hide'},
            {target: '.score-container', class: 'hide'},
        ].forEach(toggle => gameInterface.toggleClass(toggle.target,toggle.class));
    
        // clear event listener
        document.querySelector('.start').removeEventListener('click',this.showGameBoard);
    
        // small markers near score
        document.querySelectorAll('.score-marker').forEach((el) => {
            const marker = gameFlow.players[el.getAttribute('data-player')-1].marker;
            el.innerHTML = gameboard.markers[marker];
        })
    
        gameInterface.activePlayer();
    },
    

    activePlayer() {
        document.querySelectorAll('.score-player').forEach((el) => {
            if (el.getAttribute('data-player') != gameFlow.lastTurn + 1) {
                el.classList.toggle('selected');

            } else {
                if (el.classList.contains('selected')) {
                    el.classList.toggle('selected');
                }
            }
        });
    },

    renderMarker(target,marker) {
        target.innerHTML = gameboard.markers[marker];

    },

    chooseMarker(target,player,marker) {
        const anotherPlayer = player == 1 ? 2 : 1;

        // select marker, highlight marker in hreen
        target.classList.add('selected');
        
        // disable not chosen marker for player 1
        document.querySelectorAll(`[data-player]`)
            .forEach((e) => {
                const playerAttribute = e.getAttribute('data-player');
                if (playerAttribute == player) {
                    if (!e.classList.contains('selected')) {
                        e.classList.add('disabled');
                    }
                    e.removeEventListener('click',this.chooseMarker);
                } else if (playerAttribute == anotherPlayer) {
                    if (e.getAttribute('data-marker') == marker) {
                        e.classList.add('disabled');
                        e.removeEventListener('click',this.chooseMarker);
                    }   
                }
            });
    },

    showStartButton() {
        // if have 2 players, show button new game 
        if (gameFlow.players.length >= 2) {
            this.toggleClass('.start','hide');
            document.querySelectorAll('.marker').forEach((e) => {
                e.removeEventListener('click', this.chooseMarker);
            });
        };
    },

    showResult(winner) {
        if  (winner == undefined) {
            winner = '';
        } else if (winner != "it's a tie") {
            winner = `Player ${winner} won`;
        } 
        document.querySelector('.result').innerHTML = winner;
        this.toggleClass('.score-container','hide');
        this.toggleClass('.result','hide');
    }
}

gameFlow.newGame();