const game = (function() {

})();


const gameboard = (function() {
    return {
        boardArray: [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ],
    
        markers: {
            1: 'X',
            2: 'O'
        } 
    }
})();



function newPlayer(name, marker) {
    return {
        name: name,
        marker: marker,
        score:[]
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
                        console.log('WINWINWIN');
                        const winner = this.chooseWinner(line[0]);
                        console.log('player ' + (winner) + ' is winner');
                        gameFlow.gameActive = false;
                    }
                })
            }
    
            // in case of tie, we count players turns
            if (gameFlow.turns >= 8) {
                console.log('GAME OVER');
                gameFlow.gameActive = false;
            }
    
            // checking rows & diagonals
            checker.call(this,board.concat([diagonalOne],[diagonalTwo],transposedBoard));  
    
        },
    
        chooseWinner(marker) {
            return gameFlow.players.filter((e) => e.marker == marker)[0].name;
        },
    

    
        saveScore() {
            // play multiple games and fix score
            // push 1 to winner array and 0 to losers
        }   
    }
})();


const gameFlow = {
    /*
    -- render interface
    -- choose play vs player or vs AI
    -- choose marker
    -- who goes first
    -- show new button: continue or new game
    */

    newGame() {

    },

    players: [],

    addPLayer(player) {
        this.players.push(player);
    },

    turn(val=0) {
        this.lastTurn = val == 0 ? 1 : 0;
        return this.lastTurn;
    },

    putMarker(marker, row, column) {
        gameboard.boardArray[row][column] = marker;
    },

    lastTurn: 1,


    turns: 0,


    gameActive: true,


}


const events = {
    squareClick(e) {
        if (gameFlow.gameActive) {

            // nextTurn();
            let turn = gameFlow.turn(gameFlow.lastTurn);
            const marker = gameFlow.players[turn].marker;

            // current turn marker


            const target = e.target;
            const row = target.getAttribute(['data-row']);
            const column = target.getAttribute(['data-column']);
            
            gameFlow.putMarker(marker, row, column);
            render.marker(target,marker);

            console.log(gameboard.boardArray);
    
            // fire another events
            // addTurn, checkEnd, putMarker, 


            gameFlow.turns += 1;
            gameLogic.checkEnd();

            // disabling square to avoid double click or rewriting marker
            e.target.removeAttribute('onClick');
        }
    },
 
    documentReady() {

    },

    startButtonClick() {

    }

}


const render = {
    marker(target,marker) {
        target.innerHTML = gameboard.markers[marker];

    },

}


const interface = {

    init() {

    },

    getBoardContainer() {
        return document.querySelector('.gameboard-container');
    },

    buildBoard() {
        const boardContainer = this.getBoardContainer();
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

    toggleClass(target, className) {
        document.querySelector(target).classList.toggle(className);
    }

}

// DELETE EVENT LISTENERS !!!

function chooseMarker(e) {
    e.stopPropagation();
    const target = e.target;
    const player = target.getAttribute('data-player');
    const anotherPlayer = player == 1 ? 2 : 1;
    const marker = target.getAttribute('data-marker');
    

    // select marker, highlight marker in hreen
    target.classList.add('selected');
    

    // disable not chosen marker for player 1
    document.querySelectorAll(`[data-player="${player}"]`)
        .forEach((e) => {
            if (!e.classList.contains('selected')) {
                e.classList.add('disabled');
            }
            e.removeEventListener('click',chooseMarker);
        });
        
    // disable chosen marker for player 2
    document.querySelectorAll(`[data-player="${anotherPlayer}"]`)
        .forEach((e) => {
            if (e.getAttribute('data-marker') == marker) {
                e.classList.add('disabled');
                e.removeEventListener('click',chooseMarker);
            }
            
        });

    gameFlow.addPLayer(newPlayer(player,marker));

   
    // if have 2 players, show button new game 
    if (gameFlow.players.length >= 2) {
        interface.toggleClass('.start','hide');
        document.querySelectorAll('.marker').forEach((e) => {
            e.removeEventListener('click', chooseMarker);
        });
    };
}

function showGameBoard() {
    interface.toggleClass('.new-game','hide');
    interface.toggleClass('.gameboard-container','hide');
    document.querySelector('.start').removeEventListener('click',showGameBoard);
}


document.addEventListener('DOMContentLoaded', function(e) {
    interface.buildBoard();

    document.querySelectorAll('.marker').forEach((e) => {
        e.addEventListener('click', chooseMarker);
    });

    document.querySelector('.start').addEventListener('click',showGameBoard);
});


