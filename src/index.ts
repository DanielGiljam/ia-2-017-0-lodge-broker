// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="./types/express-serve-static-core" />

import express from "express"

import connectToDB from "./connectToDB"
import user from "./routes/user"

const server = async (): Promise<void> => {
  await connectToDB()
  const port = process.env.PORT ?? 3000
  express()
    .get("/", (_req, res) => res.send("ia-2-017-0-lodge-broker"))
    .use(express.json())
    .use("/user", user)
    .listen(port, () => console.log(`Server listening on port ${port}.`))
}

server().catch((error) => {
  console.error(error)
  process.exit(1)
})
