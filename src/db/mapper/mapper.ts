import {TableMeta, ColumnMeta, getType, isString, isDate} from "../metadata";

export interface IMapper<T extends Object,TKey> {
    getSelect(meta:TableMeta) : string;
    getInsert(meta:TableMeta, target: T) : Promise<string>;
    getKeyName(meta:TableMeta):string;
    //getKeyPredicate(meta:TableMeta, id:{id:TKey}):string;
    getUpdate(meta:TableMeta, target: Object ):Promise<string> ;
}

