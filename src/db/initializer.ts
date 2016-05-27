import * as fs from 'fs';

import * as db from "../db";

import {Lazy} from '../lazy';


let _scripts = new Map<string,Lazy<Promise<any>>>();

function sqlWriter(script):Promise<any> {
    return Promise.all(db.exec(...script.split('<!--GO-->')));
}

/***
 * read from reader write to writer : once 
 * @param key
 * @param reader provider data to writer , a script 
 * @param writer  'what to do with whatever reader brings, default : send to sqlEngine 
 * @returns {Lazy<Promise<any>>}
 */
export function tSetup(key:string,
                       reader?: (sKey)=> string,
                       writer?:(sKey)=> Promise<any>
): Lazy<Promise<any>> {

    reader = reader || (sKey=> process.cwd() + `/sql-scripts/${sKey}/${sKey}.sql`);

    writer = writer || (sKey=> sqlWriter(fs.readFileSync(sKey, 'utf-8')));
    
    var lazy = _scripts.get(key) || new Lazy(()=> writer(reader(key)));
    _scripts.set(key, lazy);
    
    return lazy;
}