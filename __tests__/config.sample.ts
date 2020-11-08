import { ConstructData } from '../src/types'

export const data: ConstructData = {
  console: { enabled: true },
  gcp: {
    enabled: true,
    projectid: '',
    logname: ''
  },
  sentry: {
    enabled: true,
    config: {
      dsn:
        '',
      debug: true,
      release: process.env.npm_package_version
    }
  },
  file: {
    enabled: true,
    config: {
      logDirectory: 'logs',
      fileNamePattern: `console.log`,
      dateFormat: 'YYYY.MMM.DD'
    }
  }
}
