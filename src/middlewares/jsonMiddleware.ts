import {ErrorRequestHandler, RequestHandler, json} from "express"

const jsonMiddleware = (): [RequestHandler, ErrorRequestHandler] => [
  json(),
  (error, _req, res, next) => {
    if (error.name === "SyntaxError") {
      res.status(400).json({status: "Bad request", error: error.message})
      return
    }
    next(error)
  },
]

export default jsonMiddleware
