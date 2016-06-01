import logger from '../logger';
import {IAdapter} from "./adapter";
import {ReflectAdapter} from "./ReflectAdapter";
import {SqlBatchWriter, SqlWriter} from "./script_writers";
import {FileSystemReader, CustomLocationScriptReader, ScriptReader} from "./readers";
import {getTable} from "./metadata";
import * as tableInitializer from './initializer';


let onError = (x:any)=> (e:Error)=> logger.error(`Ts: ${x}, error: ${e}`);

/***
 * TKey: primary key type
 */
export async function createAdapter<T extends Function, TKey>(
    target:T,
    initializer: { reader?:ScriptReader, writer?:SqlWriter} )
: Promise<IAdapter<T,TKey>> {

    var meta = getTable(target);

    initializer = initializer || {};
    initializer.reader = meta.script ? new CustomLocationScriptReader(meta.script) : (initializer.reader || new FileSystemReader('/sql-scripts') );
    initializer.writer = initializer.writer || new SqlBatchWriter();

    return new Promise(async(resolve, reject)=> {
        //
        await tableInitializer.tSetup(meta.name, initializer.reader, initializer.writer)
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
