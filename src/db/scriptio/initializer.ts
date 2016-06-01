
import {cached} from "../../cached/";

export interface TableSchemaInitializer{

    read(sKey: string):Promise<string> ;

    write(script:string):Promise<any>;

    run(k:string) : Promise<any> ;
}

export class Initializer implements  TableSchemaInitializer {

    @cached
    run(key:string) : Promise<any> {
        return null;
    };
    read(sKey: string):Promise<string> {
        return null;
    };

    write(script:string):Promise<any>{
        return null;
    };

    constructor( reader : ScriptReader,  writer: SqlWriter){
        this.read = reader.read ;
        this.write = writer.write;
        this.run  = (key)=>
            this.read(key).then(s=> this.write ? this.write(s) : s );
    }
}


export interface ScriptReader {
    read (sKey: string) : Promise<string>;
}
export interface SqlWriter {
    write (script:string) : Promise<any>;
}



