import { Client, auth, policies, types } from 'cassandra-driver'
import { createLogger } from '../../../../logger'
const logger = createLogger('ScyllaDB Client')

// Token-aware load balancing policy
const loadBalancingPolicy = new policies.loadBalancing.TokenAwarePolicy(
  new policies.loadBalancing.RoundRobinPolicy(),
)

const scyllaUsername = process.env.SCYLLA_USERNAME
const scyllaPassword = process.env.SCYLLA_PASSWORD
const scyllaKeyspace = process.env.SCYLLA_KEYSPACE ?? 'trading'
const scyllaConnectPoints = process.env.SCYLLA_CONNECT_POINTS
  ? process.env.SCYLLA_CONNECT_POINTS.split(',').map((point) => point.trim())
  : ['127.0.0.1:9042']

const scyllaDatacenter = process.env.SCYLLA_DATACENTER ?? 'datacenter1'

const clientConfig: any = {
  contactPoints: scyllaConnectPoints,
  localDataCenter: scyllaDatacenter,
  policies: {
    loadBalancing: loadBalancingPolicy,
  },
  socketOptions: {
    connectTimeout: 2000, // 2 seconds
  },
  pooling: {
    coreConnectionsPerHost: {
      [types.distance.local]: 2,
      [types.distance.remote]: 1,
    },
  },
  // Enable compression
  encoding: {
    useUndefinedAsUnset: true, // Unset columns when value is `undefined`
  },
}

// Only add authProvider if username and password are set
if (
  scyllaUsername &&
  scyllaUsername !== '' &&
  scyllaPassword &&
  scyllaPassword !== ''
) {
  clientConfig.authProvider = new auth.PlainTextAuthProvider(
    scyllaUsername,
    scyllaPassword,
  )
}

const client = new Client(clientConfig)

const MAX_RETRIES = 5
const INITIAL_DELAY = 2000

async function connectWithRetry(retries: number, delay: number) {
  // Wait for the initial delay before attempting the first connection
  if (retries === MAX_RETRIES) {
    await new Promise((resolve) => setTimeout(resolve, INITIAL_DELAY))
  }

  try {
    await client.connect()
    return true
  } catch (err) {
    logger.error(`Connection failed due to ${err.message}`)

    if (retries > 0) {
      logger.warn(`Connection failed. Retrying in ${delay / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return connectWithRetry(retries - 1, delay * 2)
    } else {
      logger.error('Max retries reached. Could not connect to ScyllaDB.')
      return false
    }
  }
}

let initializationPromise: Promise<void> | null = null

export function initialize(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    const connected = await connectWithRetry(MAX_RETRIES, INITIAL_DELAY)
    if (!connected) {
      throw new Error('Failed to connect to ScyllaDB')
    }
    await initializeDatabase()
    client.keyspace = scyllaKeyspace
  })()

  initializationPromise.catch((err) => {
    logger.error('Initialization failed:', err)
    initializationPromise = null
  })

  return initializationPromise
}

async function initializeDatabase() {
  try {
    // Create the keyspace if it does not exist
    const query = `SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = '${scyllaKeyspace}'`
    const result = await client.execute(query)

    if (result && result.rows && result.rows.length === 0) {
      await client.execute(
        `CREATE KEYSPACE IF NOT EXISTS ${scyllaKeyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}`,
      )
      await client.execute(`USE ${scyllaKeyspace}`)
    }
    client.keyspace = scyllaKeyspace
    // Initialize tables within the keyspace
    const cqlQueries = [
      `CREATE TABLE IF NOT EXISTS ${scyllaKeyspace}.orders (
        uuid UUID,
        user_id INT,
        symbol TEXT,
        type TEXT,
        timeInForce TEXT,
        side TEXT,
        price varint,
        average varint,
        amount varint,
        filled varint,
        remaining varint,
        cost varint,
        trades TEXT,
        fee varint,
        fee_currency TEXT,
        status TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY ((user_id), created_at, uuid)
      ) WITH CLUSTERING ORDER BY (created_at DESC, uuid ASC);`,
      `CREATE TABLE IF NOT EXISTS ${scyllaKeyspace}.candles (
          symbol TEXT,
          interval TEXT,
          open DOUBLE,
          high DOUBLE,
          low DOUBLE,
          close DOUBLE,
          volume DOUBLE,
          created_at TIMESTAMP,
          updated_at TIMESTAMP,
          PRIMARY KEY (symbol, interval, created_at)
      );`,
      `CREATE TABLE IF NOT EXISTS ${scyllaKeyspace}.orderbook (
          symbol TEXT,
          price DOUBLE,
          amount DOUBLE,
          side TEXT,
          PRIMARY KEY ((symbol, side), price)
      ) WITH CLUSTERING ORDER BY (price ASC);`,
      `CREATE MATERIALIZED VIEW IF NOT EXISTS ${scyllaKeyspace}.open_orders AS
      SELECT * FROM ${scyllaKeyspace}.orders
      WHERE status = 'OPEN' AND user_id IS NOT NULL AND created_at IS NOT NULL AND uuid IS NOT NULL
      PRIMARY KEY (status, user_id, created_at, uuid)
      WITH CLUSTERING ORDER BY (created_at DESC, uuid ASC);`,
      `CREATE MATERIALIZED VIEW IF NOT EXISTS latest_candles AS
      SELECT * FROM candles
      WHERE symbol IS NOT NULL AND interval IS NOT NULL AND created_at IS NOT NULL
      PRIMARY KEY ((symbol, interval), created_at)
      WITH CLUSTERING ORDER BY (created_at DESC);`,
      `CREATE MATERIALIZED VIEW IF NOT EXISTS orderbook_by_symbol AS
      SELECT price, side, amount FROM orderbook
      WHERE symbol IS NOT NULL AND price IS NOT NULL AND side IS NOT NULL
      PRIMARY KEY (symbol, price, side);`,
      `CREATE MATERIALIZED VIEW IF NOT EXISTS orders_by_symbol AS
      SELECT * FROM orders
      WHERE symbol IS NOT NULL AND user_id IS NOT NULL AND created_at IS NOT NULL AND uuid IS NOT NULL
      PRIMARY KEY (symbol, user_id, created_at, uuid)
      WITH CLUSTERING ORDER BY (created_at DESC, uuid ASC);`,
    ]

    try {
      await Promise.all(cqlQueries.map((query) => client.execute(query)))
    } catch (err) {
      logger.error(`Failed to initialize database: ${err.message}`)
    }
  } catch (error) {
    logger.error(`Failed to initialize database: ${error.message}`)
  }
}

initialize().catch((err: Error) => {
  logger.error('Failed to connect to ScyllaDB:', err)
})

// Graceful shutdown
const shutdown = async () => {
  await client.shutdown()
  logger.info('ScyllaDB client disconnected')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

export default client
