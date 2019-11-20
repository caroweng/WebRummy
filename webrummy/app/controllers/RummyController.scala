package controllers

import de.htwg.se.rummy.Rummy
import de.htwg.se.rummy.controller.ControllerInterface
import de.htwg.se.rummy.controller.component.ControllerState
import de.htwg.se.rummy.model.deskComp.deskBaseImpl.TileInterface
import de.htwg.se.rummy.view.component.Tui
import javax.inject._
import play.api.mvc._

import scala.util.matching.Regex


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class RummyController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
    val elements = 12
    val PlayerNamePattern: Regex = "name [A-Za-z]+".r
    val LayDownTilePattern: Regex = "(l [1-9][RBGY][01]|l 1[0123][RBGY][01])".r
    val MoveTilePattern: Regex = "(m [1-9][RBGY][01] t [1-9][RBGY][01]|m 1[0123][RBGY][01] t [1-9][RBYG][01]|m 1[0-3][RBGY][01] t 1[0-3][RBGY][01]|m [1-9][RBGY][01] t 1[0-3][RBYG][01])".r
    val MoveMPatternString: String = "m [1-9][RBGY][01]|m 1[0123][RBGY][01]"

    val rummyController: ControllerInterface = Rummy.controller
    var rummyAsString: String = ""
    var selectedToMove: String = ""

    rummyController.add(() => {
        rummyAsString = rummyController.currentStateAsString()
    })

    def state():  Action[AnyContent] = Action {
        rummyController.storeFile()
        rummyController.loadFile()
//        Ok(stateString)
    }

    def getTileSet():  Action[AnyContent] = Action {
        var stateString: String = ""
        rummyController.controllerState match {
        }
        Ok(stateString)
    }

    def getViewOfBoard():  Action[AnyContent] = Action {
        var stateString: String = ""
        rummyController.controllerState match {
            case ControllerState.NEW_GAME => stateString = "NEW_GAME"
            case ControllerState.INSERTING_NAMES => stateString = "INSERTING_NAMES"
            case ControllerState.P_TURN => stateString = "P_TURN"
            case ControllerState.P_FINISHED => stateString = "P_FINISHED"
        }
        Ok(stateString)
    }

    def newGame(): Action[AnyContent] = Action{
        Ok(views.html.rummy(rummyController))
    }

    def rules(): Action[AnyContent] = Action {
        Ok(views.html.rules())
    }

    def nameInput(name: String) = {
        val correctInput: String = "name " + name
        println("testPost Called " + correctInput);
        this.rummy(correctInput)
    }

    def getCurrentPlayerName(): Action[AnyContent] = Action {
        Ok(rummyController.currentP.name)
    }

    def rummy(input: String): Action[AnyContent] = Action {
        println("in rummy()")
        println(input)
        var correctInput: String = input
        if(input.startsWith(":input=")) {
             correctInput = input.replace(":input=", "")
        }
        if (correctInput.matches(MoveMPatternString)) {
            if (selectedToMove.equals("")) {
                selectedToMove = correctInput
            } else {
                correctInput =  correctInput.replaceFirst("m", " t")
                processInput(selectedToMove + correctInput)
                selectedToMove = ""
            }
        } else {
            processInput(correctInput)
        }
//        println(Ordering(rummyController.desk.board))
//        val set: scala.collection.SortedSet[TileInterface] = rummyController.desk.board
        Ok(views.html.rummy(rummyController))
    }

    def processInput(input: String): Unit = {
        if (input.equals("q")) {
            System.exit(0)
        }
        println(rummyController.controllerState)
        rummyController.controllerState match {
            case ControllerState.NEW_GAME => handleNewGameInput(input)
            case ControllerState.INSERTING_NAMES => handleNameInput(input)
            case ControllerState.P_TURN => handleOnTurn(input)
            case ControllerState.P_FINISHED => handleOnTurnFinished(input)
        }
    }

    def handleNewGameInput(input: String): Unit = {
        input match {
            case "c" => rummyController.createDesk(elements + 1)
            case "l" => rummyController.loadFile()
            case _ => wrongInput()
        }
    }

    def handleNameInput(name: String): Unit = {
        name match {
            case "f" => rummyController.nameInputFinished()
            case "z" => rummyController.undo()
            case "r" => rummyController.redo()
            case PlayerNamePattern() => rummyController.addPlayerAndInit(name.substring(4).trim, elements)
            case _ => wrongInput()
        }
    }

    def handleOnTurn(input: String): Unit = {
        input match {
            case LayDownTilePattern(c) => rummyController.layDownTile(c.split(" ").apply(1));
            case MoveTilePattern(c) => rummyController.moveTile(c.split(" t ").apply(0).split(" ").apply(1), c.split(" t ").apply(1));
            case "f" => rummyController.userFinishedPlay()
            case "z" => rummyController.undo()
            case "r" => rummyController.redo()
            case _ => wrongInput()
        }
    }

    def handleOnTurnFinished(input: String): Unit = input match {
        case "n" => rummyController.switchToNextPlayer()
        case "s" => rummyController.storeFile()
        case _ => wrongInput()
    }

    private def wrongInput() {
        rummyAsString = "Could not identify your input. Are you sure it was correct'?"
    }

}
