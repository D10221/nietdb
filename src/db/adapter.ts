import * as db from '../db';

import * as initializer from './initializer';

import *  as sql from './mapper';

import logger from '../logger';

import * as _ from 'underscore';

import {MetaTable} from "./metadata";

let onError = x=> e=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init Ts: ${x}, ok:  ${y}`);

export class Adapter {
         
    constructor(private meta:MetaTable) {
        
        initializer.tSetup(meta.name)
            .value
            .then(result => logger.debug(`init ${meta.name}, ok`))
            .catch(onError(`${meta.name}: init: `));
        
    }
    
    async getAll<T>():Promise<_Chain<T>> {

        return db.getAsync<T>(`'select ${sql.getSelect(this.meta)} from ${this.meta.name}'`)
            .then(x =>
                _.chain(x));
    }

    async getWhere<T>(w:string):Promise<_Chain<T>> {

        return db.getAsync<T>(`select ${sql.getSelect(this.meta)} from ${this.meta.name} where ${w}`)
            .then(x=> _.chain(x));
    }

    async insert<T>(target:T):Promise<boolean> {
        return db.runAsync(sql.getInsert(this.meta, target));
    }
    
    

    async getById<T>(id:number):Promise<T> {

        return db.getAsync<T>(`select * from @table where @key = ${id}`)
            .then(x=> x? x[0] : null );
    }

    async update<T>(u:T):Promise<any> {
        return db.runAsync(
            `update @table set @setters where @key = @keyValue`);
    }


}

