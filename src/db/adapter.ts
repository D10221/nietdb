import * as db from '../db';

import * as initializer from './initializer';

import *  as mapper from './mapper';

import logger from '../logger';

import * as _ from 'underscore';

import {MetaTable, getMetaTable} from "./metadata";

let onError = x=> e=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init Ts: ${x}, ok:  ${y}`);


export function init(meta:MetaTable,reader?:(sKey)=> string, writer?:(sKey)=> Promise<any>){
    initializer.tSetup(meta.name,reader,writer)
        .value
        .then(result => logger.debug(`init ${meta.name}, ok`))
        .catch(onError(`${meta.name}: init: `));
}

export /*async*/ function getAll<T>(meta:MetaTable):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(mapper.getSelect(meta))
        .then(x =>
            _.chain(x));
}

export /*async*/ function getWhere<T>(meta:MetaTable, w:string):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(`${mapper.getSelect(meta)} where ${w}`)
        .then(x=> _.chain(x));
}

export /*async*/ function insert<T>(meta:MetaTable, target:T):Promise<boolean> {
    return db.runAsync(mapper.getInsert(meta, target));
}

export /*async*/ function getById<T>(meta:MetaTable, id?:T | { id:any }):Promise<T> {

    var predicate = '';
    if (id.hasOwnProperty('id')) {
        predicate = `${mapper.getKeyName(meta)}=${id['id'].toString()}`;
    } else {
        predicate = mapper.getKeyPredicate(meta, id);
    }

    return db.getAsync<T>(mapper.getSelect(meta) + ' WHERE ', predicate)
        .then(x=> x ? x[0] : null);
}

export /*async*/ function update<T>(meta:MetaTable, target:T):Promise<any> {
    return db.runAsync(mapper.getUpdate(meta, target));
}

export interface IAdapter<T> {
    all(): Promise<_Chain<T>> ; 
    insert(t:T) : Promise<boolean> ;
    updte(t:T) : Promise<boolean>;
    where(w:string) : Promise<_Chain<T>>;
}

export class InstanceLoader<T> {
    constructor(private context: Object) {

    }

    getInstance(...args: any[]) : T {
        var instance = Object.create(Object.prototype);
        instance.constructor.apply(instance, args);
        return <T> instance;
    }
}

export async function createAdapter<T> (
    initialize?: boolean,
    reader?:(sKey)=> string,
    writer?:(sKey)=> Promise<any>) : Promise<IAdapter<T>> {

    //meta = meta || ( getMetaTable(new T()));
    var type = new InstanceLoader<T>(this).getInstance(null);
    
    var meta = Reflect.getMetadata('meta:table', type );
    
    if (initialize != false) {
        await
        init(meta, reader, writer);
    }

    var ret = {
        all: () => getAll<T>(meta),
        insert: target=> insert<T>(meta, target),
        updte: target=> update<T>(meta, target),
        byId: x=> getById<T>(meta, x),
        where: (w)=> getWhere<T>(meta, w)
    };

    return new Promise<IAdapter<T>>((rs,rj)=> {
        rs(ret);
    });
}

