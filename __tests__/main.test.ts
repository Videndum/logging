import * as index from '../src/index'
import { data } from './config'

test('test logger builds', async () => {
  const logger = await new index.Log(data)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.shutdown()
})

test('logs to console', async () => {
  let config = { console: data.console }
  const logger = new index.Log(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log({ raw: 'Successfully built logging class' }, 2)
})

test('logs to sentry', async () => {
  let config = { sentry: data.sentry }
  const logger = new index.Log(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log({ raw: 'Successfully logged to sentry' }, 6)
})

test('logs to gcp', async () => {
  let config = { gcp: data.gcp }
  const logger = new index.Log(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log({ raw: 'Successfully logged to gcp' }, 2)
})

test('logs to file', async () => {
  let config = { file: data.file }
  const logger = new index.Log(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log({ raw: 'Successfully logged to file' }, 2)
})
