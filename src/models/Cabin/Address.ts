import {Document, Schema, model} from "mongoose"

export const AddressSchema = new Schema({
  line1: {type: String, index: true, required: true},
  line2: {type: String, index: true},
  zipCode: {type: String, index: true, required: true},
  city: {type: String, index: true, required: true},
  squashed: {type: String, index: true, required: true, unique: true},
})

export interface IAddressSchema extends Document {
  line1: string
  line2?: string
  zipCode: string
  city: string
  squashed: string
}

interface IAddressBase extends IAddressSchema {}

export interface IAddress extends IAddressBase {}

const Address = model<IAddress>("Address", AddressSchema)

export default Address
