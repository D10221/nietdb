import * as _ from 'underscore';

import * as sqlite3 from 'sqlite3';

import logger from '../logger'

import * as lazy from "../lazy";

import {Database} from "sqlite3";

import * as fs from 'fs';

sqlite3.verbose();

let dbPath = process.cwd() + '/test.db';

export var drop = ()=> new Promise((rs,rj)=>{

    try{

        fs.exists(dbPath, ()=> {
            fs.unlink(dbPath);
            logger.warn(`dropped: ${dbPath}`);

        });

        rs();
    }
    catch (e){
        rj(e);
    }
});

export let db = new lazy.Lazy<Database>(()=> new Database(dbPath));

export function exec(...scripts:string[]) : Promise<any>[] {

    return scripts.map(script=> new Promise((rs,rj)=>{
        db.value.serialize(()=>{
            db.value.exec(script, e=>{
                if(!_.isError(e)){
                    rs();
                    return;
                }
                logger.error(`script: \n ${script} \n${e}`);
                rj(e);
            })
        })
    }));
    
}

/***
 *
 * @param sql
 * @param params
 * @returns {Promise<{result: any, changes: number}>} only when INSERT
 */
export function runAsync<T>(sql:string, ...params:any[]): Promise<{result: any, changes: number }> {
    
    return new Promise<{result: any, changes: number }> (function (resolve, reject) {

        db.value.serialize(function (){

            db.value.run(sql, params, function cb(e:Error) {
                
                if (e) {
                    logger.error(`sql: \n ${sql} \n${e}`);
                    reject(e);
                    return;
                }
                
                resolve({result: this.lastID, changes: this.changes });
            });
        });
    });
}

export function getAsync<T>(sql:string, ...params:any[]):Promise<T[]> {

    return new Promise<T[]>(function (resolve, reject) {

        db.value.serialize(()=>{

            db.value.all(sql, params, function cb(e:Error,x: T[]) {
                if (e) {
                    logger.error(`sql: \n ${sql} \n${e}`);
                    reject(e.message);
                }
                resolve(x);
            });
        });

    });
}