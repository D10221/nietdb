
import * as chai from 'chai';

let assert = chai.assert;

import {exec} from './db'

function run(){

    var createTable = "create table  if not exists xxx (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE)";
    
    var selectTable = "select * from xxx";

    describe('db',()=>{

        it('db scripts bad',async (done)=>{

            var error = false;

            var callBackCount = 0 ;

            let setError = value => {
                error = value ;
                callBackCount++;
            };

            var scripts = ["insert into xxx zzz", createTable];

            await Promise.all(exec(...scripts))
                .then(()=>{
                    setError(false);
                })
                .catch(e=>{
                    setError(true);
                });

            assert.equal(error, true, 'is Error');

            done();
        });

        function delay(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        it('db scripts ok',async (done)=>{

            var error = false;

            var callBackCount = 0 ;

            let setError = value => {
                error = value ;
                callBackCount++;
            };

            var scripts = [createTable, selectTable];

            await Promise.all(exec(...scripts))
                .then(()=>{
                    setError(false);
                })
                .catch(e=>{
                    setError(true);
                });

            assert.equal(error, false, 'is Not Error');

            done();
        })
    })
};

run();
