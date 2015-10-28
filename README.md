# Autodesk View and Data API NPM Package


## Description

This is the official [NPM](https://www.npmjs.com) package for
the [Autodesk View & Data API](https://developer.autodesk.com/api/view-and-data-api/).


## Setup

- As usual:

        $ npm install view-and-data

- Request your own API keys from our developer portal [developer.autodesk.com](http://developer.autodesk.com).
- Replace the credentials placeholders with your own keys in `config-view-and-data.js` or use ENV variables:

        ConsumerKey: process.env.CONSUMERKEY || '<replace with your consumer key>',
        ConsumerSecret: process.env.CONSUMERSECRET || '<replace with your consumer secret>'

- Set up the default bucket name defined by the `defaultBucketKey` variable.
- Copy the file `config-view-and-data.js` to your server config directory.


## Test

Make sure to set up your consumer key and secret and the default bucket name in `config-view-and-data.js` as described above, then run the following commands in the `node_modules/view-and-data/` folder:

    $ npm install
    $ npm test


## Usage

Here is a simple example on how to use the library. It will retrieve or create the specified bucket
(you will need to modify that value in config-view-and-data.js or provide directly a unique bucket name,
see [that article](http://adndevblog.typepad.com/cloud_and_mobile/2015/01/buckets-in-autodesk-view-and-data-api.html) for more details).
Then it will upload the test.dwf file, monitor it's translation status and get the thumbnail of model if
the translation is successful.

      //Make sure config-view-and-data.js is copied at indicated location
      //in your server and that you filed up the API credentials as indicated above

      var config = require('your-server-config/config-view-and-data');
      var Lmv = require('view-and-data');

      var lmv = new Lmv(config);

      //you probably want a more specific error handler...
      function onError(error) {
        console.log(error);
      }

      //wrapper is initialized. Token refreshment will happen automatically
      //no need to worry about it
      function onInitialized(response) {

        var createIfNotExists = true;

        var bucketCreationData = {
          bucketKey: config.defaultBucketKey,
          servicesAllowed: {},
          policy: 'transient' //['temporary', 'transient', 'persistent']
        };

        lmv.getBucket(config.defaultBucketKey,
          createIfNotExists,
          bucketCreationData).then(
            onBucketCreated,
            onError);
      }

      //bucket retrieved or created successfully
      function onBucketCreated(response) {

        //see resumableUpload instead for large files

        lmv.upload(path.join(__dirname, './data/test.dwf'),
          config.defaultBucketKey,
          'test.dwf').then(onUploadCompleted, onError);
      }

      //upload complete
      function onUploadCompleted(response) {

        var fileId = response.objects[0].id;

        urn = lmv.toBase64(fileId);

        lmv.register(urn, true).then(onRegister, onError);
      }

      //registration complete but may have failed
      //need to check result
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
          console.log(response);
        }
      }

      //optional translation progress callback
      //may be used to display progress to user
      function progressCallback(progress) {

        console.log(progress);
      }

      //file ready for viewing
      function onTranslationCompleted(response) {

        console.log('URN: ' + response.urn);

        lmv.getThumbnail(urn).then(onThumbnail, onError);
      }

      //thumbnail retrieved successfully
      function onThumbnail(response) {

        //response: base64 encoded thumbnail data
        //ex: var imgsrc = "data:image/png;base64," + response;
        //<img src=imgsrc>
      }

      //start the test
      lmv.initialise().then(onInitialized, onError);

## Offline

The package now allows you to download the full viewable package on your disk to run the viewer completely offline.
Here is an example that illustrates downloading a model packge from its URN:

    var lmv = new Lmv(config);

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      // downloads package to target directory,
      // creates recursively if not exists
      lmv.download(urn, '.test/data/download').then(
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
    }

    //start the test
    lmv.initialize().then(onInitialized, onError);

To load the model from downloaded package:

    //<div id="viewer-local"></div> in your html
    var viewer = new Autodesk.Viewing.Private.GuiViewer3D(
      document.getElementById('viewer-local'));
    
    var options = {
      docid: viewablePath[0].path,
      env: 'Local'
    };

    Autodesk.Viewing.Initializer (options, function () {

      viewer.initialize();

      viewer.load(options.docid);
    });

## License

[MIT License](http://opensource.org/licenses/MIT).


## Written by

- [Cyrille Fauvel](http://around-the-corner.typepad.com/adn/cyrille-fauvel.html)
- [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)

Autodesk Developer Network.
