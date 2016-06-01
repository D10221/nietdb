import * as fs from 'fs';
import * as _ from 'underscore';
import {Engine} from "./index";
import {Lazy} from "../../lazy";
import {Database} from "sqlite3";
import logger  from '../../logger';

export class SqliteEngine implements  Engine {

    private db: Lazy<Database>;

    constructor(private connectionString:string){
        this.db = new Lazy(()=> new Database(connectionString));
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

    close = ()=> new Promise<Engine>((rs,rj)=> {

        if (!this.db.isValueCreated) {
            rs(this);
            return;
        }

        this.db.value.close((e)=> {
            if (_.isError(e)) { rj(e) }
            else { rs(this)}}
        );

    }).then( () =>{
        this.db = new Lazy(()=> new Database(this.connectionString));
        return this;
    });
    /***
     * drop db
     */
    drop : ()=> Promise<Engine> =  ()=> {

        return this.close().then( x => {
            
            fs.exists(this.connectionString, ()=> {
                fs.unlink(this.connectionString);
                logger.warn(`dropped: ${this.connectionString}`);
            });

            this.db = new Lazy(()=> new Database(this.connectionString));

            return this;
        });
    }
}