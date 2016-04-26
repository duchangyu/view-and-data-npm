/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2015 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
var should = require('chai').should(),
  Lmv = require('../view-and-data'),
  path = require('path');

var testConfig = {
  useResumableUpload: false,
  bucketKey: 'adn-bucket-npm'
}

//only fill up credentials & bucket fields, other fields are defaulted
var config = require('../config-view-and-data');

describe('# View & Data Tests: ', function() {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Get token', function(done) {

    //set a 15'' timeout
    this.timeout(15 * 1000);

    var lmv = new Lmv(config);

    lmv.getToken().then(function(response) {

      console.log('Token Response:');
      console.log(response);

      done();

    }, function(error) {

      done(error);
    });

  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Get bucket (create if does not exist)', function(done) {

    this.timeout(15 * 1000);

    var lmv = new Lmv();

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      var createIfNotExists = true;

      var bucketCreationData = {
        bucketKey: testConfig.bucketKey,
        servicesAllowed: [],
        policyKey: "transient"
      };

      lmv.getBucket(testConfig.bucketKey,
        createIfNotExists,
        bucketCreationData).then(
        onBucketCreated,
        onError);
    }

    function onBucketCreated(response) {

      done();
    }

    lmv.initialize().then(onInitialized, onError);
  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('List buckets', function(done) {

    this.timeout(15 * 1000);

    var lmv = new Lmv();

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      lmv.listBuckets().then(
        onBucketList,
        onError);
    }

    function onBucketList(response) {

      console.log(response);

      done();
    }

    lmv.initialize().then(onInitialized, onError);
  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  var urn = '';

  it('Full workflow (bucket/upload/registration/translation/thumbnail)', function(done) {

    this.timeout(5 * 60 * 1000); //5 mins timeout

    var lmv = new Lmv();

    function onError(error) {

      done(error);
    }

    function onInitialized(response) {

      var createIfNotExists = true;

      var bucketCreationData = {
        bucketKey: testConfig.bucketKey,
        servicesAllowed: [],
        policyKey: "transient"
      };

      lmv.getBucket(testConfig.bucketKey,
        createIfNotExists,
        bucketCreationData).then(
          onBucketCreated,
          onError);
    }

    function onBucketCreated(response) {

      if(testConfig.useResumableUpload){

        lmv.resumableUpload(
          path.join(__dirname, './data/test.dwf'),
          testConfig.bucketKey,
          'test.dwf').then(onResumableUploadCompleted, onError);
      }
      else {

        lmv.upload(
          path.join(__dirname, './data/test.dwf'),
          testConfig.bucketKey,
          'test.dwf').then(onUploadCompleted, onError);
      }
    }

    function onUploadCompleted(response) {

      var fileId = response.objectId;

      urn = lmv.toBase64(fileId);

      lmv.register(urn, true).then(onRegister, onError);
    }

    function onResumableUploadCompleted(response) {

      response.forEach(function(result){

        console.log(result.objects);
      });

      var fileId = response[0].objects[0].id;

      urn = lmv.toBase64(fileId);

      lmv.register(urn, true).then(onRegister, onError);
    }

    function onRegister(response) {

      if (response.Result === "Success") {

        console.log('Translating file...');

        lmv.checkTranslationStatus(
          urn, 1000 * 60 * 5, 1000 * 10,
          progressCallback).then(
            onTranslationCompleted,
            onError);
      }
      else {

        console.log('reg error')

        done(response);
      }
    }

    function progressCallback(progress) {

      console.log(progress);
    }

    function onTranslationCompleted(response) {

      console.log('URN: ' + response.urn);

      lmv.getThumbnail(urn).then(onThumbnail, onError);
    }

    function onThumbnail(response) {

      done();
    }

    //start the test
    lmv.initialize().then(onInitialized, onError);
  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Download Model Data', function(done) {

    this.timeout(5 * 60 * 1000); //5 mins timeout

    var lmv = new Lmv();

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      if(!urn.length) {

        done('Invalid translation, abort download...');
        return;
      }

      lmv.download(urn, './test/data/download').then(
        onDataDownloaded,
        onError
      );
    }

    function onDataDownloaded(items) {

      console.log('Model downloaded successfully');

      var path3d = items.filter(function(item){
        return item.type === '3d';
      });

      console.log('3D Viewable path:');
      console.log(path3d);

      var path2d = items.filter(function(item){
        return item.type === '2d';
      });

      console.log('2D Viewable path:');
      console.log(path2d);

      done();
    }

    //start the test
    lmv.initialize().then(onInitialized, onError);
  });

  ///////////////////////////////////////////////////////////////////
  // 
  //
  ///////////////////////////////////////////////////////////////////
  //it('Unregister model', function(done) {
  //
  //  this.timeout(15 * 1000);
  //
  //  var lmv = new Lmv();
  //
  //  function onError(error) {
  //    done(error);
  //  }
  //
  //  function onInitialized(response) {
  //
  //    lmv.unregister(urn).then(
  //      onUnregistered,
  //      onError);
  //  }
  //
  //  function onUnregistered(response) {
  //
  //    console.log(response);
  //
  //    done();
  //  }
  //
  //  lmv.initialize().then(onInitialized, onError);
  //});
});