// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="./types/express-serve-static-core" />

import express from "express"
import morgan from "morgan"

import connectToDB from "./connectToDB"
import adverts from "./routes/adverts"
import bookings from "./routes/bookings"
import cabins from "./routes/cabins"
import user from "./routes/user"
import {createTokenVerifyingMiddleware} from "./routes/user/token"
import users from "./routes/users"

const server = async (): Promise<void> => {
  await connectToDB()
  const port = process.env.PORT ?? 3000
  express()
    .get("/", (_req, res) => res.send("ia-2-017-0-lodge-broker"))
    .use(morgan("dev"))
    .use(express.json())
    .use(createTokenVerifyingMiddleware())
    .use("/user", user)
    .use("/users", users)
    .use("/cabins", cabins)
    .use("/adverts", adverts)
    .use("/bookings", bookings)
    .listen(port, () => console.log(`Server listening on port ${port}.`))
}

server().catch((error) => {
  console.error(error)
  process.exit(1)
})
