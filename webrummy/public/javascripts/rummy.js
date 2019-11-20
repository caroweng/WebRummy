// document.getElementById("nextPlayerButton").addEventListener("click", getCurrentPlayerName);

let game = {
    desk: {
        sets: [],
        players: []
    }
};

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
            insertingNames();
            break;
        case "P_TURN":
            playerTurn();
            break;
        case "P_FINISHED":
    }
}

function setNames() {
    let name = document.getElementById("nameInput").value;
    console.log("inserted name javascript " + name);
    sendName(name);
}

function sendName(name) {
    $.ajax({
        method: "GET",
        url: "/setName/" + name,
        success: () => {
            console.log("Successfully sent name!");
        },
        error: function (error) {
            console.log(error);

        }
    });
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
        class: "btn btn-light button"
    }));

    menuSection.append($('<input/>', {
        type: "submit",
        id: "loadGame",
        value: "Load Game",
        class: "btn btn-light button"
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

    $("#firstSection").attr("class", "welcome")
        .append(header)
        .append(menuSection);

    document.getElementById("newGame").addEventListener("click", () => callRummyController("c"));
    document.getElementById("loadGame").addEventListener("click", getCurrentPlayerName);
}

function callRummyController(param) {
    $.ajax({
        method: "GET",
        url: "/rummy/" + param,
        success: () => {
            getDesk()
        },
        error: function (error) {
            console.log("error " + error);
        }
    });
    init()
}

function insertingNames() {
    let header = $("<h1/>", {
        text: "Insert Names!"
    });

    let nameInputButtons = $("<div/>", {
        class: "insertingNamesInput",
    });

    let nameInput = $("<input/>", {
        type: "text",
        id: "nameInput",
        placeholder: "Name"
    });

    let nameSubmit = $("<input/>", {
        type: "submit",
        id: "submitName",
        value: "confirm",
        class: "btn btn-light"
    });

    nameInputButtons
        .append(nameInput)
        .append(nameSubmit);


    let startGame = $("<input/>", {
        type: "submit",
        id: "startGame",
        value: "Start Game",
        class: "btn btn-light button"
    });

    $("#firstSection").empty().attr("class", "insertingNames")
        .append(header)
        .append("<br/>")
        .append(nameInputButtons)
        .append("<br/><br/>")
        .append(undoRedoButtons().append(startGame));

    document.getElementById("submitName").addEventListener("click", setNames);
    document.getElementById("startGame").addEventListener("click", () => callRummyController("f"));
    setEventsForUndoRedo();
}

function undoRedoButtons() {
    let buttonBar = $("<div/>", {
        class: "buttonBar"
    });

    let undoButton = $("<input/>", {
        type: "submit",
        id: "undo",
        value: "Undo",
        class: "btn btn-light button"
    });

    let redoButton = $("<input/>", {
        type: "submit",
        id: "redo",
        value: "Redo",
        class: "btn btn-light button"
    });

    buttonBar
        .append(undoButton)
        .append(redoButton);
    return buttonBar;
}

function setEventsForUndoRedo() {
    document.getElementById("undo").addEventListener("click", () => callRummyController("z"));
    document.getElementById("redo").addEventListener("click", () => callRummyController("r"));
}

function playerTurn() {
    let alertSection = $("#alertSection").empty();
    let userBoardSection = $("#firstSection").empty();
    let tableSection = $("#secondSection").empty();
    $("#navbar").append(getNavbar());
    let currentPlayer = game.desk.players.find(player => player.state.toString() === "TURN")
    let infoAlert = $("<div/>", {
        class: "alert alert-primary playerAlert",
        role: "alert",
        text: currentPlayer.name + ", it's your turn!"
    });

    alertSection.append(infoAlert);
    userBoardSection.append(getUserBoard());
        // .append($("<br/>"))
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

    navbarButtons
        .append(undoRedoButtons())
        .append($("<input/>", {
       class: "btn btn-outline-light my-2 my-lg-0",
       type: "submit",
       value: "Finish"
    }));

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
    let userBoardSection = $("<div/>", {
        class: "section sectionUserBoard"
    });
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
        console.log(id)
        userBoard.append($("<input/>", {
            type: "submit",
            value: tile.value.toString(),
            class: tile.color.toString() + " tile",
            id: id,
            click: () => {
                callRummyController("l " + id)
                // $.ajax({
                //     method: "GET",
                //     url: "/game/player/laydown/" + tileId,
                //     dataType: "json",
                //     success: result => update(result)
                // })
            }
        }));

        // document.addEventListener("DOMContentLoaded", () => {
        // });
        //     document.getElementById(id).addEventListener("click", () => callRummyController("l " + id));
    }
    userBoardSection.append(userBoard);
    return userBoardSection;
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

        for(let tile of sortedSet.struct) {
            let id = tile.value.toString() + tile.color.toString().charAt(0) + tile.ident.toString();
            let tileComponent = $("<input/>", {
                type: "submit",
                value: tile.value.toString(),
                class: tile.color.toString() + " tile",
                id: id,
                click: () => {
                    callRummyController("m " + id)
                    // $.ajax({
                    //     method: "GET",
                    //     url: "/game/player/laydown/" + tileId,
                    //     dataType: "json",
                    //     success: result => update(result)
                    // })
                }
            });
            tilesSection.append(tileComponent);

            // document.addEventListener("DOMContentLoaded", () => {
            //     document.getElementById(id).addEventListener("click", () => callRummyController("m " + id));
            // });
        }

        table.append(tilesSection);
    }
    tableSection.append(table);
    return tableSection;
}

function getDesk() {
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

function getUserBoardTiles() {
    let currentPlayer = game.desk.players.find(player => player.state.toString() === "TURN");
    return currentPlayer.board;
}

function getTableSets() {
    return game.desk.sets;
}

function reload(result) {
    game = result;
    init()
}

$(document).ready(function () {
    console.log("Document is ready!");
    getDesk();
});
