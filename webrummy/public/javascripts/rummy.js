// document.getElementById("startGame").addEventListener("click", getCurrentPlayerName);
// document.getElementById("nextPlayerButton").addEventListener("click", getCurrentPlayerName);
// document.getElementById("submitName").addEventListener("click", setNames);

function init() {
    $.ajax({
        method: "GET",
        url: "/state",
        dataType: "text",
        success: state => switchView(state),
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


function getCurrentPlayerName() {
    console.log(" get current");
    // $.ajax({
    //     method: "GET",
    //     url: "/getCurrentPlayerName",
    //     dataType: "json",
    //
    //     success: function (result) {
    //         document.getElementById("playerName").innerText = result;
    //     }
    // });
    // console.log(" get current")
    document.getElementById("playerNam").innerHTML = "hallo";
    // document.getElementById("playerName").innerHTML = "hallo";

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
            console.log("Success")
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

}

$(document).ready(function () {
    console.log("Document is ready!");
    init()
});
