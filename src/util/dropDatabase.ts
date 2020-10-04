import {RequestHandler} from "express"
import mongoose from "mongoose"

const dropDatabase: RequestHandler = async (req, res) => {
  try {
    await mongoose.connection.dropDatabase()
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
  res.status(200).json({status: "OK"})
}

export default dropDatabase
