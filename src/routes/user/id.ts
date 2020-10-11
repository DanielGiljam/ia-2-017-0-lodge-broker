import {RequestHandler} from "express"

import User from "../../models/User"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {signupRequestBodySchema} from "./signup"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const user = await User.findById(req.params.user ?? req.user?.id)
      if (user != null) {
        res.status(200).json({status: "OK", user})
      } else {
        res.sendStatus(404)
      }
    } catch (error) {
      res.sendStatus(404)
    }
  },
  put: [
    createRequestBodyValidatorMiddleware(signupRequestBodySchema),
    async (req, res) => {
      const {email, firstName, lastName, password} = req.body
      const user = await User.findById(req.user?.id)
      if (user == null) {
        throw new Error("Unable to find authenticated user.")
      }
      if (
        user.email !== email &&
        (await User.findOne({email}).exec()) != null
      ) {
        res.sendStatus(409)
        return
      }
      await user.replaceOne({email, firstName, lastName, password})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: async (req, res) => {
    const user = await User.findByIdAndDelete(req.user?.id)
    if (user == null) {
      throw new Error("Unable to find authenticated user.")
    } else {
      res.status(200).json({status: "OK"})
    }
  },
}

export default id
