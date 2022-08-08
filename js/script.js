const game = (function() {

})();


const gameboard = {
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

function newPlayer(name, marker) {
    return {
        name: name,
        marker: marker,
        turn() {

        },
        active: true
    }
}

const gameLogic = {
    addPLayers() {
        gameFlow.players.push();
    },

    checkEnd() {
        // check diagonals
        const board = gameboard.boardArray;
        const diagonalOne = [board[0][0], board[1][1], board[2][2]];
        const diagonalTwo = [board[0][2], board[1][1], board[2][0]];
        const transposedBoard = tranposeArray(board);

        function tranposeArray(board) {
            const transposedArray = board[0].map((_,colIndex) => {
                return board.map(row => row[colIndex]);
            });
            return transposedArray;
        }

        function checker(lines) {
            lines.forEach(e => {
                if (e.every(el => el == 1 || el == 2)) {
                    console.log(e[0]);
                    gameFlow.gameActive = false;
                }
            })
        }

        if (gameFlow.turns >= 8) {
            console.log('GAME OVER');
            gameFlow.gameActive = false;
        }

        // checking rows & diagonals
        console.log(board.concat([diagonalOne],[diagonalTwo],transposedBoard));
        checker(board.concat([diagonalOne],[diagonalTwo],transposedBoard));  

    },

    chooseWinner(marker) {
        // -- check who has winner marker
        // -- render result
        // if x or o wins, who has this marker
        // gameflow.players.foreach.has(marker)
        // then it's a winner
    },

    putMarker() {

    },

    saveScore() {
        // play multiple games and fix score
    }


}


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


    turns: 0,


    gameActive: true,




}


const eventHandlers = {
    squareClick(e) {
        if (gameFlow.gameActive) {
            console.log(e.target);
            // marker to put
            const marker = 2;
            e.target.innerHTML = gameboard.markers[marker];
            const row = e.target.getAttribute(['data-row']);
            const column = e.target.getAttribute(['data-column']);
            gameboard.boardArray[row][column] = marker;
            console.log(gameboard.boardArray);
    
            //
            gameFlow.turns += 1;
            gameLogic.checkEnd();
        }
    }
}




const render = {

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
                boardSquare.classList.add('marker');
                boardSquare.setAttribute('data-row',`${row}`);
                boardSquare.setAttribute('data-column',`${column}`);
                boardSquare.setAttribute('onClick','eventHandlers.squareClick(event)');
                boardContainer.appendChild(boardSquare);
            })
        });
    }
}

document.addEventListener('DOMContentLoaded', function(e) {
    console.log(document.querySelector('.gameboard-container'));
    interface.buildBoard();
});


