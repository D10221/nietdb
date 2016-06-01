export interface IiD<TKey> {
    id:TKey
}
export interface IAdapter<T, TKey> {
    all():Promise<_Chain<T>> ;
    insert(t:T):Promise<TKey> ;
    updte(t:T):Promise<boolean>;
    where(w:string):Promise<_Chain<T>>;
    byId(id?:TKey | { id:TKey }):Promise<T>;
}
