'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback) {

    const body = JSON.parse(event.body);
    console.log(event);
    console.log(body);
    var params = {
        TableName: process.env.DYNAMODB_TABLE
      };
    console.log(params);
    const scanResults = [];
    let items;
    try
    {
        do{
            items = await dynamoDb.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");

        const resp = {
            statusCode: 200,
            body: JSON.stringify(scanResults),
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
    // body.forEach(async element => {
    //     var params = {
    //         TableName: process.env.DYNAMODB_TABLE,
    //         Item: element
    //     };
    //     console.log(params);
        
    //     try
    //     {
    //         var result = await dynamoDb.put(params).promise();
    //         console.log(result);

    //         console.log(resp);
            
    //         return resp;
    //     }catch(err)
    //     {
    //         console.log(err);
    //         const resp = {
    //           statusCode: 500,
    //           body: JSON.stringify({"error": "Error while saving balance sheet data to the database"})
    //         };
    //         console.log(resp);
    //         return resp;
    //     };
    // });
    
    const resp = {
        statusCode: 200,
        body: JSON.stringify({})
      };
}
