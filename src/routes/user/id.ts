import {RequestHandler} from "express"

import requestBodyValidator from "../../middlewares/requestBodyValidator"
import User from "../../models/User"

import {signupRequestBodySchema} from "./signup"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const user = await User.findById(req.params.user ?? req.user?.id)
      if (user != null) {
        res.status(200).json({status: "OK", user})
      } else {
        res.status(404).json({status: "Not Found"})
      }
    } catch (error) {
      res.status(404).json({status: "Not Found"})
    }
  },
  put: [
    requestBodyValidator(signupRequestBodySchema),
    async (req, res, next) => {
      const {email, firstName, lastName, password} = req.body
      const user = await User.findById(req.user?.id)
      if (user == null) {
        next(new Error("Unable to find authenticated user."))
        return
      }
      if (
        user.email !== email &&
        (await User.findOne({email}).exec()) != null
      ) {
        res.status(409).json({status: "Conflict"})
        return
      }
      await user.replaceOne({email, firstName, lastName, password})
      res.status(200).json({status: "OK"})
    },
  ],
  delete: async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user?.id)
    if (user == null) {
      next(new Error("Unable to find authenticated user."))
    } else {
      res.status(200).json({status: "OK"})
    }
  },
}

export default id
