
export interface ScriptReader {
    read : (sKey: string)=> Promise<string> ;
}
export interface SqlWriter {
    write:(script:string) => Promise<any>;
}