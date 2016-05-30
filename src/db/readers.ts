import *  as fs from 'fs';

export function fileSystemReader (scriptsLocation: string) : (k: string)=> Promise<string> {
    return sKey=> new Promise((resolve,reject)=>{
        fs.readFile(process.cwd() + `${scriptsLocation}/${sKey}/${sKey}.sql`, (e,data)=>{
            if(e){
                reject(e);
                return;
            }
            resolve(data);
        })
    })
}

export interface ScriptReader {
    read : (sKey: string)=> Promise<string> ;
}

export class FileSystemReader implements  ScriptReader {
    
    read : (sKey: string)=> Promise<string> ;
    
    constructor(scriptsLocation: string){
        
        this.read = fileSystemReader(scriptsLocation);
    }
}
