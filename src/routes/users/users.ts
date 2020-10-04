import {Router} from "express"

import User from "../../models/User"

const users = Router()

users.get("/", async (_req, res) => {
  const allUsers = await User.find()
  res.status(200).json({status: "OK", users: allUsers})
})

export default users
