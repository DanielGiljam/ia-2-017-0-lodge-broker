import {RequestHandler} from "express"

import User from "../../models/User"

const id: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-__v")
    if (user != null) {
      res.status(200).json({status: "OK", user})
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    res.sendStatus(404)
  }
}

export default id
