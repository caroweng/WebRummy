let game = {
    desk: {
        sets: [],
        players: []
    }
};

let socket = new WebSocket("ws://localhost:9000/socket");
initWebSocket();

function initWebSocket() {
    socket.onopen = function(){
        console.log("WebSocket connection opened.");
    }

    socket.onmessage = function(message) {
        if (typeof message.data === "string") {
            let json = JSON.parse(message.data);
            reload(json);
        }
    }

    socket.onerror = function() {
        console.log("WebSocket connection failed.");
    }

    socket.onclose = function() {
        console.log("WebSocket connection closed.");
    }
}


function init() {
    $.ajax({
        method: "GET",
        url: "/state",
        dataType: "text",
        success: state => {
            console.log(state);
            switchView(state)
        },
        error: (error) => {
            console.log(error)
        }
    });
}

function switchView(state) {
    switch (state) {
        case "NEW_GAME":
            startMenu();
            break;
        case "INSERTING_NAMES":
            alreadyAddedPlayers();
            insertingNames();
            break;
        case "P_TURN":
            playerTurn();
            break;
        case "P_FINISHED":
            onFinished();
    }
}

function clearAlerts() {
    $("#alertSection").empty();
}

function setNames() {
    let name = document.getElementById("nameInput").value;
    console.log("inserted name javascript " + name);
    sendName(name);
}

function sendName(name) {
    socket.send(JSON.stringify({action: "addNameOfPlayer", name: name}));


    // $.ajax({
    //     method: "GET",
    //     url: "/setName/" + name,
    //     success: () => {
    //         console.log("Successfully sent name!");
    //         getDeskFromServer();
    //     },
    //     error: function (error) {
    //         console.log(error);
    //
    //     }
    // });
}

function startMenu() {
    let header = $("<h1/>", {
        text: "Welcome to Rummy!"
    });

    let menuSection = $("<div/>", {
        class: "creatingNewGameForms"
    });

    menuSection.append($('<input/>', {
        type: "submit",
        id: "newGame",
        value: "New Game",
        class: "btn btn-light button",
        click: () => {
            callRummyController("c")
        }
    }));

    menuSection.append($('<input/>', {
        type: "submit",
        id: "loadGame",
        value: "Load Game",
        class: "btn btn-light button",
        click: () => {
            callRummyController("l")
        }
    }));


    let rulesButton = $("<a/>", {
        href: "rules"
    });

    rulesButton.append($("<button/>", {
        type: "button",
        class: "btn btn-light button",
        text: "Rules"
    }));

    menuSection.append(rulesButton);

    $("#firstSection").empty().attr("class", "section")
        .append(header)
        .append(menuSection);
}

function callRummyController(param) {
    console.log("rummyController");

    socket.send(JSON.stringify({action: "callRummyController", param: param}));


    // $.ajax({
    //     method: "GET",
    //     url: "/rummy/" + param,
    //     success: () => {
    //         getDeskFromServer()
    //     },
    //     error: function (error) {
    //         console.log("error " + error);
    //     }
    // });
    // init()
}

function insertingNames() {
    let header = $("<h1/>", {
        text: "Insert Names!"
    });

    let nameInputButtons = $("<div/>", {
        class: "insertingNamesInputs",
    });

    let nameInput = $("<input/>", {
        type: "text",
        id: "nameInput",
        placeholder: "Name",
        class: "form-control"
    });

    let nameSubmit = $("<input/>", {
        type: "submit",
        id: "submitName",
        value: "confirm",
        class: "btn btn-light",
        click: () => {
            setNames();
        }
    });

    nameInputButtons
        .append(nameInput)
        .append(nameSubmit);

    let startGame = $("<input/>", {
        type: "submit",
        id: "startGame",
        value: "Start Game",
        class: "btn btn-light button",
        click: () => {
            if(game.desk.players.length < 2) {
                $(displayAlert("Not enough players!"))
            } else {
                callRummyController("f")
            }
        }
    });
    $("#firstSection").empty().attr("class", "insertingNames section")
        .append(header)
        .append("<br/>")
        .append(nameInputButtons)
        .append("<br/><br/>")
        .append(undoRedoButtons().append(startGame));
}

function displayAlert(msg) {
    let alert = $("<div/>", {
        class: "alert alert-warning",
        role: "alert",
        text: msg
    });
    $("#alertSection").empty().append(alert)
}

function alreadyAddedPlayers() {
    let players = $("<div/>");
    let playerCount = 0;
    for(let player of game.desk.players) {
        playerCount++;
        players.append($("<p/>", {
            text: "Player" + playerCount + ": " + player.name,
            class: "alreadyAddedPlayers"
        }));
    }

    $("#secondSection").empty().append(players)
}

function undoRedoButtons() {
    let buttonBar = $("<div/>", {
        class: "buttonBar"
    });

    let undoButton = $("<input/>", {
        type: "submit",
        id: "undo",
        value: "Undo",
        class: "btn btn-light button",
        click: () => {
            callRummyController("z")
        }
    });

    let redoButton = $("<input/>", {
        type: "submit",
        id: "redo",
        value: "Redo",
        class: "btn btn-light button",
        click: () => {
            callRummyController("r")
        }
    });

    buttonBar
        .append(undoButton)
        .append(redoButton);
    return buttonBar;
}

