import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import requestBodyValidator from "../../middlewares/requestBodyValidator"
import User from "../../models/User"

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
  requestBodyValidator(signupRequestBodySchema),
  async (req, res, next) => {
    const {email, firstName, lastName, password} = req.body
    if ((await User.findOne({email}).exec()) != null) {
      res.status(409).json({status: "Conflict"})
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
        next(error)
      }
    }
  },
]

export default signup
