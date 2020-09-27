import {Router} from "express"

import login from "./login"
import logout from "./logout"
import signup from "./signup"
import token from "./token"

const user = Router()

user.post("/login", login)
user.post("/token", token)
user.post("/signup", signup)
user.post("/logout", logout)

export default user
