import {assert} from 'chai';

import * as tds from 'tedious';
import {Connection} from "tedious";
import {Request} from "tedious";

describe('tedious', ()=> {

    it('works', (done)=> {

        var connection = new tds.Connection({

            userName: 'sa',
            password: 'P@55w0rd!',
            server: 'localhost',
            // If you're on Windows Azure, you will need this:
            options: {
                encrypt: true,
                rowCollectionOnRequestCompletion: true,
                instanceName: 'BLINK75-PC\\SQLSVR2014',
                database: 'EgoliGas',
            }
        });

        connection.on('connect', function (err:Error ) {
            var request = new Request("select 42, 'hello world'", function (err, rowCount) {
                if (err) {
                    console.log('ERROR');
                    console.log(err);
                } else {
                    console.log(rowCount + ' rows');
                }
            })
        });

        var result:any[] = [];

        var error:Error = null;

        function getSqlData() {
            console.log('Getting data from SQL');

            var request = new Request("SELECT 'hello'",
                function (err, rowCount) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`ok: rowCount: ${rowCount}`);
                    }
                });

            request.on('row', function (columns:any[]) {
                var row:any = {};
                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });
                result.push(row);
            });

            connection.execSql(request);
        }

        getSqlData();

        setTimeout(function () {
            done();
        }, 500);

        assert.isNotNull(result[0]);
        assert.isNull(error);

    })
});
