import *  as fs from 'fs';
import * as path from 'path';
import {ScriptReader} from "./index";

/***
 *  convention based location
 * @param scriptsLocation is dir location relative to CWD
 * @param postFix named 'ex: user.delete.sql, user.withAccounts.sql' where script provides 'sql 'logic' to fill the Model
 * @returns {function(any=): Promise<T>} ... a script promise
 */
export function scriptLocator (scriptsLocation: string, postFix? :string ) : (k: string)=> Promise<string> {

    let location = (sKey:string) => process.cwd() + (postFix
        ? `${scriptsLocation}/${sKey}/${sKey}.${postFix}.sql`
        : `${scriptsLocation}/${sKey}/${sKey}.sql`);

    return sKey => new Promise((resolve,reject)=> {

        fs.readFile(location(sKey), 'utf-8',(e, data)=>{
            if(e){
                reject(e);
                return;
            }
            resolve(data);
        })
    })
}

/***
 *
 * @param scriptPath absolute or relative url , if relative . relative to CWD
 * @returns {function(any): Promise<T>}
 */
export function fixedLocator (scriptPath: string) : (k: string) => Promise<string> {

   return sKey => new Promise((resolve,reject)=> {

       var fullPath =  path.isAbsolute(scriptPath) ? scriptPath : path.join(process.cwd() , scriptPath );
       
       fs.readFile(fullPath , 'utf-8', (e, data)=>{
            if(e){
                reject(e);
                return;
            }
            resolve(data);
        })
    })
}

export class FileSystemReader implements  ScriptReader {
    
    read : (sKey: string)=> Promise<string> ;
    
    constructor(scriptsLocation: string,postFix? :string){

        this.read = scriptLocator(scriptsLocation, postFix);
    }
}

export class CustomLocationScriptReader implements  ScriptReader {

    read : (sKey: string)=> Promise<string> ;

    constructor(scriptsLocation: string){

        this.read = fixedLocator(scriptsLocation);
    }
}


