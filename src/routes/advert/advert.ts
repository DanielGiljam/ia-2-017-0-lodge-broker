import {Router} from "express"

import resourceExtractor from "../../middlewares/resourceExtractor"
import booking from "../booking"
import bookings from "../bookings"

import id from "./id"

const advert = Router()

advert.use("/:advert/booking", resourceExtractor("advert"), booking)
advert.use("/:advert/bookings", resourceExtractor("advert"), bookings)
advert.get("/:advert", id.get)
advert.patch("/:advert", id.patch)
advert.delete("/:advert", id.delete)
advert.post("/", id.post)

export default advert
