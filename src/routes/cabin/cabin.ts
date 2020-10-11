import {Router} from "express"

import resourceExtractor from "../../middlewares/resourceExtractor"
import advert from "../advert"
import adverts from "../adverts"

import id from "./id"

const cabin = Router()

cabin.use("/:cabin/advert", resourceExtractor("cabin"), advert)
cabin.use("/:cabin/adverts", resourceExtractor("cabin"), adverts)
cabin.get("/:cabin", id.get)
cabin.patch("/:cabin", id.patch)
cabin.delete("/:cabin", id.delete)
cabin.post("/", id.post)

export default cabin
