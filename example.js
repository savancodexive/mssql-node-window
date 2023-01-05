function ExampleOne() {
    const sql = require("mssql");
    let config = {
        database: "db_test",
        server: "localhost",
        user: 'savantest', // update me
        password: '123', // update me

        options: {
            trustedConnection: true,
            trustServerCertificate: true
        }
    };

    (async () => {
        await sql.connect(config)
        const result = await sql.query`SELECT * FROM dbo.tbl_rowdata`
        console.log(JSON.stringify(result.recordset, null, 4))
    })()
}

function ExampleTwo() {
    var Connection = require('tedious').Connection;
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    // Create connection to database
    config = {
        server: 'localhost',
        authentication: {
            type: 'default',
            options: {
                userName: 'savantest', // update me
                password: '123' // update me
            }
        },
        options: {
            database: 'db_test',
            trustServerCertificate: true
        }
    }
    var connection = new Connection(config);

    function Read(callback) {
        console.log('Reading rows from the Table...');

        // Read all rows from table
        let request = new Request('SELECT * FROM dbo.tbl_rowdata;', function (err, rowCount, rows) {
            if (err) {
                callback(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                callback(null);
            }
        });

        // Print the rows read
        console.log('Printing the rows read');
        var result = "";
        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.metadata.colName + " : " + column.value + "\n";
                }
            });
            console.log(result);
            result = "";
        });

        // Execute SQL statement
        connection.execSql(request);
    }


    // Attempt to connect and execute queries if connection goes through
    connection.on('connect', function (err) {
        if (err) {
            console.log("not connected : ", err);
        } else {
            console.log('Connected');
            Read((result) => {
                console.log("result", result);
            })
        }
    })

    connection.connect();
}

// ExampleOne();
ExampleTwo();
