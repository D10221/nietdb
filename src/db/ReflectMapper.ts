import * as mapper from './mapper'
import {TableMeta} from "./metadata";

export class  ReflectMapper<T,TKey> implements mapper.IMapper<T, TKey> {
    
    getSelect =  mapper.getSelect ;

    getInsert(meta:TableMeta, target:Object): Promise<string> {
        return new Promise(
            resolve => resolve(
                mapper.getInsert(meta,target)
            )
        )
    }
    getKeyName =  mapper.getKeyName ;
    
    getKeyPredicate =  mapper.getKeyPredicate ;
    
    getUpdate(meta: TableMeta,target: Object){
        return new Promise<string>((rs,rj)=>{
           try{
               rs(mapper.getUpdate(meta,target));
           } catch(e){
               rj(e);
           }
        });
    }
}

