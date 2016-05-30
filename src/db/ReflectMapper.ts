import * as mapper from './mapper'
import {TableMeta} from "./metadata";

export class  ReflectMapper<T> implements mapper.IMapper<T> {
    
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
    
    getUpdate =  mapper.getUpdate; 
}

