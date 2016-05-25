import * as test from 'tape';
import logger from './logger';
import * as path from'path';
import * as fs from 'fs';


var recycle = new Promise((rs,rj)=>{
    
   try{
       var p = path.join(__dirname,'./test.db');

       fs.exists(p, ()=> {

           fs.unlink(p);
           logger.info(`Unliked: ${p}`);

       });

       rs();
   }
    catch (e){
        rj(e);
    }
});

import * as users from './db/user/users';

import {User} from "./db/user/user";

 function run(){

    test('it Works', async (t)=>{

        users.getAll().then(x=>{
            t.equals(x.value().length ,1);
        });

        var user: User = null;

        await users.getWhere('id = 1')
            .then( x => {
                user = x.filter(u=> u.id == 1)
                    .first()
                    .value() as User;
                t.equals(user.id,1);
            } )
            .catch(logger.error);

        async function _update (u) {
            u.role='!';
            await users.update(u);
            u = await users.getById(1);
            t.equal(u.role, '!');
        }

        await users.getById(1)
            .then(_update);

        await users.insert({name: 'me', password: 'me', email:'me@me', role: 'me'});

        await users.getWhere("name = 'me'")
            .then(x=>x.first().value() as User)
            .then(u=> t.equal(u.name, 'me'));

        t.end();


    });
}

recycle.then(run).catch(e=>{ throw e;});