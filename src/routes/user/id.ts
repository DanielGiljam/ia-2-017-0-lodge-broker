import {RequestHandler} from "express"

import User from "../../models/User"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {signupRequestBodySchema} from "./signup"

const id: {[key: string]: RequestHandler | RequestHandler[]} = {
  get: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
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
      try {
        const {email, firstName, lastName, password} = req.body
        const user = await User.findById(req.params.id)
        if (user == null) {
          res.sendStatus(404)
          return
        }
        if (
          user.email !== email &&
          (await User.findOne({email}).exec()) != null
        ) {
          res.sendStatus(409)
          return
        }
        try {
          await user.replaceOne({email, firstName, lastName, password})
          res.status(200).json({status: "OK"})
        } catch (error) {
          console.error(error)
          res.sendStatus(500)
        }
      } catch (error) {
        res.sendStatus(404)
      }
    },
  ],
  delete: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      if (user == null) {
        res.sendStatus(404)
      } else {
        res.status(200).json({status: "OK"})
      }
    } catch (error) {
      res.sendStatus(404)
    }
  },
}

export default id
