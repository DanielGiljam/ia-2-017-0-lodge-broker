import {Router} from "express"

import login from "./login"
import logout from "./logout"
import signup from "./signup"

const user = Router()

user.post("/login", login)
user.post("/signup", signup)
user.get("/logout", logout)

export default user
