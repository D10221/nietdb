import * as db from '../db';


import *  as _mapper from './mapper/mapper';

import * as _ from 'underscore';

import * as m from "./metadata";

import {IMapper} from "./mapper/mapper";


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
