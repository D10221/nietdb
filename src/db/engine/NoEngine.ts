
import {Engine} from "./";

class NoEngine implements Engine {

    _config : {};

    constructor(public connectionString: string){
        this._config = JSON.parse(connectionString);


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

