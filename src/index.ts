import express from "express"

import connectToDB from "./connectToDB"

const server = async (): Promise<void> => {
  await connectToDB()
  const port = process.env.PORT ?? 3000
  express()
    .get("/", (_req, res) => res.send("ia-2-017-0-lodge-broker"))
    .listen(port, () => console.log(`Server listening on port ${port}.`))
}

server().catch((error) => {
  console.error(error)
  process.exit(1)
})
