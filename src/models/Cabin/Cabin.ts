import {Moment} from "moment"
import {Document, Model, Schema, model} from "mongoose"

import {IAdvert} from "../Advert"
import {IUser} from "../User"

import {AddressSchema, IAddressSchema} from "./Address"

const CabinSchema = new Schema({
  address: {type: AddressSchema, index: true, required: true},
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  size: {type: Number, index: true, required: true},
  sauna: {type: Boolean, default: false, index: true},
  beach: {type: Boolean, default: false, index: true},
})

interface ICabinSchema extends Document {
  address: IAddressSchema
  size: number
  sauna: boolean
  beach: boolean
}

CabinSchema.virtual("adverts", {
  ref: "Advert",
  localField: "_id",
  foreignField: "cabin",
})

interface ICabinBase extends ICabinSchema {}

export interface ICabin extends ICabinBase {
  owner: IUser["_id"]
  adverts: Array<IAdvert["_id"]>
}

export interface ICabinPopulated extends ICabinBase {
  owner: IUser
  adverts: IAdvert[]
}

CabinSchema.statics.isUnavailable = async (
  cabin: ICabin,
  from: Moment,
  to: Moment,
  idOfAdvertToExclude?: string,
): Promise<boolean> => {
  const cabinPopulated = (await cabin.populate("adverts")) as ICabinPopulated
  let adverts: IAdvert[]
  if (idOfAdvertToExclude != null) {
    const indexOfAdvertToExclude = cabinPopulated.adverts.findIndex(
      (advert) => advert._id === idOfAdvertToExclude,
    )
    adverts = cabinPopulated.adverts.splice(0).slice(indexOfAdvertToExclude, 1)
  } else {
    adverts = cabinPopulated.adverts
  }
  // prettier-ignore
  return adverts.some(
    (advert) =>
      from.isBetween(
        advert.availableFrom,
        advert.availableTo,
        undefined,
        "[]",
      ) ||
      to.isBetween(
        advert.availableFrom,
        advert.availableTo,
        undefined,
        "[]"
      ),
  )
}

export interface ICabinModel extends Model<ICabin> {
  isUnavailable: (
    cabin: ICabin,
    availableFrom: Moment,
    availableTo: Moment,
    idOfAdvertToExclude?: string,
  ) => Promise<boolean>
}

const Cabin = model<ICabin, ICabinModel>("Cabin", CabinSchema)

export default Cabin
