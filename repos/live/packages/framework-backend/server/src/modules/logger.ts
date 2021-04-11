import pino from 'pino'
import pinoPretty from 'pino-pretty'

export const logger = pino({
  prettyPrint: {
    levelFirst: true,
  },
  prettifier: pinoPretty,
})
