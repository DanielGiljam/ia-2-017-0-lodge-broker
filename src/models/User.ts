import {compareSync, genSaltSync, hashSync} from "bcrypt"
import {Document, Schema, model} from "mongoose"

const UserSchema = new Schema({
  email: {type: String, index: true, required: true, unique: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  password: {
    type: String,
    required: true,
    select: false,
    set: (password: string) => hashSync(password, genSaltSync()),
  },
})

UserSchema.index({firstName: 1})
UserSchema.index({lastName: 1})

interface IUserSchema extends Document {
  email: string
  firstName: string
  lastName: string
  password?: string
}

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

export interface IUser extends IUserBase {}

const User = model<IUser>("User", UserSchema)

export default User
