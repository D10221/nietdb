import * as _ from "underscore";

import getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;


export interface ColumnMeta {
    /***
     * none, key, notMapped, readOnly
     */
    attr?:string[];

    /***
     * text,number, date ...  
     */
    type?:String|Date|Number|Object;

    /***
     * column name 
     */
    name:string;

    /***
     * object's property to map column name to ...
     */
    prop?:string;
}

export interface TableMeta {
    name:string;
    script?: string;
    columns?:ColumnMeta[];
}


export function getColumnKeys(target:Function) : string[] {
    return Reflect.getMetadataKeys(target.prototype).map(x=> x.replace('x:column:', ''));
}

export function getTable(target:Function): TableMeta {
    var meta = Reflect.getMetadata('x:table',target);
    // everything defined with @table
    if(meta.columns){
        return meta;
    }
    meta.columns = getColumns(target);
    return meta;
}


export function getColumn(target:Function, key: string|symbol){
    var meta = Reflect.getOwnMetadata(`x:column:${key}`,target.prototype);
    meta.type = meta.type || getType(target, key);
    return meta;
}

export function getColumns(target:Function) : ColumnMeta[] {
    return getColumnKeys(target).map(k=> getColumn(target, k));
}

export  function column(meta:ColumnMeta){
    //defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey: string | symbol)
    return (target:Object,key:string )=> {
        meta.prop = key;
        Reflect.defineMetadata(`x:column:${key}`, meta,target)
    };
}

export function table(meta:TableMeta){
    return Reflect.metadata('x:table',meta)
}

export function getType(target:Function|Object, key: string|symbol ) : any {
    return Reflect.getMetadata('design:type',
        _.isFunction(target)  ?  (target as Function).prototype : target,
        key);
}

export function isString(x:any) : x is String {
    return x && x.name && x.name.toString().toLowerCase() == 'string' ;
}

export function isDate(x:any) : x is Date {
    return x && x.name && x.name.toString().toLowerCase() == 'date' ;
}

export function isNumber(x:any) : x is Number {
    return x.name == 'Date' ;
}





