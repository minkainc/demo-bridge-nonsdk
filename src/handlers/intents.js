import { validateEntity } from '../validators.js'
import { saveIntent } from './common.js'

export async function updateIntent(req, res) {
  validateEntity(req.body)
  const handle = req.params.handle

  if (handle !== req.body?.data?.handle) {
    throw new Error('Request parameter handle not equal to entry handle.')
  }
  await saveIntent(req.body)

  res.sendStatus(200)
}
