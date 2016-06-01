import {Lazy} from '../../lazy';

import {ScriptReader, SqlWriter} from "./";

let _scripts = new Map<string,Lazy<Promise<any>>>();

/***
 * reads from reader writes to writer(engine), once by key   
 * @param key
 * @param reader provider data to writer , a script 
 * @param writer  'what to do with whatever reader brings, default : send to sqlEngine 
 * @returns {Lazy<Promise<any>>}
 */
export function runOnce(key:string,
                        reader: ScriptReader,
                        writer: SqlWriter
): Lazy<Promise<any>> {
    
    var lazy = _scripts.get(key) || new Lazy(async ()=> {
            var s  = await reader.read(key);
            return writer.write(s)
        });
    
    _scripts.set(key, lazy);
    
    return lazy;
}


