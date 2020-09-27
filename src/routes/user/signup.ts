import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import User from "../../models/User"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {createAccessToken, createRefreshToken} from "./token"

const loginRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    email: {type: "string", format: "email"},
    firstName: {type: "string"},
    lastName: {type: "string"},
    password: {type: "string", minLength: 12},
  },
  required: ["email", "firstName", "lastName", "password"],
}

const signup: RequestHandler[] = [
  createRequestBodyValidatorMiddleware(loginRequestBodySchema),
  async (req, res) => {
    const {email, firstName, lastName, password} = req.body
    if ((await User.findById(email)) != null) {
      res.sendStatus(409)
    } else {
      try {
        const user = await new User({
          email,
          firstName,
          lastName,
          password,
        }).save()
        const accessToken = createAccessToken(user.email)
        const refreshToken = createRefreshToken(user.email)
        res.status(200).json({accessToken, refreshToken})
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    }
  },
]

export default signup
