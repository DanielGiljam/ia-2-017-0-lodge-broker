import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"
import moment from "moment"

import requestBodyValidator from "../../middlewares/requestBodyValidator"
import resourceExtractor from "../../middlewares/resourceExtractor"
import Advert from "../../models/Advert"
import Booking from "../../models/Booking"

// TODO: improve postBookingRequestBodySchema so that it's possible to POST from /booking or /user/:user/booking
const postBookingRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    from: {type: "string", format: "date"},
    to: {type: "string", format: "date"},
  },
  required: ["from", "to"],
}

const apiURL = process.env.API_URL ?? "http://localhost:3000"

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
        res.status(404).json({status: "Not Found"})
      }
    } catch (error) {
      res.status(404).json({status: "Not Found"})
    }
  },
  patch: [
    resourceExtractor("booking", true),
    requestBodyValidator(postBookingRequestBodySchema),
    async (req, res, next) => {
      const booking = req.resources?.booking
      if (booking == null) {
        next(new Error("Unexpected undefined value: req.resources.booking."))
        return
      }
      const advert =
        req.resources?.advert ?? (await booking.populate("advert")).advert
      const from = moment(req.body.from, moment.ISO_8601)
      const to = moment(req.body.to, moment.ISO_8601)
      if (await Advert.isAlreadyBooked(advert, from, to, booking._id)) {
        res.status(409).json({status: "Conflict"})
        return
      }
      await booking.updateOne({from, to})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: [
    resourceExtractor("booking", true),
    async (req, res, next) => {
      const booking = req.resources?.booking
      if (booking == null) {
        next(new Error("Unexpected undefined value: req.resources.booking."))
        return
      }
      await booking.deleteOne()
      res.status(200).json({status: "OK"})
    },
  ],
  post: [
    requestBodyValidator(postBookingRequestBodySchema),
    async (req, res, next) => {
      const advert =
        req.resources?.advert ?? (await Advert.findById(req.body.advert))
      if (advert == null) {
        next(
          new Error(
            `Unexpected undefined object: advert with id "${
              req.body.advert as string
            }".`,
          ),
        )
        return
      }
      const user = req.resources?.user?._id ?? req.user?.id
      if (user == null) {
        next(new Error("Unexpected undefined value: req.user.id."))
        return
      }
      const from = moment(req.body.from, moment.ISO_8601)
      const to = moment(req.body.to, moment.ISO_8601)
      if (await Advert.isAlreadyBooked(advert, from, to)) {
        res.status(409).json({status: "Conflict"})
        return
      }
      const booking = await new Booking({
        advert: advert._id,
        user,
        from,
        to,
      }).save()
      res.setHeader("Location", `${apiURL}/booking/${booking._id as string}`)
      res.status(201).json({status: "Created"})
    },
  ],
}

export default id
