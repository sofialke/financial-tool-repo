'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { OpenAIApi, Configuration } = require('openai');

const configuration = new Configuration({
    apiKey: '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',
  });
const openai = new OpenAIApi(configuration);
exports.handler = async function(event, context, callback) {

    const body = JSON.parse(event.body);
    console.log(event);
    console.log(body);
    var params1 = {
        TableName: 'BalanceSheet'
      };
    var params2 = {
        TableName: 'IncomeStatement'
    };
    const scanResultsBalanceSheet = [];
    const scanResultsIncomeStatement = [];
    let items1;
    let items2;
    try
    {
        do{
            items1 = await dynamoDb.scan(params1).promise();
            items1.Items.forEach((item) => scanResultsBalanceSheet.push(item));
            params1.ExclusiveStartKey = items1.LastEvaluatedKey;
        }while(typeof items1.LastEvaluatedKey !== "undefined");

        do{
            items2 = await dynamoDb.scan(params2).promise();
            items2.Items.forEach((item) => scanResultsIncomeStatement.push(item));
            params2.ExclusiveStartKey = items2.LastEvaluatedKey;
        }while(typeof items2.LastEvaluatedKey !== "undefined");

        const prompt = "give me only financial ratios based on this balance sheet and income statement: 1. balance sheet" + items1 + "2. income statement" + items2;
        console.log(prompt);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            prompt: prompt,
            temperature: 1,
            max_tokens: 16384
          });
        console.log(response.data.choices);
        const resp = {
          statusCode: 200,
          body: JSON.stringify(response.data.choices)
        };
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
          body: JSON.stringify({"error": "Error while calling open ai api to get financial ratios"})
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
