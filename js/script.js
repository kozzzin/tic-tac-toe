// refactor the code
// 3. ?? add animations // 6. animate lines
// 4. ?? change name
// 

// ideas to refactor code
/*
basic logic works without interface,
you could choose your marker,
decide who's turn is first,
how the computer responds and so on

than w have render / visual level, where we render out board from array

and than gameflow object to join 2 layers
*/

"use strict";


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
            1: 'x',
            2: 'o'
        },

        getBoardContainer() {
            return document.querySelector('.gameboard-container');
        },
    
        buildBoard() {
            const boardContainer = document.querySelector('.gameboard-container');
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


const AI = (function() {
    return {
        evaluate(inputBoard) {
            const playerAI = gameFlow.players.find(el => el.mode == 'ai');
            const opponent = gameFlow.players.find(el => el.mode != 'ai');

            const aiMarker = playerAI.marker;
            const opponentMarker = opponent.marker;

            const winner = gameLogic.endGame(inputBoard);

            if (winner == aiMarker) {
                return 10;
            } else if (winner == opponentMarker) {
                return -10;
            } else if (winner == 'tie') {
                return 0;
            } else {
                return false;
            }
        },

        miniMax(inputBoard,depth,isMax) {
            const score = this.evaluate(inputBoard);

            const playerAI = gameFlow.players.find(el => el.mode == 'ai');
            const opponent = gameFlow.players.find(el => el.mode != 'ai');

            const aiMarker = playerAI.marker;
            const opponentMarker = opponent.marker;

            if (score !== false) {
                return score;
            } else {
                if (isMax) {
                    let best = -Infinity;

                    for (let row = 0; row < 3; row++) {
                        for(let col = 0; col < 3; col++) {
                            if (inputBoard[row][col] == 0) {

                                inputBoard[row][col] = aiMarker;

                                best = Math.max(best,this.miniMax(gameboard.boardArray,depth+1,!isMax)) - depth;

                                // console.log(gameboard.boardArray);

                                inputBoard[row][col] = 0;
                            } 
                        }
                    }

                    return best;

                } else if (!isMax) {

                    let best = Infinity;

                    for (let row = 0; row < 3; row++) {
                        for(let col = 0; col < 3; col++) {
                            if (inputBoard[row][col] == 0) {

                                inputBoard[row][col] = opponentMarker;

                                best = Math.min(best,this.miniMax(inputBoard,depth+1,!isMax)) + depth;

                                inputBoard[row][col] = 0;
                            } 
                        }
                    }

                    return best;

                }
            }
        },

        findBestMove(inputBoard) {
            let bestVal = -Infinity;
            let bestMove = [-1,-1];

            const playerAI = gameFlow.players.find(el => el.mode == 'ai');
            const aiMarker = playerAI.marker;

            for (let row = 0; row < 3; row++) {
                for(let col = 0; col < 3; col++) {
                    if (inputBoard[row][col] == 0) {
                        inputBoard[row][col] = aiMarker;

                        let moveVal = this.miniMax(inputBoard,0,false);

                        inputBoard[row][col] = 0;

                        if (moveVal > bestVal) {
                            bestVal = moveVal;
                            bestMove = [row,col];
                        }
                    }
                }
            }

            return bestMove;

        },

        activate(init=false) {
            const anotherPlayer = gameFlow.players[gameFlow.lastTurn].name == 1 ? 1 : 0;
        
            const playerMode = gameFlow.players[anotherPlayer].mode;
        
            let row, column, nextMove;
            
            if (playerMode == 'ai' && gameFlow.gameActive) {
                const choices = [];
                gameboard.boardArray.forEach((_,row) => {
                    _.forEach((el,column) => {
                        if (el == 0) {
                            choices.push({row,column});
                        }
                    });
                });
        
                if (init==true) {
                    const randomChoice = Math.floor(Math.random() * choices.length);
                    nextMove = choices[randomChoice];
                    row = nextMove.row;
                    column = nextMove.column;
                } else {
                    nextMove = AI.findBestMove(gameboard.boardArray);
                    row = nextMove[0];
                    column = nextMove[1];
                }
        
        
                const target = document.querySelector(`[data-row="${row}"][data-column="${column}"]`);
        
                // making next turn and rendering result
                gameFlow.nextTurn(row, column);
        
                gameInterface.renderMarker(target,gameFlow.currentMarker);
        
                // disabling square to avoid double click or rewriting marker
                target.removeAttribute('onClick');
        
                // highlight current player
                gameInterface.activePlayer();
            }
        }
    }
})();


const gameLogic = (function() {
    return {
        getLines(inputBoard=gameboard.boardArray) {
            // can replace with fixed solution for diagonals and simple loop for columns like 
            // prepare diagonals and verticals
            const board = inputBoard;
            const diagonalOne = board[0].map((_, index) => board[index][index]);
            const diagonalTwo = board[0].map((_, index) => board[index][Math.abs(2 - index)]);
            const transposedBoard = tranposeArray(board);

            // transposing array to check vierticals in simple loop
            function tranposeArray(array) {
                const transposedArray = array[0].map((_, colIndex) => {
                    return array.map(row => row[colIndex]);
                });
                return transposedArray;
            }

            return board.concat([diagonalOne], [diagonalTwo], transposedBoard);
        },

        possibleChoices(inputBoard) {
            const choices = [];
            inputBoard.forEach((_,row) => {
                _.forEach((el,column) => {
                    if (el == 0) {
                        choices.push({row,column});
                    }
                });
            });
            if (choices.length == 0) {
                return 0;
            } else {
                return choices;
            }
        },

        endGame(inputBoard=gameboard.boardArray) {
            const lines = gameLogic.getLines(inputBoard);
            let marker = false;
            if (this.possibleChoices(inputBoard) == 0) {
                marker = 'tie';
            };

            lines.forEach(
                (line) => {
                    if (line.every(el => el == '1') || line.every(el => el == '2')) {
                        marker = line[0];
                    }
                }
            )
            
            return marker;
        },
    
        chooseWinner(marker) {
            const winner = gameFlow.players.filter((e) => e.marker == marker)[0];
            const name = winner.name;
            winner.score += 1;
            return name;
        },
    
    }
})();


const gameFlow = (function() {
    return {
        players: [],

        // gameMode: 'player',
        lastTurn: 1,
        whoStarts: 0,
        currentMarker: 0,
        turns: 0,
        gameActive: true,

        newGame() {
            events.docReady();
        },

        newPlayer(name, marker, mode) {
            return {
                name: name,
                marker: marker,
                mode: mode,
                score:0
            }
        },

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
            /// !!!!!!!
            if (gameLogic.endGame()) {
                const marker = gameLogic.endGame();
                let winner;
                if (marker == 'tie') {
                    gameInterface.showResult("it's a tie");
                } else {
                    winner = gameLogic.chooseWinner(gameLogic.endGame());
                    console.log('player ' + (winner) + ' is winner');
                    gameInterface.showResult(winner);
                }
                
                gameFlow.gameActive = false;
                const scoreResult = `${gameFlow.players[0].score}:${gameFlow.players[1].score}`;
                document.querySelector('.score').innerHTML = scoreResult;
                

                gameInterface.renderResult();

            }
        },

        putMarker(marker, row, column) {
            gameboard.boardArray[row][column] = marker;
        },

        restartGame() {
            gameFlow.whoStarts = gameFlow.whoStarts == 0 ? 1 : 0;
            // gameInterface.activePlayer();
            gameFlow.lastTurn = gameFlow.whoStarts != gameFlow.lastTurn ? gameFlow.lastTurn : gameFlow.turn(gameFlow.lastTurn);

            gameboard.clearBoard();
            gameboard.buildBoard();
            gameFlow.turns = 0;
            gameFlow.gameActive = true;
            // gameInterface.activePlayer();
            // gameInterface.activePlayer();
            gameInterface.showResult();

            //
            
            //

            gameInterface.activePlayer();

            const previousPlayerIndex = gameFlow.lastTurn;
            const playerIndex = previousPlayerIndex == 0 ? 1 : 0;

            if (gameFlow.players[previousPlayerIndex].mode != 'ai'
                && gameFlow.players[playerIndex].mode == 'ai'
            ) {
                
                AI.activate(true);
                
            } 
            // AI.activate();

        }
        
    }
})();

