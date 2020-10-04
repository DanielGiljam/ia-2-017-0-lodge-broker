import {Document, Schema, model} from "mongoose"

import {IAdvert} from "./Advert"
import {IUser} from "./User"

const BookingSchema = new Schema({
  advert: {
    type: Schema.Types.ObjectId,
    ref: "Advert",
    index: true,
    required: true,
  },
  user: {type: Schema.Types.ObjectId, ref: "User", index: true, required: true},
  from: {type: Date, index: true, required: true},
  to: {type: Date, index: true, required: true},
})

interface IBookingSchema extends Document {
  from: Date
  to: Date
}

interface IBookingBase extends IBookingSchema {}

export interface IBooking extends IBookingBase {
  advert: IAdvert["_id"]
  user?: IUser["_id"]
}

export interface IBookingPopulated extends IBookingBase {
  advert: IAdvert
  user?: IUser
}

const Booking = model<IBooking>("Booking", BookingSchema)

export default Booking
