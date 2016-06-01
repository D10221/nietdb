import logger from '../../logger';
import {ReflectAdapter} from "./ReflectAdapter";
import {SqlWriter, ScriptReader} from "../scriptio";
import {FileSystemReader, CustomLocationScriptReader} from "../scriptio/readers";
import {SqlBatchWriter} from "../scriptio/writers";
import {getTable} from "../metadata";
import * as tableSchemaInitializer from '../scriptio/initializer';
import {ReflectMapper} from "../mapper/ReflectMapper";
import {IAdapter} from "./index";
import {Engine} from "../engine/index";


let onError = (x:any)=> (e:Error)=> logger.error(`Ts: ${x}, error: ${e}`);

/***
 * TKey: primary key type
 * @param target , Type: Function 
 * @param engine , sql Engine
 * @param initializer, script initializer , schema initializer, Code First, 
 * @returns {Promise<ReflectAdapter<LoggerInstance, TKey>>}
 */
export async function createAdapter<T extends Function, TKey>(
    target:T,
    engine: Engine,
    initializer?: { reader?:ScriptReader, writer?:SqlWriter} )
: Promise<IAdapter<T,TKey>> {

    var meta = getTable(target);

    initializer = initializer || {};
    initializer.reader = meta.script ? new CustomLocationScriptReader(meta.script) : (initializer.reader || new FileSystemReader('/sql-scripts') );
    initializer.writer = initializer.writer || new SqlBatchWriter(engine);

    return tableSchemaInitializer.runOnce(meta.name, initializer.reader, initializer.writer)
            .value
            .then(result => logger.debug(`init ${meta.name}, ok`))
            .then(()=>{
                return new ReflectAdapter<T,TKey>(
                    engine,
                    new ReflectMapper<T,TKey>(),
                    meta);
            })
            .catch(onError(`${meta.name}: init: `));
}
