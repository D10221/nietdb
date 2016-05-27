import {MetaTable, MetaColumn} from "./metadata";


function any<T>(many:T[], predicate: (t:T)=> boolean ): boolean {
    return many ? many.filter(predicate).length > 0 : false;
}
export function isReadOnly(k:string){
    return  any(['readonly', 'key', 'notMapped'], x=> x == k );
}

export function canWrite(col: MetaColumn): boolean {
    return !any(col.attr, isReadOnly);
}

function canRead(col: MetaColumn): boolean {
    return !any(col.attr, k=> k in ["notMapped"]);
}

export function allWritableColumns(meta:MetaTable) : MetaColumn[]{
    return meta.columns.filter(canWrite);
}

export function allWritableColumnNames(meta:MetaTable) : string[]{
    return allWritableColumns(meta).map(col=> col.name);
}

function allReadableColumns(meta:MetaTable) : string[]{
    return meta.columns.filter(canRead).map(col=> col.name);
}

export function getSelect(meta: MetaTable):string {
    return `select ${allReadableColumns(meta)} from ${meta.name}`
}

export function getInsertColumns(meta:MetaTable): string {
    return allWritableColumnNames(meta).join(',')
}

export function getInsert(meta:MetaTable, target: Object): string {
    return `INSERT INTO ${meta.name} (${getInsertColumns(meta)}) VALUES (${getValues(meta, target, canWrite)})`;
}

var getKeyColumn = function (meta:MetaTable) : MetaColumn {
    return meta.columns.filter(m=> any(m.attr, k=> k == 'key'))[0];
};

export function getKeyName(meta:MetaTable): string {
    var filter = getKeyColumn(meta);
    return filter ? filter.name: '';
}

export function getKeyValue(meta:MetaTable, target: Object): any {
    return target[getKeyColumn(meta).prop];
}

export function getUpdate(meta:MetaTable, target: Object){
    
    var map = allWritableColumns(meta).map(col=> `${col.name}=${getValue(col,target)}`).join(',');
    
    return `UPDATE ${meta.name} SET ${map} WHERE ${getKeyName(meta)}=${getKeyValue(meta,target)}`;
}

var getValue = function (c: MetaColumn, target:Object) : string {

    var value = target[c.prop] ? target[c.prop].toString() : 'NULL' ;

    if(any(['string', 'text'], k=> k == c.type)){
        return `'${value}'`;
    }
    
    return value;

};
export function getValues(meta:MetaTable, target: Object , predicate:(c:MetaColumn) => boolean) : string {
    return meta.columns
        .filter(predicate)
        .map(c=> getValue(c, target) ).join(',');
}