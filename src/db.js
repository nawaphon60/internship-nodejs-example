// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host     : process.env.DB_HOST,
      user     : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,
      charset  : 'utf8mb4'
    },
    pool: {
      min: 1,
      max: 10,
      // afterCreate: function(conn,done){
      //   console.log('12122')
      //   conn.query('SELECT 1;', function (err) {
      //     if(err){
      //       console.log('DB ERROR',err)
      //     }else{
      //       console.log('CONNECT SUCCESS.')
      //     }
      //     done(conn, err)
      //   })
      // }
    }
  })
  const bookshelf = require('bookshelf')(knex)

  module.exports = bookshelf