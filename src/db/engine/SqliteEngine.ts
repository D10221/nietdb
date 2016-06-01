import * as fs from 'fs';
import * as _ from 'underscore';
import {Engine} from "./index";
import {Lazy} from "../../lazy";
import {Database} from "sqlite3";
import logger  from '../../logger';

export class SqliteEngine implements  Engine {
    
    private db: Lazy<Database>;

    constructor(public connectionString:string){
        this.db = new Lazy(()=>
            new Database(connectionString));
    }

    exec =(...scripts:string[]):Promise<Engine> => {
        var db = this.db.value;
        return Promise.all(scripts.map(script=> new Promise((rs, rj)=> {
            db.serialize(()=> {
                db.exec(script, e=> {
                    if (!_.isError(e)) {
                        rs(this);
                        return;
                    }
                    logger.error(`script: \n ${script} \n${e}`);
                    rj(e);
                })
            })
        })))
            .then(()=> this.close())
        .then(() => this);
    };

    runAsync =<T>(sql:string, ...params:any[]): Promise<{result: any, changes: number }> => {
        var db = this.db.value;
        return new Promise<{result: any, changes: number }> (function (resolve, reject) {
            db.serialize(function (){
                db.run(sql, params, function cb(e:Error) {
                    if (e) {
                        logger.error(`sql: \n ${sql} \n${e}`);
                        reject(e);
                        return;
                    }
                    resolve({result: this.lastID, changes: this.changes });
                });
            });
        }).then(x => {
            this.close();
            return x;
        });
    };

    getAsync = <T>(sql:string, ...params:any[]):Promise<T[]> => {
        var db = this.db.value;
        return new Promise<T[]>(function (resolve, reject) {
            db.serialize(()=>{
                db.all(sql, params, function cb(e:Error,x: T[]) {
                    if (e) {
                        logger.error(`sql: \n ${sql} \n${e}`);
                        reject(e.message);
                    }
                    resolve(x);
                });
            });
        }).then(x => {
            this.close();
            return x;
        });
    };

    close = ()=> new Promise<Engine>((resolve,reject)=> {

        if (!this.db.isValueCreated ||this.inMemory) {
            resolve(this);
            return;
        }

        this.db.value.close((e)=> {
            if (_.isError(e)) {
                reject(e)
            }
            else { resolve(this)}}
        );

    })
        .then( () =>{
            if(this.inMemory) return this;
            this.db = new Lazy(()=>
                new Database(this.connectionString));
            return this;

    });

    get inMemory(): boolean {return this.connectionString == ":memory:" };

    /***
     * drop db
     */
    drop : ()=> Promise<Engine> = async ()=> {
        return dropIfExists(this.connectionString)
        .then(dropped=> {if(dropped){
            this.db = new Lazy(()=>
                new Database(this.connectionString))
        }})
        .then(x=> this);
    };
}

function dropIfExists(p:string){
    return new Promise( (rs,rj)=> {
        fs.exists(p, ok=> {
            if(ok){
                fs.unlink(p)
            }
            rs(ok);
        })
    })
}