import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import Cabin from "../../models/Cabin"
import createAllowOnlyResourceAuthorMiddleware from "../../util/createGetResourceFromURLMiddleware"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

// TODO: improve postCabinRequestBodySchema so that it's possible to POST from /cabin or /user/:user/cabin
const postCabinRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    address: {
      type: "object",
      properties: {
        line1: {type: "string"},
        line2: {type: "string"},
        zipCode: {type: "string"},
        city: {type: "string"},
      },
      required: ["line1", "zipCode", "city"],
    },
    size: {type: "number"},
    sauna: {type: "boolean"},
    beach: {type: "boolean"},
  },
  required: ["address", "size"],
}

const squashAddress = ({
  line1,
  line2,
  zipCode,
  city,
}: {
  line1: string
  line2?: string
  zipCode: string
  city: string
}): string => `${line1}${line2 != null ? " " + line2 : ""}, ${zipCode} ${city}`

const apiURL = process.env.API_URL ?? "http://localhost:3000"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const cabin = await Cabin.findById(req.params.cabin)
        .populate("owner")
        .populate({path: "adverts", populate: {path: "bookings"}})
      if (cabin != null) {
        res.status(200).json({status: "OK", cabin})
      } else {
        res.sendStatus(404)
      }
    } catch (error) {
      res.sendStatus(404)
    }
  },
  patch: [
    createAllowOnlyResourceAuthorMiddleware("cabin", true),
    createRequestBodyValidatorMiddleware(postCabinRequestBodySchema),
    async (req, res) => {
      const {address, size, sauna, beach} = req.body
      const squashedAddress = squashAddress(address)
      const cabin = req.resources?.cabin
      if (cabin == null) {
        throw new Error("Unexpected undefined value: req.resource.")
      }
      if (
        cabin.address.squashed !== squashedAddress &&
        (await Cabin.findOne({"address.squashed": squashAddress})) != null
      ) {
        res.sendStatus(409)
        return
      }
      await cabin.replaceOne({
        address: {...address, squashed: squashedAddress},
        owner: req.user?.id,
        size,
        sauna,
        beach,
      })
      res.status(200).json({status: "OK"})
    },
  ],
  delete: [
    createAllowOnlyResourceAuthorMiddleware("cabin", true),
    async (req, res) => {
      const cabin = req.resources?.cabin
      if (cabin == null) {
        throw new Error("Unexpected undefined value: req.resource.")
      }
      await cabin.deleteOne()
      res.status(200).json({status: "OK"})
    },
  ],
  post: [
    createRequestBodyValidatorMiddleware(postCabinRequestBodySchema),
    async (req, res) => {
      const {address, size, sauna, beach} = req.body
      const squashedAddress = squashAddress(address)
      if ((await Cabin.findOne({"address.squashed": squashAddress})) != null) {
        res.sendStatus(409)
      } else {
        const cabin = await new Cabin({
          address: {...address, squashed: squashedAddress},
          owner: req.user?.id,
          size,
          sauna,
          beach,
        })
        res.setHeader("Location", `${apiURL}/cabin/${cabin._id as string}`)
        res.status(201).json({status: "Created"})
      }
    },
  ],
}

export default id
