import AJV from "ajv"
import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

const ajv = new AJV({allErrors: true, async: true})

const createRequestBodyValidatorMiddleware = (
  schema: JSONSchema7,
): RequestHandler => {
  const validateRequestBody = ajv.compile({...schema, $async: true})
  return async (req, res, next) => {
    try {
      await validateRequestBody(req.body)
      next()
    } catch (error) {
      if (error instanceof AJV.ValidationError) {
        res.status(400).json({status: "Bad request", errors: error.errors})
      } else {
        console.error(error)
        res.sendStatus(500)
      }
    }
  }
}

export default createRequestBodyValidatorMiddleware
