import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"
import moment from "moment"

import Advert from "../../models/Advert"
import Booking from "../../models/Booking"
import createGetResourceFromURLMiddleware from "../../util/createGetResourceFromURLMiddleware"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

// TODO: improve postBookingRequestBodySchema so that it's possible to POST from /booking or /user/:user/booking
const postBookingRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    from: {type: "string", format: "date"},
    to: {type: "string", format: "date"},
  },
  required: ["from", "to"],
}

const apiURL = process.env.API_URL ?? "http://locahost:3000"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.booking)
        .populate("user")
        .populate({
          path: "advert",
          populate: [{path: "cabin"}, {path: "advertiser"}],
        })
      if (booking != null) {
        res.status(200).json({status: "OK", booking})
      } else {
        res.sendStatus(404)
      }
    } catch (error) {
      res.sendStatus(404)
    }
  },
  patch: [
    createGetResourceFromURLMiddleware("booking", true),
    createRequestBodyValidatorMiddleware(postBookingRequestBodySchema),
    async (req, res) => {
      const booking = req.resources?.booking
      if (booking == null) {
        throw new Error("Unexpected undefined value: req.resources.booking.")
      }
      const advert =
        req.resources?.advert ?? (await booking.populate("advert")).advert
      const from = moment(req.body.from, moment.ISO_8601)
      const to = moment(req.body.to, moment.ISO_8601)
      if (await Advert.isAlreadyBooked(advert, from, to, booking._id)) {
        res.sendStatus(409)
        return
      }
      await booking.updateOne({from, to})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: [
    createGetResourceFromURLMiddleware("booking", true),
    async (req, res) => {
      const booking = req.resources?.booking
      if (booking == null) {
        throw new Error("Unexpected undefined value: req.resources.booking.")
      }
      await booking.deleteOne()
      res.status(200).json({status: "OK"})
    },
  ],
  post: [
    createRequestBodyValidatorMiddleware(postBookingRequestBodySchema),
    async (req, res) => {
      const advert =
        req.resources?.advert ?? (await Advert.findById(req.body.advert))
      if (advert == null) {
        throw new Error(
          `Unexpected undefined object: advert with id "${
            req.body.advert as string
          }".`,
        )
      }
      const user = req.resources?.user?._id ?? req.user?.id
      if (user == null) {
        throw new Error("Unexpected undefined value: req.user.id.")
      }
      const from = moment(req.body.from, moment.ISO_8601)
      const to = moment(req.body.to, moment.ISO_8601)
      if (await Advert.isAlreadyBooked(advert, from, to)) {
        res.sendStatus(409)
        return
      }
      const booking = await new Booking({
        advert: advert._id,
        user,
        from,
        to,
      })
      res.setHeader("Location", `${apiURL}/booking/${booking._id as string}`)
      res.status(201).json({status: "Created"})
    },
  ],
}

export default id
