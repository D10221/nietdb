import * as _ from 'lodash';
import * as sqlite3 from 'sqlite3';

import logger from '../logger'
import {Lazy} from "../Lazy";
import {Database} from "sqlite3";

sqlite3.verbose();


export var db = new Lazy<Database>(() => new Database('./test/test.db'));

export function exec(scripts:string[]) : Promise<any> {

    return new Promise( (resolve,reject) => {

        db.value.serialize(()=> {

            for (let script of scripts) {

                db.value.exec(script, e=>{

                    if(!_.isError(e)) {
                        resolve();
                        return ;
                    }

                    logger.error(`script: \n ${script} \n${e}`);

                    reject(e)
                })
            }
        });

    });
}

export function runAsync<T>(sql:string, ...params:any[]):Promise<any> {

    return new Promise<boolean>(function (resolve, reject) {
        db.value.serialize(()=>{
            db.value.run(sql, params, function cb(e) {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(e);
            });
        })
    });
}

export function getAsync<T>(sql:string, ...params:any[]):Promise<T[]> {

    return new Promise<T[]>(function (resolve, reject) {

        db.value.serialize(()=>{
            db.value.all(sql, params, function cb(e,x) {
                if (e) {
                    reject(e.message);
                }
                resolve(x);
            });
        });

    });
}