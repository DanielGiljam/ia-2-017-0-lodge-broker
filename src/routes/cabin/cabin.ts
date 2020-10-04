import {Router} from "express"

import createGetResourceFromURLMiddleware from "../../util/createGetResourceFromURLMiddleware"
import advert from "../advert"
import adverts from "../adverts"

import id from "./id"

const cabin = Router()

cabin.use("/:cabin/advert", createGetResourceFromURLMiddleware("cabin"), advert)
cabin.use(
  "/:cabin/adverts",
  createGetResourceFromURLMiddleware("cabin"),
  adverts,
)
cabin.get("/:cabin", id.get)
cabin.patch("/:cabin", id.patch)
cabin.delete("/:cabin", id.delete)
cabin.post("/", id.post)

export default cabin
