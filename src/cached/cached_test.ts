import {cached} from "./index";
import {assert} from 'chai';

class TestMeA {

    constructor(private inner = 0 ){

    }
    
    @cached
    getNumber(i:number ){
        return i ;
    }
}

class TestMeB {

    @cached
    getNumber(i:number ){
        return i ;
    }
}

describe('cached', ()=>{
    it('works', ()=>{
        
        var a = new TestMeA();
        
        var b  = new TestMeB();

        assert.equal(a.getNumber(1), 1);
        assert.equal(b.getNumber(0), 0);
        assert.equal(a.getNumber(2), 1);
        assert.equal(b.getNumber(1), 0);
        assert.equal(a.getNumber(3), 1);
        assert.equal(b.getNumber(2), 0);


    });
});