const events = {
    squareClick(e, ai) {
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

            AI.activate();

        }
    },
 
    docReady() {
        const event = this;
        document.addEventListener('DOMContentLoaded', function(e) {
            gameboard.buildBoard();
        
            document.querySelectorAll('.marker').forEach((e) => {
                e.addEventListener('click', event.initialMarkerChoice);
            });
        
            event.onClick('.start',event.startClicked);
            event.onClick('#restart',gameFlow.restartGame);
            event.onClick('#end-game',function(){location.reload()}); 
            

            // choose game mode
            const modesNode = document.querySelectorAll('.game-mode');

            modesNode.forEach((el) => {
                el.addEventListener('click', function(e) {
                    const mode = el.getAttribute('data-mode');
                    const player = e.target.getAttribute('data-player');
                    modesNode.forEach((el) => {
                        if (el.getAttribute('data-player') == player) {
                            el.classList.toggle('selected');
                        }
                        
                    });
                    gameFlow.gameMode = mode;
                });
            });

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
            
            gameInterface.showStartButton();
    },

    startClicked() {
        const player = document.querySelector('.player-container');
        let playerName = player.getAttribute('data-player');
        let mode = player.querySelector('.game-mode.selected').getAttribute('data-mode');
        let marker = player.querySelector('.player-choice .selected').getAttribute('data-marker');

        gameFlow.addPLayer(gameFlow.newPlayer(playerName,marker,mode));

        console.log(
            'player name: ', playerName,
            'mode: ', mode,
            'marker: ', marker,
            );

        // add opponent
        playerName = '2';
        mode = document.querySelector('.mode-choice.opponent .selected').getAttribute('data-mode');
        marker = marker == '2' ? '1' : '2';

        gameFlow.addPLayer(gameFlow.newPlayer(playerName,marker,mode));


        gameInterface.showGameBoard();
    }
}

const gameInterface = {

    init() {

    },

    renderResult() {
        //
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
            const player = gameFlow.players.find(e => e.name === el.getAttribute('data-player'));
            const marker = player.marker;
            el.innerHTML = gameboard.markers[marker];
        })
    
        gameInterface.activePlayer();
    },
    

    activePlayer() {
        document.querySelectorAll('.score-player').forEach((el) => {
            el.classList.remove('selected');
            if (el.getAttribute('data-player') != gameFlow.players[gameFlow.lastTurn].name) {
                el.classList.add('selected');
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
        document.querySelectorAll(`.marker`)
            .forEach((e) => {
                    if (!e.classList.contains('selected')) {
                        e.classList.add('disabled');
                    }
                    e.removeEventListener('click',events.initialMarkerChoice);
            });
    },

    showStartButton() {
        const markers = document.querySelectorAll('.marker');
        markers.forEach((marker) => {
            if (marker.classList.contains('selected')) {
                this.toggleClass('.start','hide');
                document.querySelectorAll('.marker').forEach((e) => {
                    e.removeEventListener('click', events.initialMarkerChoice);
                });
            }
        });
    },

    showResult(winner) {
        if  (winner == undefined) {
            winner = '';
        } else if (winner != "it's a tie") {
            winner = `Player ${winner} won`;
        } 

        document.querySelector('.result').innerHTML = winner;

        if (winner != '') {
            this.toggleClass('.score-container','hide');
            this.toggleClass('.result','hide');
        } else {
            if (document.querySelector('.score-container').classList.contains('hide')) {
                    this.toggleClass('.score-container','hide');
            }
            
            if (!document.querySelector('.result')
                .classList.contains('hide')) {
                    this.toggleClass('.result','hide');
            }
        }
    }
}

gameFlow.newGame();