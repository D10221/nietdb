import * as db from '../db';

import * as initializer from './initializer';

import *  as mapper from './mapper';

import logger from '../logger';

import * as _ from 'underscore';

import * as m from "./metadata";

import {FileSystemReader, ScriptReader, CustomLocationScriptReader} from "./readers";

import {SqlWriter, SqlBatchWriter} from "./script_writers";

let onError = x=> e=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init Ts: ${x}, ok:  ${y}`);


export /*async*/ function getAll<T>(meta:m.TableMeta):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(mapper.getSelect(meta))
        .then(x =>
            _.chain(x));
}

export /*async*/ function getWhere<T>(meta:m.TableMeta, w:string):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(`${mapper.getSelect(meta)} where ${w}`)
        .then(x=> _.chain(x));
}

export /*async*/ function insert<T>(meta:m.TableMeta, target:T):Promise<boolean> {
    return db.runAsync(mapper.getInsert(meta, target));
}

export /*async*/ function getById<T>(meta:m.TableMeta, id?:T | { id:any }):Promise<T> {

    var predicate = '';
    if (id.hasOwnProperty('id')) {
        predicate = `${mapper.getKeyName(meta)}=${id['id'].toString()}`;
    } else {
        predicate = mapper.getKeyPredicate(meta, id);
    }

    return db.getAsync<T>(mapper.getSelect(meta) + ' WHERE ', predicate)
        .then(x=> x ? x[0] : null);
}

export /*async*/ function update<T>(meta:m.TableMeta, target:T):Promise<any> {
    return db.runAsync(mapper.getUpdate(meta, target));
}

export interface IAdapter<T> {
    all(): Promise<_Chain<T>> ; 
    insert(t:T) : Promise<boolean> ;
    updte(t:T) : Promise<boolean>;
    where(w:string) : Promise<_Chain<T>>;
}

/***
 *
 */
export async function createAdapter<T extends Function> (
    target: T,
    reader?: ScriptReader,
    writer?: SqlWriter) : Promise<IAdapter<T>> {
    
    var meta = m.getTable(target);

    reader = meta.script ? new CustomLocationScriptReader(meta.script) : (reader || new FileSystemReader('/sql-scripts') );

    writer = writer || new SqlBatchWriter();

    await initializer.tSetup(meta.name, reader, writer)
        .value
        .then(result => logger.debug(`init ${meta.name}, ok`))
        .catch(onError(`${meta.name}: init: `));

   return  new Promise((r)=>{
       r({
           all: () => getAll<T>(meta),
           insert: target=> insert<T>(meta, target),
           updte: target=> update<T>(meta, target),
           byId: x=> getById<T>(meta, x),
           where: (w)=> getWhere<T>(meta, w)
       });
   }) as Promise<IAdapter<T>>;
}

