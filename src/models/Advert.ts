import {Moment} from "moment"
import {Document, Model, Schema, model} from "mongoose"

import {IBooking} from "./Booking"
import {IUser} from "./User"

const AdvertSchema = new Schema({
  cabin: {
    type: Schema.Types.ObjectId,
    ref: "Cabin",
    index: true,
    required: true,
  },
  advertiser: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  availableFrom: {type: Date, index: true, required: true},
  availableTo: {type: Date, index: true, required: true},
})

interface IAdvertSchema extends Document {
  availableFrom: Date
  availableTo: Date
}

AdvertSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "advert",
})

interface IAdvertBase extends IAdvertSchema {}

export interface IAdvert extends IAdvertBase {
  cabin: IAdvert["_id"]
  advertiser: IUser["_id"]
  bookings: Array<IBooking["_id"]>
}

export interface IAdvertPopulated extends IAdvertBase {
  cabin: IAdvert
  advertiser: IUser
  bookings: IBooking[]
}

AdvertSchema.statics.isAlreadyBooked = async (
  advert: IAdvert,
  from: Moment,
  to: Moment,
  idOfBookingToExclude?: string,
): Promise<boolean> => {
  const advertPopulated = (await advert.populate(
    "bookings",
  )) as IAdvertPopulated
  let bookings: IBooking[]
  if (idOfBookingToExclude != null) {
    const indexOfAdvertToExclude = advertPopulated.bookings.findIndex(
      (booking) => booking._id === idOfBookingToExclude,
    )
    bookings = advertPopulated.bookings
      .splice(0)
      .slice(indexOfAdvertToExclude, 1)
  } else {
    bookings = advertPopulated.bookings
  }
  return bookings.some(
    (booking) =>
      from.isBetween(booking.from, booking.to, undefined, "[]") ||
      to.isBetween(booking.from, booking.to, undefined, "[]"),
  )
}

export interface IAdvertModel extends Model<IAdvert> {
  isAlreadyBooked: (
    advert: IAdvert,
    from: Moment,
    to: Moment,
    idOfBookingToExclude?: string,
  ) => Promise<boolean>
}

const Advert = model<IAdvert, IAdvertModel>("Advert", AdvertSchema)

export default Advert
