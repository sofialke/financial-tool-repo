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
        const balancesheetData = JSON.stringify(scanResultsBalanceSheet);
        const incomeData = JSON.stringify(scanResultsIncomeStatement);

        const prompt = `As a financial analyst, check for any red flags based on this balance sheet and income statement: 1. balance sheet${balancesheetData}2. income statement${incomeData} make the answer shorter than 2048 tokens`
        console.log(prompt);
        const promptData = {
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 1,
            max_tokens: 2048
        };

        const response = await openai.createCompletion(JSON.stringify(promptData));
        console.log('OpenAI API response:', response.data);
        console.log(response.data.choices);
        const resp = {
          statusCode: 200,
          body: JSON.stringify(response.data.choices),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            }
        };
        return resp;
    }catch(err)
    {
        console.log(err);
        console.log(err.data.error);
        const resp = {
          statusCode: 500,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
          },
          body: JSON.stringify({"error": "Error while calling openai api"})
        };
        console.log(resp);
        return resp;
    };
}
