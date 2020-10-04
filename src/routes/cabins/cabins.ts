import {Router} from "express"

import Cabin from "../../models/Cabin"

const cabins = Router()

// TODO: make the adverts.get handler so that it's "pathname-agnostic"
cabins.get("/", async (_req, res) => {
  const allCabins = await Cabin.find()
    .populate("owner")
    .populate({path: "adverts", populate: {path: "bookings"}})
  res.status(200).json({status: "OK", cabins: allCabins})
})

export default cabins
