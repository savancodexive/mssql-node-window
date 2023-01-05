require('dotenv').config()
var http = require('http');
var express = require('express');
const sql = require("mssql");

const PORT = process.env.PORT || 7002;
//process.env.DB_HOST || ""
App({
    database: process.env.DB_NAME || "",
    server: "localhost",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
});

async function App(dbConfig) {
    var app = express();

    sql.connect(dbConfig).then(() => {
        console.log("Database connected");

        var httpServer = http.createServer(app);
        httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}/`));

        app.get('/', function (req, res) {
            res.header('Content-type', 'text/html');
            return res.end('<h1>Welcome Window Node App</h1>');
        });


        let timeInterval = setInterval(() => {
            (async () => {
                let machineResult = [];
                try {
                    machineResult = (await sql.query`SELECT MachineID, CurSpeed FROM machine`).recordset
                    let finalResult = [];
                    for await (const machineObject of machineResult) {
                        let details = {};
                        let tClassDataRecords = (await sql.query`SELECT top 1 RunTime, AllStopTime  FROM dbo.tClassData where MachineID = ${machineObject.MachineID} order by CreatedAt desc`).recordset;
                        if (tClassDataRecords.length) {
                            details = { ...details, ...tClassDataRecords[0] }
                        }
                        let tZhongZiClassDataRecords = (await sql.query`SELECT top 1 WarpCount,WeftCount,WarpTime,WeftTime,Eff,Yield FROM dbo.tZhongZi_ClassData where MachineID = ${machineObject.MachineID} order by CreatedAt desc`).recordset;
                        if (tZhongZiClassDataRecords.length) {
                            details = { ...details, ...tZhongZiClassDataRecords[0] }
                        }
                        details = { ...details, ...machineObject }
                        finalResult.push(details);


                        var myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");

                        var raw = JSON.stringify({
                            "payload": finalResult
                        });

                        var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                        };

                        fetch("http://localhost:7001/forward", requestOptions)
                            .then(response => response.text())
                            .then(result => console.log(result))
                            .catch(error => console.log('error', error));
                        
                    }
                    console.log(JSON.stringify(finalResult));
                } catch (error) {
                    console.log("Error : ", error);
                }
            })()
        }, 2500);
    }).catch(err => {
        console.log("DB:Error : ", err);
    })
}