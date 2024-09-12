import { useContext } from 'react'
import ConfigurationContext from '../context/Configuration'

const ConfigurableValues = () => {
  const configuration = useContext(ConfigurationContext)
  // const SERVER_URL = 'https://enatega-multivendor.up.railway.app'
  // const WS_SERVER_URL = 'wss://enatega-multivendor.up.railway.app'
  // const SERVER_URL = 'http://192.168.0.107:8001'
  // const WS_SERVER_URL = 'ws://192.168.0.107:8001'
  //.envvvvvv
  const GRAPHQL_URL='https://api-heart-attack-prod-277226964694.europe-west3.run.app'
  const SERVER_URL = 'https://admin.heartattack.shop'
  const WS_SERVER_URL = 'wss://api-heart-attack-prod-277226964694.europe-west3.run.app'
  const GOOGLE_MAPS_KEY = 'AIzaSyCrSZxTEqjc5qnyg4EghQVJz2I6KuEcuwg'
  const FIREBASE_KEY = configuration.firebaseKey
  const APP_ID = configuration.appId
  const AUTH_DOMAIN = configuration.authDomain
  const STORAGE_BUCKET = configuration.storageBucket
  const MSG_SENDER_ID = configuration.msgSenderId
  const MEASUREMENT_ID = configuration.measurementId
  const PROJECT_ID = configuration.projectId
  const SENTRY_DSN = configuration.dashboardSentryUrl
  const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dmn1wepuv/image/upload"
  // const CLOUDINARY_UPLOAD_URL = configuration.cloudinaryUploadUrl
  const CLOUDINARY_FOOD = "cmi6flk9"
  // const CLOUDINARY_FOOD = configuration.cloudinaryApiKey
  const VAPID_KEY =
    'BOpVOtmawD0hzOR0F5NQTz_7oTlNVwgKX_EgElDnFuILsaE_jWYPIExAMIIGS-nYmy1lhf2QWFHQnDEFWNG_Z5w'
  const PAID_VERSION = configuration.isPaidVersion

  return {
    GOOGLE_MAPS_KEY,
    FIREBASE_KEY,
    APP_ID,
    AUTH_DOMAIN,
    STORAGE_BUCKET,
    MSG_SENDER_ID,
    MEASUREMENT_ID,
    PROJECT_ID,
    SERVER_URL,
    WS_SERVER_URL,
    SENTRY_DSN,
    CLOUDINARY_UPLOAD_URL,
    CLOUDINARY_FOOD,
    VAPID_KEY,
    PAID_VERSION
  }
}

export default ConfigurableValues
