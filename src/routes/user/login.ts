import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import User from "../../models/User"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {createAccessToken, createRefreshToken} from "./token"

const loginRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    email: {type: "string", format: "email"},
    password: {type: "string"},
  },
  required: ["email", "password"],
}

const login: RequestHandler[] = [
  createRequestBodyValidatorMiddleware(loginRequestBodySchema),
  async (req, res) => {
    const user = await User.findOne({email: req.body.email}, "+password").exec()
    if (user?.checkPassword(req.body.password) === true) {
      const accessToken = createAccessToken(user._id)
      const refreshToken = await createRefreshToken(user._id)
      res.status(200).json({status: "OK", accessToken, refreshToken})
    } else {
      res.sendStatus(401)
    }
  },
]

export default login
