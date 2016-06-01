import {Engine} from "../engine";
import {SqlWriter} from "./index";

export class SqlBatchWriter implements SqlWriter {

    constructor(private db:Engine) {
        
    }

    write = (script:string):Promise<any> => {
        return this.db.exec(...script.split('<!--GO-->'));
    }
}



