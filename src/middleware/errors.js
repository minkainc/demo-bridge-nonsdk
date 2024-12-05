// Necessary to properly handle async errors
export function asyncErrorWrapper(func) {
  return async (req, res, next) => {
    try {
      return await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// This needs to go after all route handlers to log the errors
// and send the appropriate response to the client.
export function handleErrors(err, req, res, next) {
  console.log(err)
  res.sendStatus(500)
}
