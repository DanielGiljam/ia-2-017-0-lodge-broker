import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

import {invalidateRefreshToken} from "./token"

const logoutRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    refreshToken: {type: "string"},
  },
  required: ["refreshToken"],
}

const logout: RequestHandler[] = [
  createRequestBodyValidatorMiddleware(logoutRequestBodySchema),
  async (req, res) => {
    const refreshToken = req.body.refreshToken
    if (refreshToken != null) {
      invalidateRefreshToken(refreshToken)
      res.sendStatus(200)
    } else {
      res.sendStatus(400)
    }
  },
]

export default logout
