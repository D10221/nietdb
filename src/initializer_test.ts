import * as itz from './db/initializer';
import * as chai from 'chai';
import {ScriptReader, SqlWriter} from "./db/scriptio/";



let assert = chai.assert;

describe('initializer',()=>{
    it('works',async ()=>{
        
        var reads = 0 ; 

        var writes = 0;
        
        var reader : ScriptReader  = {
            read: (k) => new Promise<string>((rs,rj)=>{
                reads++;
                rs(k+"_ok")
            })
        };
        
        var writer : SqlWriter = {
            write: (s)=> new Promise((resolve,reject)=>{
                writes++;
                if(s=="x_ok"){
                    resolve();
                    return;
                }
                reject(false);
            })
        };
        
        var lazy = itz.tSetup('x', reader, writer);
        
        await lazy.value.catch(e=>{
            throw e;
        });

        assert.equal(reads,1);
        assert.equal(writes,1);

        await lazy.value.catch(e=>{
            throw e;
        });
        
        assert.equal(reads,1);
        assert.equal(writes,1);
        
                
    });
});