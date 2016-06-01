
import {Engine} from "./";

class NoEngine implements Engine {

    constructor(public connectionString: string){

    }

    exec(...scripts:string[]):Promise<Engine>{
        return new Promise(r=> {
            r(this)
        })
    }

    runAsync<T>(sql:string, ...params:any[]): Promise<{result: any, changes: number }>{
        return new Promise(r=> r(null))
    }

    getAsync<T>(sql:string, ...params:any[]):Promise<T[]> {
        return new Promise(null);
    }

    drop(): Promise<Engine> {
        return new Promise(null)
    }
}
