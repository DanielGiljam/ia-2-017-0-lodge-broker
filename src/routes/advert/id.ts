import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"
import moment from "moment"

import Advert from "../../models/Advert"
import Cabin from "../../models/Cabin"
import createGetResourceFromURLMiddleware from "../../util/createGetResourceFromURLMiddleware"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

// TODO: improve postAdvertRequestBodySchema so that it's possible to POST from /advert or /user/:user/advert
const postAdvertRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    availableFrom: {type: "string", format: "date"},
    availableTo: {type: "string", format: "date"},
  },
  required: ["availabeFrom", "availableTo"],
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
        res.sendStatus(404)
      }
    } catch (error) {
      res.sendStatus(404)
    }
  },
  patch: [
    createGetResourceFromURLMiddleware("advert", true),
    createRequestBodyValidatorMiddleware(postAdvertRequestBodySchema),
    async (req, res) => {
      const advert = req.resources?.advert
      if (advert == null) {
        throw new Error("Unexpected undefined value: req.resource.")
      }
      const cabin =
        req.resources?.cabin ?? (await advert.populate("cabin")).cabin
      const availableFrom = moment(req.body.availableFrom, moment.ISO_8601)
      const availableTo = moment(req.body.availableTo, moment.ISO_8601)
      if (
        await Cabin.isUnavailable(cabin, availableFrom, availableTo, advert._id)
      ) {
        res.sendStatus(409)
        return
      }
      await advert.updateOne({availableFrom, availableTo})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: [
    createGetResourceFromURLMiddleware("advert", true),
    async (req, res) => {
      const advert = req.resources?.cabin
      if (advert == null) {
        throw new Error("Unexpected undefined value: req.resource.")
      }
      await advert.deleteOne()
      res.status(200).json({status: "OK"})
    },
  ],
  post: [
    createRequestBodyValidatorMiddleware(postAdvertRequestBodySchema),
    async (req, res) => {
      const cabin =
        req.resources?.cabin ?? (await Cabin.findById(req.body.cabin))
      if (cabin == null) {
        throw new Error(
          `Unexpected undefined object: cabin with id "${
            req.body.cabin as string
          }".`,
        )
      }
      const advertiser = req.resources?.user?._id ?? req.user?.id
      if (advertiser == null) {
        throw new Error("Unexpected undefined value: req.user.id.")
      }
      if (cabin.owner !== advertiser) {
        res.sendStatus(403)
        return
      }
      const availableFrom = moment(req.body.availableFrom, moment.ISO_8601)
      const availableTo = moment(req.body.availableTo, moment.ISO_8601)
      if (await Cabin.isUnavailable(cabin, availableFrom, availableTo)) {
        res.sendStatus(409)
        return
      }
      const advert = await new Advert({
        cabin: cabin._id,
        advertiser,
        availableFrom,
        availableTo,
      })
      res.setHeader("Location", `${apiURL}/advert/${advert._id as string}`)
      res.status(201).json({status: "Created"})
    },
  ],
}

export default id
