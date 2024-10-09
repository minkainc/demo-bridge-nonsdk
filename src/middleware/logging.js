// This function will get called before all of our request
// handlers and log the request.
export function logRequest(req, res, next) {
    console.log(`RECEIVED ${req.method} ${req.url}`)
    console.log(JSON.stringify(req.body, null, 2))
    console.log("-------------------------------------------------------------")
    next()
  }