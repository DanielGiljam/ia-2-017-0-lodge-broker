export const isNonEmptyString = (any: any): any is string =>
  typeof any === "string" && any.length !== 0

export const requireEnvVar = (envVarName: string): string => {
  const envVar = process.env[envVarName]
  if (isNonEmptyString(envVar)) {
    return envVar
  } else {
    throw new Error(`The environment variable ${envVarName} was not defined.`)
  }
}

export const allFulfilled = async <T>(
  promises: Array<Promise<T>>,
): Promise<T[]> => {
  const results = await Promise.allSettled(promises)
  const values: T[] = []
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      values.push(result.value)
    } else {
      console.error(result.reason.message)
    }
  })
  if (values.length === results.length) {
    return values
  } else {
    throw new Error("Promises rejected.")
  }
}
