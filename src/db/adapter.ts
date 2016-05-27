import * as db from '../db';

import * as initializer from './initializer';

import logger from '../logger';

import * as _ from 'underscore';

import {MetaTable} from "./metadata";

let onError = x=> e=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init Ts: ${x}, ok:  ${y}`);

export class Adapter {

    private initializer;

    async getAll<T>():Promise<_Chain<T>> {

        return db.getAsync<T>(`'select * from ${this.meta.name}'`)
            .then(x =>
                _.chain(x));
    }

    async getWhere<T>(w:string):Promise<_Chain<T>> {

        return db.getAsync<T>(`select * from @table where ${w}`)
            .then(x=> _.chain(x));
    }

    async insert<T>(u:T):Promise<boolean> {

        return db.runAsync(
            `insert into T (@columns)
         values (@values)`);
    }

    async getById<T>(id:number):Promise<T> {

        return db.getAsync<T>(`select * from @table where @key = ${id}`)
            .then(x=> x? x[0] : null );
    }

    async update<T>(u:T):Promise<any> {
        return db.runAsync(
            `update @table set @setters where @key = @keyValue`);
    }

    constructor(private meta:MetaTable) {

        initializer.setup(meta.name)
            .value
            .then(ok)
            .catch(onError('init'));


    }
}