function playerTurn() {
    let alertSection = $("#alertSection").empty();
    getUserBoard();
    let tableSection = $("#secondSection").empty().attr("class","tableAndBoard");
    $("#navbar").append(getNavbar());
    let currentPlayer = game.desk.players.find(player => player.state.toString() === "TURN");
    let infoAlert = $("<div/>", {
        class: "alert alert-primary playerAlert",
        role: "alert",
        text: currentPlayer.name + ", it's your turn!"
    });

    alertSection.append(infoAlert);
    tableSection.append(getTable());
}

function getNavbar() {
    let navbar = $("<nav/>", {
        class: "navbar fixed-top navbar-dark bg-dark navbar-expand-lg"
    });

    let navbarButtons = $("<div/>", {
        class: "collapse navbar-collapse buttonsNavBar",
        id: "navbarSupportedContent"
    });

    let undoButton = $("<input/>", {
        type: "submit",
        id: "undo",
        value: "Undo",
        class: "btn btn-outline-light my-2 my-lg-0",
        click: () => {
            callRummyController("z")
        }
    });

    let redoButton = $("<input/>", {
        type: "submit",
        id: "redo",
        value: "Redo",
        class: "btn btn-outline-light my-2 my-lg-0",
        click: () => {
            callRummyController("r")
        }
    });

    let finishButton = $("<input/>", {
        class: "btn btn-outline-light my-2 my-lg-0",
        type: "submit",
        value: "Finish",
        click: () => {
            callRummyController("f")
        }
    });

    navbarButtons
        .append(undoButton)
        .append(redoButton)
        .append(finishButton);

    let rulesLink = $("<a/>", {
        href: "../rules",
    });

    rulesLink.append($("<button/>", {
        type: "button",
        class: "btn btn-outline-light my-2 my-lg-0",
        text: "Rules"
    }));

    navbar
        .append($("<span/>", {
            class: "navbar-text",
            text: "RUMMY"
        }))
        .append(navbarButtons)
        .append(rulesLink);
    return navbar;
}

function getUserBoard() {
    let userBoardSection = $("#firstSection").empty().attr("class", "section sectionUserBoard tableAndBoard");
    let header = $("<h2/>", {
       text: "user board"
    });
    userBoardSection.append(header);

    let userBoard = $("<div/>", {
        class: "userBoard"
    });

    let viewOfBoard = getUserBoardTiles();

    for(let tile of viewOfBoard) {
        let id = tile.value.toString() + tile.color.toString().charAt(0).toString() + tile.ident.toString();
        userBoard.append($("<input/>", {
            type: "submit",
            value: tile.value.toString(),
            class: tile.color.toString() + " tile",
            id: id,
            click: () => {
                callRummyController("l " + id)
            }
        }));
    }
    userBoardSection.append(userBoard);
    return userBoardSection;
}

function getUserBoardTiles() {
    let currentPlayer = game.desk.players.find(player => player.state.toString() === "TURN");
    return currentPlayer.board.sort(compareTiles);
}

function compareTiles(a, b) {
    if(a.value > b.value) return 1;
    if(a.value < b.value) return -1;
    return 0;
}

function getTable() {
    let tableSection = $("<div/>", {
        class: "section"
    });
    let header = $("<h2/>", {
        text: "table"
    });
    tableSection.append(header);

    let table = $("<div/>", {
        class: "table"
    });

    let tileSet = getTableSets();

    for(let sortedSet of tileSet) {
        let tilesSection = $("<div/>", {
            class: "tiles"
        });

        sortedSet = sortedSet.struct.sort(compareTiles);

        for(let tile of sortedSet) {
            let id = tile.value.toString() + tile.color.toString().charAt(0) + tile.ident.toString();
            let tileComponent = $("<input/>", {
                type: "submit",
                value: tile.value.toString(),
                class: tile.color.toString() + " tile",
                id: id,
                click: () => {
                    callRummyController("m " + id)
                }
            });
            tilesSection.append(tileComponent);
        }
        table.append(tilesSection);
    }
    tableSection.append(table);
    return tableSection;
}

function getTableSets() {
    return game.desk.sets;
}

function onFinished() {
    let header = $("<h3/>", {
        text: "Turn finished"
    });

    let nextPlayerButton = $("<input/>", {
        type: "submit",
        value: "Next player",
        class: "btn btn-light button",
        id: "nextPlayerButton",
        click: () => {
            callRummyController("n")
        }
    });

    $("#alertSection").empty();
    let storeGameButton = $("<input/>", {
        type: "submit",
        value: "Store game",
        class: "btn btn-light button",
        id: "storeGame",
        click: () => {
            callRummyController("s");
            displayAlert("Game stored!")
        }
    });
    $("#navbar").empty();
    $("#secondSection").empty();
    $("#firstSection")
        .empty()
        .append(header)
        .append($("<br/>"))
        .append(nextPlayerButton)
        .append(storeGameButton);
}

function getDeskFromServer() {
    console.log("getDesktFromServer")
    $.ajax({
        method: "GET",
        url: "/getDesk",
        dataType: "json",
        success: (result) => {
            reload(result);
        },
        error: () => (error) => {
            console.log("error " + error);
        }
    });
}

function reload(result) {
    game = result;
    init()
}

$(document).ready(function () {
    console.log("Document is ready!");
    initWebSocket()
    getDeskFromServer();
})
