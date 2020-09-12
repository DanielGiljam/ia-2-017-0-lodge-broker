import mongoose from "mongoose"

import {allFulfilled, requireEnvVar} from "./util"

const credentialsToEnvVarNames = [
  ["rootUsername", "MONGO_INITDB_ROOT_USERNAME"],
  ["rootPassword", "MONGO_INITDB_ROOT_PASSWORD"],
  ["containerName", "MONGO_CONTAINER_NAME"],
  ["dbName", "MONGO_INITDB_DATABASE"],
]

const connectToDB = async (): Promise<void> => {
  const {
    rootUsername,
    rootPassword,
    containerName,
    dbName,
  } = Object.fromEntries(
    await allFulfilled(
      credentialsToEnvVarNames.map(
        async ([key, envVarName]): Promise<[string, string]> => [
          key,
          requireEnvVar(envVarName),
        ],
      ),
    ).catch(() => {
      throw new Error("Required environment variables were undefined.")
    }),
  )
  await mongoose.connect(
    `mongodb://${rootUsername}:${rootPassword}@${containerName}/${dbName}?authMechanism=SCRAM-SHA-1&authSource=admin`,
  )
  console.log("Successfully connected to MongoDB.")
}

export default connectToDB
