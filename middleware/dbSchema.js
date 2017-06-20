const client = require('mariasql')


const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})

// c.query('show databases', function (err, rows) {
//     if (err)
//         throw err;
//     console.dir(rows);
// });
c.end()