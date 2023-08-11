var apigClientFactory = require('aws-api-gateway-client').default;
var apiClientConfig = require('./apigw-config-dev.json');

var apigClient = apigClientFactory.newClient(apiClientConfig);

var pathTemplate = '/openai'
var method = 'POST';
var additionalParams = {};
var request = require('../events/post-openai.json');

apigClient.invokeApi(null, pathTemplate, method, additionalParams, request)
    .then(function(result){
        console.log(request);
        console.log(result.data);
    }).catch( function(result){
    console.error(result);
});
