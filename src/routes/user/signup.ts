import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import User from "../../models/User"
import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {createAccessToken, createRefreshToken} from "./token"

export const signupRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    email: {type: "string", format: "email"},
    firstName: {type: "string"},
    lastName: {type: "string"},
    password: {type: "string", minLength: 12},
  },
  required: ["email", "firstName", "lastName", "password"],
}

const apiURL = process.env.API_URL ?? "http://localhost:3000"

const signup: RequestHandler[] = [
  createRequestBodyValidatorMiddleware(signupRequestBodySchema),
  async (req, res) => {
    const {email, firstName, lastName, password} = req.body
    if ((await User.findOne({email}).exec()) != null) {
      res.sendStatus(409)
    } else {
      try {
        const user = await new User({
          email,
          firstName,
          lastName,
          password,
        }).save()
        const accessToken = createAccessToken(user._id)
        const refreshToken = await createRefreshToken(user._id)
        res.setHeader("Location", `${apiURL}/user/${user._id as string}`)
        res.status(201).json({status: "Created", accessToken, refreshToken})
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    }
  },
]

export default signup
