// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="./types/express-serve-static-core" />

import express from "express"
import morgan from "morgan"

import connectToDB from "./connectToDB"
import errorHandler from "./middlewares/errorHandler"
import jsonMiddleware from "./middlewares/jsonMiddleware"
import advert from "./routes/advert"
import adverts from "./routes/adverts"
import booking from "./routes/booking"
import bookings from "./routes/bookings"
import cabin from "./routes/cabin"
import cabins from "./routes/cabins"
import user from "./routes/user"
import {createTokenVerifyingMiddleware} from "./routes/user/token"
import users from "./routes/users"

const server = async (): Promise<void> => {
  await connectToDB()
  const port = process.env.PORT ?? 3000
  express()
    .use(morgan("dev"))
    .use(createTokenVerifyingMiddleware())
    .use(jsonMiddleware())
    .use("/user", user)
    .use("/users", users)
    .use("/cabin", cabin)
    .use("/cabins", cabins)
    .use("/advert", advert)
    .use("/adverts", adverts)
    .use("/booking", booking)
    .use("/bookings", bookings)
    .use(errorHandler())
    .listen(port, () => console.log(`Server listening on port ${port}.`))
}

server().catch((error) => {
  console.error(error)
  process.exit(1)
})
