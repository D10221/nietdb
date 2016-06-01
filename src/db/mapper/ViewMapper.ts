import * as fs from 'fs';
import * as path from 'path';
import * as m from  "../metadata";
import {Lazy} from "../../lazy";
import {TableMeta} from "../metadata";
import {getValue, getSelect, getKeyName, getKeyPredicate} from "./ReflectMapper";
import {IMapper} from "../mapper";


function getScript(meta:m.TableMeta, postFix:string):Lazy<Promise<string>> {
    return new Lazy<Promise<string>>(()=> new Promise((resolve, reject) => {
            var p = path.join(path.dirname(meta.script), meta.name , `${meta.name}.${postFix}.sql`);
            fs.readFile(p, 'utf-8', (e, data)=> {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(data);
            })
        })
    );
}

export function mapValues(meta:m.TableMeta, target:Object, script:string):string {

    var s = script;

    meta.columns
        .forEach(c => {
            var col = (c as m.ColumnMeta);
            var name = col.prop;
            s = s.replace(`@${name}`, getValue(col, target));
        });

    return s;
}

/***
 * for views instead of tables
 */
export class ViewMapper<T,TKey> implements IMapper<T,TKey> {

    /***
     * Select still can be done by mapping Meta-Data
     * @type {function(TableMeta): string }
     */
    getSelect : (meta:TableMeta) => string  = getSelect;
    
    //@cached
    getScript(meta:TableMeta, postFix:string) : Lazy<Promise<string>>{
        return getScript(meta, postFix);
    }
    
    /***
     *   Insert  might not be possible , provide script ?
     * @param meta
     * @param target
     */
    getInsert(meta:m.TableMeta, target:Object): Promise<string> {

        return this.getScript(meta, 'insert')
            .value
            .then(script=>
                mapValues(meta, target, script));
    }

    getKeyName : (meta:TableMeta) => string  =  getKeyName;

    /***
     *  Update might not be possible , provide script ?
     * @param meta
     * @param target
     */
    getUpdate (meta: TableMeta, target: Object ) : Promise<string> {

        return this.getScript(meta, 'update')
            .value //Lazy
            .then(script=>  mapValues(meta, target, script));
    };
}