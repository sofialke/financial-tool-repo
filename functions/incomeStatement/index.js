'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback) {

    const body = JSON.parse(event.body);
    console.log(event);
    console.log(body);
    var params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: body
      };
    console.log(params);
    
    try
    {
        const result = await dynamoDb.put(params).promise();
        console.log(result);

        const resp = {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            }
        };

        console.log(resp);
        
        return resp;
    }catch(err)
    {
        console.log(err);
        const resp = {
          statusCode: 500,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
          },
          body: JSON.stringify({"error": "Error while saving balance sheet data to the database"})
        };
        console.log(resp);
        return resp;
    };
}
