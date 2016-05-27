import * as itz from './db/initializer';
import * as chai from 'chai';

let assert = chai.assert;

describe('initializer',()=>{
    it('works',async ()=>{
        
        var reads = 0 ; 
        var writes = 0;
        
        var reader = (k) => {
            reads++;
            return k+"_ok";
        };
        
        var writer = (s)=> new Promise((resolve,reject)=>{
            writes++;
            if(s=="x_ok"){
                resolve();
                return;
            }
            reject(false);
        });
        
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