import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

import requestBodyValidator from "../../middlewares/requestBodyValidator"

import {invalidateRefreshToken} from "./token"

const logoutRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    refreshToken: {type: "string"},
  },
  required: ["refreshToken"],
}

const logout: RequestHandler[] = [
  requestBodyValidator(logoutRequestBodySchema),
  async (req, res) => {
    const refreshToken = req.body.refreshToken
    await invalidateRefreshToken(refreshToken)
    res.status(200).json({status: "OK"})
  },
]

export default logout
