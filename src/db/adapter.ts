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

let onError = x=> e=> logger.error(`Ts: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init Ts: ${x}, ok:  ${y}`);


export /*async*/ function getAll<T>(mapper : _mapper.IMapper<T>, meta:m.TableMeta):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(mapper.getSelect(meta))
        .then(x =>
            _.chain(x));
}

export /*async*/ function getWhere<T>(mapper :_mapper.IMapper<T>,meta:m.TableMeta, w:string):Promise<_Chain<T>> {
    //await init(meta);
    return db.getAsync<T>(`${mapper.getSelect(meta)} where ${w}`)
        .then(x=> _.chain(x));
}

export async function insert<T>(mapper :_mapper.IMapper<T>, meta:m.TableMeta, target:T):Promise<boolean> {
    var sql = await mapper.getInsert(meta, target);
    return db.runAsync(sql);
}

export /*async*/ function getById<T>(mapper :_mapper.IMapper<T>, meta:m.TableMeta, id?:any | { id:any }):Promise<T> {

    var predicate = '';
    if (id.hasOwnProperty('id')) {
        predicate = `${mapper.getKeyName(meta)}=${id['id'].toString()}`;
    } else {
        predicate = mapper.getKeyPredicate(meta, id);
    }

    return db.getAsync<T>(mapper.getSelect(meta) + ' WHERE ', predicate)
        .then(x=> x ? x[0] : null);
}

export /*async*/ function update<T>(mapper :_mapper.IMapper<T>,meta:m.TableMeta, target:T):Promise<any> {
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

   return  new Promise( async (resolve, reject )=> {
       await initializer.tSetup(meta.name, reader, writer)
           .value
           .then(result => logger.debug(`init ${meta.name}, ok`))
           .catch(onError(`${meta.name}: init: `));

       try{
           resolve(new ReflectAdapter(meta));
       }catch(e){
           reject(e);
       }

   }) as Promise<IAdapter<T>>;
}

export class ReflectAdapter<T> implements IAdapter<T> {

    all =  () => getAll<T>(this.mapper ,this.meta);
    insert =  target=> insert<T>(this.mapper, this.meta, target);
    updte =  target=> update<T>(this.mapper , this.meta, target);
    byId =  x=> getById<T>(this.mapper ,this.meta, x);
    where =  (w)=> getWhere<T>(this.mapper , this.meta, w);

    mapper : _mapper.IMapper<T>;

    constructor(private meta: TableMeta, mapper?: _mapper.IMapper<T>){

        this.mapper = mapper || new ReflectMapper<T>();
    }
}

