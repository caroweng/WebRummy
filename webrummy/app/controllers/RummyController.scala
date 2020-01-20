package controllers

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import de.htwg.se.rummy.Rummy
import de.htwg.se.rummy.controller.ControllerInterface
import de.htwg.se.rummy.controller.component.ControllerState
import de.htwg.se.rummy.model.deskComp.deskBaseImpl.TileInterface
import de.htwg.se.rummy.view.component.Tui
import javax.inject._
import play.api.libs.json
import play.api.libs.json.Json
import play.api.libs.streams.ActorFlow
import play.api.mvc.{Action, _}

import scala.swing.Reactor
import scala.util.matching.Regex
import scala.xml.Null


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class RummyController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer)extends AbstractController(cc) {
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

    def nameInput(name: String) = {
        val correctInput: String = "name " + name
        println("testPost Called " + correctInput);
        this.rummy(correctInput)
    }

    def rummy(input: String): Unit =  {
        println("in rummy()")
        println(input)
        var correctInput: String = input
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

    def processSocketInput(msg: String): Unit = {
        println("msg: " + msg);
        val jsonObject = Json.parse(msg)
        val action = (jsonObject \ "action").get.as[String]

       action match {
            case "callRummyController" =>  {
                val param = (jsonObject \ "param").get.as[String]
                println("process param " + param)
                this.rummy(param)
            }
            case "addNameOfPlayer" => {
                val name = (jsonObject \ "name").get.as[String]
                println("process name " + name)
                nameInput(name)
            }
            case "getGame" => {

            }
        }
    }

    def socket() = {
        WebSocket.accept[String, String] { request =>
            ActorFlow.actorRef { out =>
                println("Connect received")
                RummyWebSocketActorFactory.create(out)
            }
        }
    }

    object RummyWebSocketActorFactory {
        def create(out: ActorRef) = {
            Props(new RummyWebSocketActor(out))
        }
    }

    class RummyWebSocketActor(out: ActorRef) extends Actor with Reactor {
        rummyController.add(() => {
            sendJsonToClient
        })
        sendJsonToClient

        def receive = {
            case msg: String =>
                out ! (rummyController.deskToJson().toString())
                processSocketInput(msg)
                println("Sent Json to Client"+ msg)
        }

        def sendJsonToClient = {
//            println("Received event from Controller")
            out ! (rummyController.deskToJson().toString())
        }
    }

}
