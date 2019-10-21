package controllers

import de.htwg.se.rummy.Rummy
import de.htwg.se.rummy.controller.ControllerInterface
import de.htwg.se.rummy.view.component.Tui
import javax.inject._
import play.api.mvc._


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class RummyController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val rummyController: ControllerInterface = Rummy.controller
  var rummyAsString: String = ""
  rummyController.add(() => {
    rummyAsString = rummyController.currentStateAsString()
  })

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(rummyController.currentStateAsString())
  }


  def rummy(input: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val tui = new Tui(rummyController)
    val name = input.replace(":input=", "")
    tui.processInput(name)
    Ok(rummyAsString)
  }

}