import * as itz from './db/scriptio/initializer';
import * as chai from 'chai';
import {ScriptReader} from "./db/scriptio/initializer";
import {SqlWriter} from "./db/scriptio/initializer";
import {Initializer} from "./db/scriptio/initializer";


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
        
        var x = await  new Initializer(reader, writer ).run("x");

        assert.equal(reads,1);
        assert.equal(writes,1);

        assert.equal(reads,1);
        assert.equal(writes,1);
        
                
    });
});