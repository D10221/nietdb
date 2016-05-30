import {TableMeta, ColumnMeta, getType, isString, isDate} from "./metadata";


function any<T>(many:T[], predicate:(t:T)=> boolean):boolean {
    return many ? many.filter(predicate).length > 0 : false;
}
export function isReadOnly(k:string) {
    return any(['readonly', 'key', 'notMapped'], x=> x == k);
}

export function canWrite(col:ColumnMeta):boolean {
    return !any(col.attr, isReadOnly);
}

function canRead(col:ColumnMeta):boolean {
    return !any(col.attr, k=> k in ["notMapped"]);
}

export function allWritableColumns(meta:TableMeta):ColumnMeta[] {
    return meta.columns.filter(canWrite);
}

export function allWritableColumnNames(meta:TableMeta):string[] {
    return allWritableColumns(meta).map(col=> col.name);
}

function allReadableColumns(meta:TableMeta):string[] {
    return meta.columns.filter(canRead).map(col=> col.name);
}

export function getSelect(meta:TableMeta):string {
    return `select ${allReadableColumns(meta)} from ${meta.name}`
}

export function getInsertColumns(meta:TableMeta):string {
    return allWritableColumnNames(meta).join(',')
}

export function getInsert(meta:TableMeta, target:Object):string {
    return `INSERT INTO ${meta.name} (${getInsertColumns(meta)}) VALUES (${getValues(meta, target, canWrite)})`;
}

var getKeyColumn = function (meta:TableMeta):ColumnMeta {
    return meta.columns.filter(m=> any(m.attr, k=> k == 'key'))[0];
};

export function getKeyName(meta:TableMeta):string {
    var filter = getKeyColumn(meta);
    return filter ? filter.name : '';
}

export function getKeyValue(meta:TableMeta, target:Object):any {
    return target[getKeyColumn(meta).prop];
}

export function getKeyPredicate(meta:TableMeta, target?:Object):string {
    return `${getKeyName(meta)}=${getKeyValue(meta, target)}`;
}

export function getUpdate(meta:TableMeta, target:Object) {

    var map = allWritableColumns(meta).map(col=> `${col.name}=${getValue(col, target)}`).join(',');

    return `UPDATE ${meta.name} SET ${map} WHERE ${getKeyPredicate(meta, target)}`;
}

export function needsQuotes  (target:Object, c:ColumnMeta) {
    var type = getRuntimeType(target, c);
    return  isString(type) || isDate(type) ;
}

var getValue = function (c:ColumnMeta, target:Object):string {

    var value = target[c.prop] ? target[c.prop].toString() : 'NULL';

    if (needsQuotes(target, c)) {
        return `'${value}'`;
    }

    return value;
};

//TODO: @Cache || @Memoise
function getRuntimeType( target,c:ColumnMeta) : String|Number|Date|Object{
    //type from instance
    return c.type || getType(target, c.prop);
}

export function getValues(meta:TableMeta, target:Object, predicate:(c:ColumnMeta) => boolean):string {
    return meta.columns
        .filter(predicate)
        .map(c=> getValue(c, target)).join(',');
}