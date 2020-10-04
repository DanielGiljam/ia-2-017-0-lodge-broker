import {IAdvert} from "../models/Advert"
import {IBooking} from "../models/Booking"
import {ICabin} from "../models/Cabin"
import {IUser} from "../models/User"

declare module "express-serve-static-core" {
  export interface Request {
    user?: IUser
    resources?: {
      user?: IUser
      cabin?: ICabin
      advert?: IAdvert
      booking?: IBooking
      [key: string]: IUser | ICabin | IAdvert | IBooking
    }
  }
}
