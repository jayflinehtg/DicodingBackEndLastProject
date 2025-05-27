/* istanbul ignore file */
const { Pool, types } = require("pg");

const TIMESTAMP_OID = 1114;

types.setTypeParser(TIMESTAMP_OID, (stringValue) => {
  // Jika stringValue adalah null, kembalikan null untuk menghindari error `new Date(null)`
  if (stringValue === null) {
    return null;
  }
  return new Date(stringValue + "Z");
});

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const pool =
  process.env.NODE_ENV === "test" ? new Pool(testConfig) : new Pool();

module.exports = pool;
