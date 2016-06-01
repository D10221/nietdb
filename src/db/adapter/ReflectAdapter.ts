import { Engine} from '../engine/';

import * as _ from 'underscore';

import {IMapper} from "../mapper";

import {TableMeta} from "../metadata";

import {IiD, IAdapter} from "./index";

export class ReflectAdapter<T,TKey> implements IAdapter<T, TKey> {
    
    constructor(private db:Engine, private mapper: IMapper<T,TKey>, private meta:TableMeta){

    }
     
    all=():Promise<_Chain<T>> => {
        //await init(meta);
        return this.db.getAsync<T>(this.mapper.getSelect(this.meta))
            .then(x =>
                _.chain(x));
    };

    where(w:string):Promise<_Chain<T>> {
        //await init(meta);
        return this.db.getAsync<T>(`${this.mapper.getSelect(this.meta)} where ${w}`)
            .then(x=> _.chain(x));
    }

    async insert(target:T):Promise<TKey> {

        var sql = await this.mapper.getInsert(this.meta, target);

        return this.db.runAsync(sql).then(r=> r.result);
    }

    byId(id?:TKey | { id:TKey }):Promise<T> {

        var value = hasId(id) ? `${( id as any).id.toString()}` : `${id}`;

        var predicate = `${this.mapper.getKeyName(this.meta)}=${value}`;

        return this.db.getAsync<T>(this.mapper.getSelect(this.meta) + ' WHERE ', predicate)
            .then(x=> x ? x[0] : null);
    }

    async updte(target:Object):Promise<any> {
        var sql = await
        this.mapper.getUpdate(this.meta, target);
        return this.db.runAsync(sql);
    }
}

function hasId<TKey>(x:{id?:TKey}):x is IiD<TKey> {
    return x.hasOwnProperty('id')
}
