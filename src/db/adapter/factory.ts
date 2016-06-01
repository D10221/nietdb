import logger from '../../logger';
import {ReflectAdapter} from "./ReflectAdapter";
import {ScriptRepoReader, CustomLocationScriptReader} from "../scriptio/readers";
import {SqlBatchWriter} from "../scriptio/writers";
import {getTable, TableMeta} from "../metadata";
import {ReflectMapper} from "../mapper/ReflectMapper";
import {IAdapter} from "./index";
import {Engine} from "../engine/index";
import {Initializer, ScriptReader, SqlWriter} from "../scriptio/initializer";
import {TableSchemaInitializer} from "../scriptio/initializer";
import {cached} from "../../cached";


let onError = (x:any)=> (e:Error)=> logger.error(`Ts: ${x}, error: ${e}`);



export class Factory {

    _cache = new WeakMap<any, any> ();

    constructor(private engine:Engine){

    }

    makeAdapter<T extends Function, TKey>(target:T, initializer?:TableSchemaInitializer):Promise<IAdapter<T,TKey>> {

        var meta = getTable(target);

        initializer = initializer || selectInitializer(meta, this.engine);

        return initializer.run(meta.name)
            .then(result => logger.debug(`init ${meta.name}, ok`))
            .then(()=> {
                var adapter = this._cache.get(target);
                if(!adapter){
                    this._cache.set(target, new ReflectAdapter<T,TKey>(
                        this.engine,
                        new ReflectMapper<T,TKey>(),
                        meta))
                }
                return this._cache.get(target);
            })
            .catch(onError(`${meta.name}: init: `));
    }
}

export function selectInitializer(meta:TableMeta, engine:Engine, reader?:ScriptReader, writer?:SqlWriter) {
    return new Initializer(
        meta.script ? new CustomLocationScriptReader(meta.script) : (reader || new ScriptRepoReader('/sql-scripts') ),
        writer || new SqlBatchWriter(engine)
    );
}