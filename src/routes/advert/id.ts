import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"
import moment from "moment"

import requestBodyValidator from "../../middlewares/requestBodyValidator"
import resourceExtractor from "../../middlewares/resourceExtractor"
import Advert from "../../models/Advert"
import Cabin from "../../models/Cabin"

// TODO: improve postAdvertRequestBodySchema so that it's possible to POST from /advert or /user/:user/advert
const postAdvertRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    availableFrom: {type: "string", format: "date"},
    availableTo: {type: "string", format: "date"},
  },
  required: ["availableFrom", "availableTo"],
}

const apiURL = process.env.API_URL ?? "http://localhost:3000"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const advert = await Advert.findById(req.params.id)
        .populate("cabin")
        .populate("advertiser")
      if (advert != null) {
        res.status(200).json({status: "OK", cabin: advert})
      } else {
        res.status(404).json({status: "Not Found"})
      }
    } catch (error) {
      res.status(404).json({status: "Not Found"})
    }
  },
  patch: [
    resourceExtractor("advert", true),
    requestBodyValidator(postAdvertRequestBodySchema),
    async (req, res, next) => {
      const advert = req.resources?.advert
      if (advert == null) {
        next(new Error("Unexpected undefined value: req.resource."))
        return
      }
      const cabin =
        req.resources?.cabin ?? (await advert.populate("cabin")).cabin
      const availableFrom = moment(req.body.availableFrom, moment.ISO_8601)
      const availableTo = moment(req.body.availableTo, moment.ISO_8601)
      if (
        await Cabin.isUnavailable(cabin, availableFrom, availableTo, advert._id)
      ) {
        res.status(409).json({status: "Conflict"})
        return
      }
      await advert.updateOne({availableFrom, availableTo})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: [
    resourceExtractor("advert", true),
    async (req, res, next) => {
      const advert = req.resources?.cabin
      if (advert == null) {
        next(new Error("Unexpected undefined value: req.resource."))
        return
      }
      await advert.deleteOne()
      res.status(200).json({status: "OK"})
    },
  ],
  post: [
    requestBodyValidator(postAdvertRequestBodySchema),
    async (req, res, next) => {
      const cabin =
        req.resources?.cabin ?? (await Cabin.findById(req.body.cabin))
      if (cabin == null) {
        next(
          new Error(
            `Unexpected undefined object: cabin with id "${
              req.body.cabin as string
            }".`,
          ),
        )
        return
      }
      const advertiser = req.resources?.user?._id?.toString() ?? req.user?.id
      if (advertiser == null) {
        next(new Error("Unexpected undefined value: req.user.id."))
        return
      }
      if (cabin.owner.toString() !== advertiser) {
        res.status(403).json({status: "Forbidden"})
        return
      }
      const availableFrom = moment(req.body.availableFrom, moment.ISO_8601)
      const availableTo = moment(req.body.availableTo, moment.ISO_8601)
      if (await Cabin.isUnavailable(cabin, availableFrom, availableTo)) {
        res.status(409).json({status: "Conflict"})
        return
      }
      const advert = await new Advert({
        cabin: cabin._id,
        advertiser,
        availableFrom,
        availableTo,
      }).save()
      res.setHeader("Location", `${apiURL}/advert/${advert._id as string}`)
      res.status(201).json({status: "Created"})
    },
  ],
}

export default id
