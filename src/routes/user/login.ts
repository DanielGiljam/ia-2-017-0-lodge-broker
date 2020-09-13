import {RequestHandler} from "express"

import User from "../../models/User"

const login: RequestHandler = async (req, res) => {
  const user = req.user ?? (await User.findById(req.body.email))
  if (user?.checkPassword(req.body.password) === true) {
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
}

export default login
