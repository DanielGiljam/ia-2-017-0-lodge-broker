import {compareSync, genSaltSync, hashSync} from "bcrypt"
import {Document, Schema, model} from "mongoose"

import {IAdvert} from "./Advert"
import {IBooking} from "./Booking"
import {ICabin} from "./Cabin"

const UserSchema = new Schema({
  email: {type: String, index: true, required: true, unique: true},
  firstName: {type: String, index: true, required: true},
  lastName: {type: String, index: true, required: true},
  password: {
    type: String,
    required: true,
    select: false,
    set: (password: string) => hashSync(password, genSaltSync()),
  },
})

interface IUserSchema extends Document {
  email: string
  firstName: string
  lastName: string
  password?: string
}

UserSchema.virtual("cabins", {
  ref: "Cabin",
  localField: "_id",
  foreignField: "owner",
})

UserSchema.virtual("adverts", {
  ref: "Advert",
  localField: "_id",
  foreignField: "advertiser",
})

UserSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "user",
})

UserSchema.method("checkPassword", function checkPassword(
  this: IUserSchema,
  password: string,
) {
  if (this.password == null) {
    throw new Error("Unable to check password. Password isn't projected.")
  }
  return compareSync(password, this.password)
})

interface IUserBase extends IUserSchema {
  checkPassword: (password?: string) => boolean
}

export interface IUser extends IUserBase {
  cabins: Array<ICabin["_id"]>
  adverts: Array<IAdvert["_id"]>
  bookings?: Array<IBooking["_id"]>
}

export interface IUserPopulated extends IUserBase {
  cabins: ICabin
  adverts: IAdvert
  bookings?: IBooking
}

const User = model<IUser>("User", UserSchema)

export default User
