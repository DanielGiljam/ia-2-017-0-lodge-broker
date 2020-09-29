import {Router} from "express"

import User from "../../models/User"

const users = Router()

users.get("/", async (req, res) => {
  const allUsers = await User.find({}).exec()
  res.status(200).json({status: "OK", users: allUsers})
})

export default users
