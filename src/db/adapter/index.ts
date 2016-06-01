import logger from '../../logger';
import {IAdapter, ReflectAdapter} from "./ReflectAdapter";
import {SqlWriter, ScriptReader} from "../scriptio";
import {FileSystemReader, CustomLocationScriptReader} from "../scriptio/readers";
import {SqlBatchWriter} from "../scriptio/writers";
import {getTable} from "../metadata";
import * as tableInitializer from '../initializer';

import {SqliteEngine} from "../engine/SqliteEngine";

import {ReflectMapper} from "../mapper/ReflectMapper";


let onError = (x:any)=> (e:Error)=> logger.error(`Ts: ${x}, error: ${e}`);

/***
 * TKey: primary key type
 */
export async function createAdapter<T extends Function, TKey>(
    target:T,
    initializer: { reader?:ScriptReader, writer?:SqlWriter} )
: Promise<IAdapter<T,TKey>> {

    var connectionString = process.cwd()+"/test.db";
    
    var engine  = new SqliteEngine(connectionString);
    
    var meta = getTable(target);

    initializer = initializer || {};
    initializer.reader = meta.script ? new CustomLocationScriptReader(meta.script) : (initializer.reader || new FileSystemReader('/sql-scripts') );
    initializer.writer = initializer.writer || new SqlBatchWriter(engine);

    return new Promise(async(resolve, reject)=> {
        //
        await tableInitializer.tSetup(meta.name, initializer.reader, initializer.writer)
            .value
            .then(result => logger.debug(`init ${meta.name}, ok`))
            .catch(onError(`${meta.name}: init: `));

        try {
            resolve(
                new ReflectAdapter<T,TKey>(
                    engine, 
                    new ReflectMapper<T,TKey>(),
                    meta));
            
        } catch (e) {
            reject(e);
        }

    }) as Promise<IAdapter<T,TKey>>;
}
