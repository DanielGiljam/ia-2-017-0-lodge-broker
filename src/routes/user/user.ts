import {Router} from "express"

import id from "./id"
import login from "./login"
import logout from "./logout"
import signup from "./signup"
import token from "./token"

const user = Router()

user.post("/login", login)
user.post("/token", token)
user.post("/signup", signup)
user.post("/logout", logout)
user.get("/:id", id)

export default user
