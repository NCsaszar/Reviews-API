const { HoneycombSDK } = require('@honeycombio/opentelemetry-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
require('dotenv').config();
// uses the HONEYCOMB_API_KEY and OTEL_SERVICE_NAME environment variables
const sdk = new HoneycombSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
// "start:server": "nodemon -r ./controllers/tracing.js ./controllers/server.js",
