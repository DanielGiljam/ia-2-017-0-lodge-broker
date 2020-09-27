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
    const user = await User.findById(req.body.email)
    if (user?.checkPassword(req.body.password) === true) {
      const accessToken = createAccessToken(user.email)
      const refreshToken = createRefreshToken(user.email)
      res.status(200).json({accessToken, refreshToken})
    } else {
      res.sendStatus(401)
    }
  },
]

export default login
