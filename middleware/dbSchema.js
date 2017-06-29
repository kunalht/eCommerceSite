const client = require('mariasql')


const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})


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
c.end()