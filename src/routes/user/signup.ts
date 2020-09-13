import {RequestHandler} from "express"

import User from "../../models/User"

import login from "./login"

const signup: RequestHandler[] = [
  async (req, res, next) => {
    await new User(req.body).save().catch((error) => {
      console.error(error)
      res.sendStatus(500)
    })
    next()
  },
  login,
]

export default signup
