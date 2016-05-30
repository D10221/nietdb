import * as db from "../db";

export function sqlBatchWriter(script):Promise<any> {
    return Promise.all(db.exec(...script.split('<!--GO-->')));
}

export interface SqlWriter {
    write: (script:string) => Promise<any>;
}
export class SqlBatchWriter implements SqlWriter{
    write = sqlBatchWriter;
} 



