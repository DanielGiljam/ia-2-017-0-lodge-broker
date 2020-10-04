import {Router} from "express"

import id from "./id"

const booking = Router()

booking.get("/:booking", id.get)
booking.patch("/:booking", id.patch)
booking.delete("/:booking", id.delete)
booking.post("/", id.post)

export default booking
