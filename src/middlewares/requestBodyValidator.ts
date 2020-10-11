import AJV from "ajv"
import {RequestHandler} from "express"
import {JSONSchema7} from "json-schema"

const ajv = new AJV({allErrors: true, async: true})

const requestBodyValidator = (schema: JSONSchema7): RequestHandler => {
  const validateRequestBody = ajv.compile({...schema, $async: true})
  return async (req, res, next) => {
    try {
      await validateRequestBody(req.body)
      next()
    } catch (error) {
      if (error instanceof AJV.ValidationError) {
        console.error(error)
        res.status(400).json({status: "Bad request", errors: error.errors})
      } else {
        next(error)
      }
    }
  }
}

export default requestBodyValidator
