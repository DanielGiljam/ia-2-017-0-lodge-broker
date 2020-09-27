import {Document, Schema, model} from "mongoose"

const RefreshTokenSchema = new Schema({
  refreshToken: {type: String, index: true, required: true, unique: true},
})

interface IRefreshTokenSchema extends Document {
  refreshToken: string
}

interface IRefreshTokenBase extends IRefreshTokenSchema {}

export interface IRefreshToken extends IRefreshTokenBase {}

const RefreshToken = model<IRefreshToken>("RefreshToken", RefreshTokenSchema)

export default RefreshToken
