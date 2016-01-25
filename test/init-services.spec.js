import { expect } from 'chai';
import { omit as _omit } from 'lodash';

import initServices from '../src/init-services';

// Helper function to `expect` functions with args
// Usage : `expectCalling(myFunc).withArgs('badArg').to.throw(/gtfo/)`
let expectCalling = func => ({ withArgs: (...args) => expect(() => func(...args)) });

const badConfig = {
    firebase: {
        instance: '',
        secret: ''
    },
    algolia: {
        applicationId: '',
        apiKey: ''
    }
};

// Environment variables must be provided for the tests to work
const goodConfig = {
    firebase: {
        instance: process.env.FIREBASE_INSTANCE,
        secret: process.env.FIREBASE_SECRET,
        path: process.env.FIREBASE_PATH || 'algolia',
        uid: process.env.FIREBASE_UID || 'algolia'
    },
    algolia: {
        applicationId: process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_API_KEY
    }
};

describe('Third party services initialization', function() {
    // Take your time, baby (1min/test)
    this.timeout(60 * 1000);

    let config;

    beforeEach(function() {

        config = { ...goodConfig };

    });

    it('should init Firebase correctly with a valid config', function() {

        expectCalling(initServices).withArgs(config).to.not.throw(Error);

        return initServices(config)
            .then(({ fb }) => fb.child('.info').once('value'))
            .then(data => {

                expect(data.val()).to.be.ok

            });

    });

    it('should init Firebase correctly even without auth', function() {

        config.firebase = _omit(config.firebase, ['secret', 'uid']);

        expectCalling(initServices).withArgs(config).to.not.throw(Error);

        return initServices(config)
            .then(({ fb }) => fb.child('.info').once('value'))
            .then(data => {

                expect(data.val()).to.be.ok

            });

    });

    it('should connect to Algolia with a valid config', function() {

        expectCalling(initServices).withArgs(config).to.not.throw(Error);

        return initServices(config)
            .then(({ algolia }) => algolia.listIndexes());

    });

    it('should throw if Firebase values are missing from config', function(done) {

        config.firebase = badConfig.firebase;

        expectCalling(initServices).withArgs(config).to.throw(/firebase/);

        done();

    });

    it('should throw if Algolia values are missing from config', function(done) {

        config.algolia = badConfig.algolia;

        expectCalling(initServices).withArgs(config).to.throw(/algolia/);

        done();

    });

});

