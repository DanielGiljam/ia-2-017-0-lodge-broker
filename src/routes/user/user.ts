import {Router} from "express"

import resourceExtractor from "../../middlewares/resourceExtractor"
import advert from "../advert"
import adverts from "../adverts"
import booking from "../booking"
import bookings from "../bookings"
import cabin from "../cabin"
import cabins from "../cabins"

import id from "./id"
import login from "./login"
import logout from "./logout"
import signup from "./signup"
import token from "./token"

const user = Router()

user.post("/login", login)
user.post("/token", token)
user.post("/signup", signup)
user.post("/logout", logout)
user.use("/:user/cabin", resourceExtractor("user"), cabin)
user.use("/:user/cabins", resourceExtractor("user"), cabins)
user.use("/:user/advert", resourceExtractor("user"), advert)
user.use("/:user/adverts", resourceExtractor("user"), adverts)
user.use("/:user/booking", resourceExtractor("user", true), booking)
user.use("/:user/bookings", resourceExtractor("user", true), bookings)
user.get("/:user", id.get)
user.put("/", id.put)
user.delete("/", id.delete)

export default user
