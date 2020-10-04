import {Router} from "express"

import Booking from "../../models/Booking"

const bookings = Router()

// TODO: make the bookings.get handler so that it's "pathname-agnostic"
bookings.get("/", async (req, res) => {
  const filter = req.params.advert != null ? {advert: req.params.advert} : {}
  const allBookings = await Booking.find(
    {user: req.user?.id, ...filter},
    "-user",
  ).populate({
    path: "advert",
    populate: [{path: "cabin"}, {path: "advertiser"}],
  })
  res.status(200).json({status: "OK", bookings: allBookings})
})

export default bookings
