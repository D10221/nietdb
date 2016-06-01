
import {ReflectMapper} from "./mapper/ReflectMapper";
import {IMapper} from "./mapper/mapper";
import {TableMeta} from "./metadata";
import {IAdapter, getAll, IiD, getById, update, insert, getWhere} from "./adapter";


export class ReflectAdapter<T,TKey> implements IAdapter<T, TKey> {

    all = () => getAll<T, TKey>(this.mapper, this.meta);

    insert(target:T) {
        return insert<T,TKey>(this.mapper, this.meta, target)
    }

    updte = (target:T)=> update<T,TKey>(this.mapper, this.meta, target);

    /***
     *
     * @param id || {id:TKey}
     */
    byId = (id:TKey | IiD<TKey>) => getById<T,TKey>(this.mapper, this.meta, id);

    where = (w:string)=> getWhere<T,TKey>(this.mapper, this.meta, w);

    mapper:IMapper<T,TKey>;

    constructor(private meta:TableMeta, mapper?:IMapper<T,TKey>) {

        this.mapper = mapper || new ReflectMapper<T,TKey>();
    }
}

