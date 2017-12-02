const client = require('mariasql')


const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3306,
    db: 'ddif'
})

// c.query('create table ss')
// c.query('Create table items(ID INT AUTO_INCREMENT PRIMARY KEY,
// name varchar(100),
// image varchar(150),
// price double(10,2),
// desc varchar(200),
// longDesc varchar(600))'
// , function (err, rows) {
//     if (err)
//         throw err;
//     console.dir(rows);
// });
// c.query('Create table items(ID INT AUTO_INCREMENT PRIMARY KEY,
// name varchar(100),
// image varchar(150),
// price double(10,2),
// desc varchar(200),
// longDesc varchar(600) )'
// , function (err, rows) {
//     if (err)
//         throw err;
//     console.dir(rows);
// });

// c.query('create table customers(Fname varchar(30),
// Lname varchar(30),
// address varchar(255),
// city varchar(40),
// state varchar(40),
// zip varchar(20),
// phone varchar(20) )'
// ,function(err, rows){
//     console.log(rows)
// })
// c.query('create table customers(fname varchar(20))')
c.end()