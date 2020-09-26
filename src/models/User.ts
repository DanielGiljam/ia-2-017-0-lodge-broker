import {compareSync, genSaltSync, hashSync} from "bcrypt"
import {Document, Schema, model} from "mongoose"

const UserSchema = new Schema({
  _id: {type: String, required: true, alias: "email"},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  password: {
    type: String,
    required: true,
    set: (password: string) => hashSync(password, genSaltSync()),
  },
})

UserSchema.index({firstName: 1})
UserSchema.index({lastName: 1})

interface IUserSchema extends Document {
  _id: string
  firstName: string
  lastName: string
  password: string
}

UserSchema.method("checkPassword", function checkPassword(
  this: IUserSchema,
  password: string,
) {
  return compareSync(password, this.password)
})

interface IUserBase extends IUserSchema {
  email: string
  checkPassword: (password?: string) => boolean
}

export interface IUser extends IUserBase {}

const User = model<IUser>("User", UserSchema)

export default User
