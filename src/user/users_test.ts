import * as chai from 'chai';

import logger from '../logger';

let assert = chai.assert;

import * as users from './users';

import {User} from "./user";

function run(){

    describe("users",()=>{

        it('getAll', async (done)=>{

            await users.getAll().then(x=>{
                assert.equal(x.value().length ,1);
            });

            done();

        });

        it('getWhere', async (done)=>{

            await users.getWhere('id = 1')
                .then( x => {
                    var user = x.filter(u=> u.id == 1)
                        .first()
                        .value() as User;
                    assert.equal(user.id,1);
                } )
                .catch(logger.error);

            done();

        });

        it('getById then Insert', async (done)=>{

            async function _update (u) {
                u.role='!';
                await users.update(u);
                u = await users.getById(1);
                assert.equal(u.role, '!');
            }

            await users.getById(1)
                .then(_update);

            await users.insert({name: 'me', password: 'me', email:'me@me', role: 'me'});

            await users.getWhere("name = 'me'")
                .then(x=>x.first().value() as User)
                .then(u=>
                    assert.equal(u.name, 'me'));

            done();

        });
    })
}

import { drop } from '../db';

drop().then(run).catch(e=>{ throw e;});