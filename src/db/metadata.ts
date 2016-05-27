import * as _ from "underscore";


export interface MetaColumn {
    /***
     * none, key, notMapped, readOnly
     */
    attr?:string[];

    /***
     * text,number, date ...  
     */
    type?:string;

    /***
     * column name 
     */
    name:string;

    /***
     * object's property to map column name to ...
     */
    prop?:string;
}

export interface MetaTable {
    name:string;
    columns?:MetaColumn[];
}

export function table(meta:MetaTable) {
    return (target:any)=>{
        Reflect.defineMetadata('meta:table', meta, target);
    }
}

export function column(meta:MetaColumn) {
    return (target:any, key:string) => {
        meta.prop = meta.prop || key;
        Reflect.defineMetadata('meta:table', meta , target, key);
    }
}

function isDefined (x) {
    return!_.isUndefined(x);
}

export function getMetaColumn(target: any, key: string) {
    var metaColumn = Reflect.getMetadata('meta:table', target, key) as MetaColumn;
    metaColumn.type = metaColumn.type || typeof target[key];

    return metaColumn;
}

/***
 * Get metadata from Reflect-metadata, TODO: how to get properties metadata without an instance ?  
 */
export function getMetaTable(x:Object|string) : MetaTable{
  
    if(_.isString(x)){
        throw 'not implemented';
    }
    
    var table = Reflect.getMetadata('meta:table', x.constructor ) as MetaTable || { name: null};
    
    table.columns = Object.keys(x)
        .map(key => getMetaColumn(x,key))
        .filter(isDefined);
    
    return table;
    
}

