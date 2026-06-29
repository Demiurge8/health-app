const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'Lab2',
  user: 'sa',
  password: 'sa',
  options: {
    encrypt: false, // If using Azure SQL, set to true
  },
};

sql.connect(config)
  .then(() => {
    console.log('Database connection successful');
    // Execute a test query if needed
  })
  .catch((err) => {
    console.log('Database connection error: ', err);
  });
