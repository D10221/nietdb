import * as db from '../db';

import * as initializer from './initializer';

import *  as _mapper from './mapper';

import logger from '../logger';

import * as _ from 'underscore';

import * as m from "./metadata";

import {FileSystemReader, ScriptReader, CustomLocationScriptReader} from "./readers";

import {SqlWriter, SqlBatchWriter} from "./script_writers";

import {TableMeta} from "./metadata";

import {ReflectMapper} from "./ReflectMapper";

import {IMapper, getKeyPredicate} from "./mapper";

let onError = (x:any)=> (e:Error)=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = (x:any) => (y:any) => logger.info(`init Ts: ${x}, ok:  ${y}`);


export /*async*/ function getAll<T,TKey>(mapper:IMapper<T,TKey>, meta:m.TableMeta):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(mapper.getSelect(meta))
        .then(x =>
            _.chain(x));
}

export /*async*/ function getWhere<T, TKey>(mapper:IMapper<T,TKey>, meta:m.TableMeta, w:string):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(`${mapper.getSelect(meta)} where ${w}`)
        .then(x=> _.chain(x));
}

export async function insert<T extends Object, TKey >(mapper:IMapper<T,TKey>, meta:m.TableMeta, target:T):Promise<TKey> {

    var sql = await mapper.getInsert(meta, target);

    return db.runAsync(sql).then(r=> r.result);
}

export /*async*/ function getById<T, TKey>(mapper:IMapper<T,TKey>, meta:m.TableMeta, id?:TKey | { id:TKey }):Promise<T> {

    var value = hasId(id) ? `${( id as any).id.toString()}` : `${id}`;

    var predicate = `${mapper.getKeyName(meta)}=${value}`;

    return db.getAsync<T>(mapper.getSelect(meta) + ' WHERE ', predicate)
        .then(x=> x ? x[0] : null);
}

export interface IiD<TKey> {
    id:TKey
}

function hasId<TKey>(x:{id?:TKey}):x is IiD<TKey> {
    return x.hasOwnProperty('id')
}

export async function update<T,TKey>(mapper:_mapper.IMapper<T,TKey>, meta:m.TableMeta, target:Object):Promise<any> {
    var sql = await mapper.getUpdate(meta, target);
    return db.runAsync(sql);
}

export interface IAdapter<T, TKey> {
    all():Promise<_Chain<T>> ;
    insert(t:T):Promise<TKey> ;
    updte(t:T):Promise<boolean>;
    where(w:string):Promise<_Chain<T>>;
}

/***
 * TKey: primary key type
 */
export async function createAdapter<T extends Function, TKey>(target:T,
                                                              reader?:ScriptReader,
                                                              writer?:SqlWriter):Promise<IAdapter<T,TKey>> {

    var meta = m.getTable(target);

    reader = meta.script ? new CustomLocationScriptReader(meta.script) : (reader || new FileSystemReader('/sql-scripts') );

    writer = writer || new SqlBatchWriter();

    return new Promise(async(resolve, reject)=> {
        await initializer.tSetup(meta.name, reader, writer)
            .value
            .then(result => logger.debug(`init ${meta.name}, ok`))
            .catch(onError(`${meta.name}: init: `));

        try {
            resolve(new ReflectAdapter<T,TKey>(meta));
        } catch (e) {
            reject(e);
        }

    }) as Promise<IAdapter<T,TKey>>;
}

export class ReflectAdapter<T,TKey> implements IAdapter<T, TKey> {

    all = () => getAll<T, TKey>(this.mapper, this.meta);

    insert(target:T) {
        return insert<T,TKey>(this.mapper, this.meta, target)
    }

    updte = (target:Object)=> update<T,TKey>(this.mapper, this.meta, target);

    byId = (x: TKey | IiD<TKey> ) => getById<T,TKey>(this.mapper, this.meta, x);

    where = (w:string)=> getWhere<T,TKey>(this.mapper, this.meta, w);

    mapper:IMapper<T,TKey>;

    constructor(private meta:TableMeta, mapper?:IMapper<T,TKey>) {

        this.mapper = mapper || new ReflectMapper<T,TKey>();
    }
}

