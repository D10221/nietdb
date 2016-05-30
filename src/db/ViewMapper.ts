import * as fs from 'fs';
import * as path from 'path';
import * as mapper from './mapper'
import * as m from  "./metadata";
import {Lazy} from "../lazy";
import {cached} from "../cached";


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
            s = s.replace(`@${name}`, mapper.getValue(col, target));
        });

    return s;
}
/***
 * for views instead of tables
 */
export class ViewMapper<T> implements mapper.IMapper<T> {
    /*
     *  getSelect(meta:TableMeta) : string;
     getInsert(meta, target: T) : string;
     getKeyName(meta:TableMeta):any;
     getKeyPredicate(meta:TableMeta, id:{id:any}):string;
     getUpdate(meta:TableMeta, target: T ):string ;
     */

    /***
     * Select still can be done by mapping Meta-Data
     * @type {function(TableMeta): string }
     */
    getSelect = mapper.getSelect;
    
    //@cached
    getScript(meta, postFix) : Lazy<Promise<string>>{
        return getScript(meta, postFix);
    }
    
    /***
     *   Insert  might not be possible , provide script ?
     * @param meta
     * @param target
     */
    async getInsert(meta:m.TableMeta, target:Object): Promise<string> {
        
        var script = await this.getScript(meta, 'insert').value;
        
        return `${script} VALUES ( ${mapValues(meta, target, script)})`;
    }

    getKeyName = meta => mapper.getKeyName;

    getKeyPredicate = (meta, id) => mapper.getKeyPredicate(meta, id);


    /***
     *  Update might not be possible , provide script ?
     * @param meta
     * @param target
     */
    getUpdate = (meta, target)=> mapper.getUpdate(meta, target);
}