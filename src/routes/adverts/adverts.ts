import {Router} from "express"

import Advert from "../../models/Advert"

const adverts = Router()

// TODO: make the adverts.get handler so that it's "pathname-agnostic"
adverts.get("/", async (req, res) => {
  const allAdverts =
    req.params.cabin != null
      ? await Advert.find().populate("bookings")
      : await Advert.find({cabin: req.params.cabin}).populate("bookings")
  res.status(200).json({status: "OK", adverts: allAdverts})
})

export default adverts
