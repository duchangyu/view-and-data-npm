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
var BASE_URL = 'https://developer.api.autodesk.com';
var VERSION = 'v1';

module.exports = {

  // File resumable upload chunk in MB
  fileResumableChunk: 40,

  // Default bucketKey, used for testing
  // needs to be unique so you better modify it
  defaultBucketKey: 'adn-bucket',

  // Replace with your own API credentials:
  // http://developer.autodesk.com
  credentials: {

    ConsumerKey: process.env.CONSUMERKEY,
    ConsumerSecret: process.env.CONSUMERSECRET
  },

  // API EndPoints
  endPoints:{

    authenticate:     BASE_URL + '/authentication/' + VERSION + '/authenticate',
    getBucket:        BASE_URL + '/oss/' + VERSION + '/buckets/%s/details',
    createBucket:     BASE_URL + '/oss/' + VERSION + '/buckets',
    upload:           BASE_URL + '/oss/' + VERSION + '/buckets/%s/objects/%s',
    resumableUpload:  BASE_URL + '/oss/' + VERSION + '/buckets/%s/objects/%s/resumable',
    register:         BASE_URL + '/viewingservice/' + VERSION + '/register',
    thumbnail:        BASE_URL + '/viewingservice/' + VERSION + '/thumbnails/%s',
    viewable:         BASE_URL + '/viewingservice/' + VERSION + '/%s'
  }
}
