'use strict'

const axios = require('axios')
const { Pool, types, Query, Client } = require('pg')

module.exports.helloWorld = async (event, context, callback) => {
  let data
  try {
    console.log('here')
    const req = await axios
      .get('https://api.dev.hexly.cloud/internal/health')
      .catch(err => {
        throw err
      })
    data = req.data
  } catch (e) {
    data = e.message
  }

  let rows
  let pool
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
    console.log('querying', process.env.DATABASE_URL.substr(0, 5))
    rows = (await new Promise((resolve, reject) => {
      pool
        .query('select count(1) from platform.tenant')
        .then(resolve)
        .catch(reject)
    })).rows
    console.log('complete')
  } catch (e) {
    console.log('eerr', e)
    rows = e.message
  } finally {
    if (pool) {
      await pool.end()
    }
  }

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*' // Required for CORS support to work
    },
    body: JSON.stringify({
      data,
      rows
    })
  }

  callback(null, response)
}
