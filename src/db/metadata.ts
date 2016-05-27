import * as _ from "underscore";


export interface MetaColumn {
    /***
     * none, key, notMapped, readOnly
     */
    attr?:string[];
    
    type?:string;
    name:string;
    prop?:string;
}

export interface MetaTable {
    name:string;
    columns?:MetaColumn[];
}



export function tableMeta(meta:MetaTable) {
    return (target:any)=>{
        Reflect.defineMetadata('meta:table', meta, target);
    }
}

export function columnMeta(meta:MetaColumn) {
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

export function getMeta( x:Object) : MetaTable{
  
    var table = Reflect.getMetadata('meta:table', x.constructor ) as MetaTable || { name: null};
    
    table.columns = Object.keys(x)
        .map(key => getMetaColumn(x,key))
        .filter(isDefined);
    
    return table;
    
}