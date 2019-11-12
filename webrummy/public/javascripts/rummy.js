
document.getElementById("submitName").addEventListener("click", getNames);
function getNames() {
    var name = document.getElementById("nameInput").value;
    console.log("inserted name javascript " + name)
}

function sendName() {
    // $.ajax({
    //     method: "GET",
    //     url: "/json",
    //     dataType: "json",
    //
    //     success: function (result) {
    //         grid = new Grid(result.grid.size);
    //         grid.fill(result.grid.cells);
    //         updateGrid(grid);
    //         registerClickListener();
    //     }
    // });
}
