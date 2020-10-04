import {Router} from "express"

import createGetResourceFromURLMiddleware from "../../util/createGetResourceFromURLMiddleware"
import booking from "../booking"
import bookings from "../bookings"

import id from "./id"

const advert = Router()

advert.use(
  "/:advert/booking",
  createGetResourceFromURLMiddleware("advert"),
  booking,
)
advert.use(
  "/:advert/bookings",
  createGetResourceFromURLMiddleware("advert"),
  bookings,
)
advert.get("/:advert", id.get)
advert.patch("/:advert", id.patch)
advert.delete("/:advert", id.delete)
advert.post("/", id.post)

export default advert
