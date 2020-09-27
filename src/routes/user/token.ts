import {randomBytes} from "crypto"

import {ErrorRequestHandler, RequestHandler} from "express"
import expressJWT from "express-jwt"
import {JSONSchema7} from "json-schema"
import jwt from "jsonwebtoken"

import createRequestBodyValidatorMiddleware from "../../util/createRequestBodyValidatorMiddleware"

const tokenRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    refreshToken: {type: "string"},
  },
  required: ["refreshToken"],
}

const accessTokenSecret = randomBytes(64).toString("hex")
const refreshTokenSecret = randomBytes(64).toString("hex")

const refreshTokens: Set<string> = new Set()

export const createAccessToken = (email: string): string =>
  jwt.sign({email}, accessTokenSecret, {expiresIn: "15m"})

export const createRefreshToken = (email: string): string => {
  const refreshToken = jwt.sign({email}, refreshTokenSecret)
  refreshTokens.add(refreshToken)
  return refreshToken
}

export const invalidateRefreshToken = (refreshToken: string): void => {
  refreshTokens.delete(refreshToken)
}

export const createTokenVerifyingMiddleware = (): [
  RequestHandler,
  ErrorRequestHandler,
] => [
  expressJWT({
    secret: accessTokenSecret,
    algorithms: ["HS256"],
  }).unless({
    path: ["/user/login", "/user/token", "/user/signup", "/user/logout"],
  }),
  (error, _req, res, _next) => {
    if (error.name === "UnauthorizedError") {
      res.sendStatus(401)
    }
  },
]

const token: RequestHandler[] = [
  createRequestBodyValidatorMiddleware(tokenRequestBodySchema),
  async (req, res) => {
    const refreshToken = req.body.refreshToken
    if (refreshTokens.has(refreshToken)) {
      jwt.verify(
        refreshToken,
        refreshTokenSecret,
        (error: any, payload: any) => {
          if (error != null) {
            console.error(error)
            res.sendStatus(401)
          }
          const accessToken = createAccessToken(payload.email)
          res.status(200).json({accessToken})
        },
      )
    } else {
      res.sendStatus(401)
    }
  },
]

export default token
