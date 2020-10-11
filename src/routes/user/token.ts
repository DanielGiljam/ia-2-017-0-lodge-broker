import {randomBytes} from "crypto"

import {ErrorRequestHandler, RequestHandler} from "express"
import expressJWT from "express-jwt"
import {JSONSchema7} from "json-schema"
import jwt from "jsonwebtoken"

import requestBodyValidator from "../../middlewares/requestBodyValidator"
import RefreshToken from "../../models/RefreshToken"

const tokenRequestBodySchema: JSONSchema7 = {
  type: "object",
  properties: {
    refreshToken: {type: "string"},
  },
  required: ["refreshToken"],
}

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? randomBytes(64).toString("hex")
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET ?? randomBytes(64).toString("hex")

export const createAccessToken = (id: string): string =>
  jwt.sign({id}, accessTokenSecret, {expiresIn: "15m"})

export const createRefreshToken = async (id: string): Promise<string> => {
  const refreshToken = await new RefreshToken({
    refreshToken: jwt.sign({id}, refreshTokenSecret),
  }).save()
  return refreshToken.refreshToken
}

export const invalidateRefreshToken = async (
  refreshToken: string,
): Promise<void> => {
  await RefreshToken.findOneAndDelete({refreshToken})
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
  (error, _req, res, next) => {
    if (error.name === "UnauthorizedError") {
      res.status(401).json({status: "Unauthorized"})
      return
    }
    next(error)
  },
]

const token: RequestHandler[] = [
  requestBodyValidator(tokenRequestBodySchema),
  async (req, res) => {
    const refreshToken = req.body.refreshToken
    if ((await RefreshToken.findOne({refreshToken}).exec()) != null) {
      jwt.verify(
        refreshToken,
        refreshTokenSecret,
        (error: any, payload: any) => {
          if (error != null) {
            console.error(error)
            res.status(401).json({status: "Unauthorized"})
          } else {
            const accessToken = createAccessToken(payload.id)
            res.status(200).json({status: "OK", accessToken})
          }
        },
      )
    } else {
      res.status(401).json({status: "Unauthorized"})
    }
  },
]

export default token
