import {ErrorRequestHandler} from "express"

const errorHandler = (): ErrorRequestHandler => async (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error)
  res.status(500).json({status: "Internal Server Error"})
}

export default errorHandler
