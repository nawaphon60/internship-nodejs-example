const db = require('./../db')

// Defining models
const Users = db.model('Users', {
    tableName: 'users',
    hasTimestamps: true, // มันจะ add เวลา auto ลง column  created_at และ updated_at เวลามีข้อมูล update ใน row
    requireFetch: false
})

// Database Structure
/*
id: int(11) primary key auto increment
email: varchar(255)
name: varchar(255)
password: varchar(255)
created_at: datetime
updated_at: datetime
*/

module.exports = Users