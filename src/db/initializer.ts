import {Lazy} from '../lazy';

import {FileSystemReader, ScriptReader} from "./readers";
import {SqlWriter, SqlBatchWriter} from "./script_writers";

let _scripts = new Map<string,Lazy<Promise<any>>>();

/***
 * read from reader a script write to sql engine
 * @param key
 * @param reader provider data to writer , a script 
 * @param writer  'what to do with whatever reader brings, default : send to sqlEngine 
 * @returns {Lazy<Promise<any>>}
 */
export function tSetup(key:string,
                       reader?: ScriptReader,
                       writer?: SqlWriter,
                       scriptsLocation?: string
): Lazy<Promise<any>> {

    reader = reader || new FileSystemReader(scriptsLocation||'/sql-scripts') ;

    writer = writer || new SqlBatchWriter();
    
    var lazy = _scripts.get(key) || new Lazy(async ()=> {
            var s  = await reader.read(key);
            return writer.write(s)
        });
    
    _scripts.set(key, lazy);
    
    return lazy;
}


