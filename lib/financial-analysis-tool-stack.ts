import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import { Configuration, OpenAIApi } from "openai";
export class FinancialAnalysisToolStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope, id, props);

        // API Gateway
        const api = new apigateway.RestApi(this, 'financial-tool-api');

        const apiKey = api.addApiKey('api-key-fin', {
            apiKeyName: 'api-key-fin',
        });

        const balanceSheet = api.root.addResource('balanceSheet');
        const incomeStatement = api.root.addResource('incomeStatement');
        const cashFlow = api.root.addResource('cashFlow');
        const openai = api.root.addResource('openai');
        const openaiRedFlags = api.root.addResource('openaiRedFlags');

        const balanceSheetTable = new dynamodb.Table(this, 'balanceSheets', {
            tableName: 'BalanceSheet',
            partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
            removalPolicy: RemovalPolicy.RETAIN
        });
        const incomeStatementTable = new dynamodb.Table(this, 'incomeStatements', {
            tableName: 'IncomeStatement',
            partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
            removalPolicy: RemovalPolicy.RETAIN
        });
        const cashFlowTable = new dynamodb.Table(this, 'cashFlows', {
            tableName: 'CashFlow',
            partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
            removalPolicy: RemovalPolicy.RETAIN
        });

        const saveBalanceSheetData = new lambda.Function(this, 'saveBalanceSheetData', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/balanceSheet')),
            timeout: Duration.seconds(120),
            environment: {
                DYNAMODB_TABLE: balanceSheetTable.tableName
            },
            memorySize: 3008,
        });


        const saveIncomeStatementData = new lambda.Function(this, 'saveIncomeStatementData', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/incomeStatement')),
            timeout: Duration.seconds(120),
            environment: {
                DYNAMODB_TABLE: incomeStatementTable.tableName
            },

            memorySize: 3008,
        });

        const getAllBalanceSheetRecords = new NodejsFunction(this, 'getAllBalanceSheetRecords', {
            handler: 'handler',
            entry: path.join(__dirname, '../functions/balanceSheet/getAllElements.js'), 
            timeout: Duration.seconds(120),
            environment: {
                DYNAMODB_TABLE: balanceSheetTable.tableName
            },
            memorySize: 3008,
        });


        const getAllIncomeStatementRecords = new NodejsFunction(this, 'getAllIncomeStatementRecords', {
            handler: 'handler',
            entry: path.join(__dirname, '../functions/incomeStatement/getAllElements.js'), 
            timeout: Duration.seconds(120),
            environment: {
                DYNAMODB_TABLE: incomeStatementTable.tableName
            },

            memorySize: 3008,
        });


        const saveCashFlowData = new lambda.Function(this, 'saveCashFlowData', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/cashFlow')),
            timeout: Duration.seconds(120),
            environment: {
                DYNAMODB_TABLE: cashFlowTable.tableName
            },
            memorySize: 3008,
        });

        const getApiAnalysis = new lambda.Function(this, 'getApiAnalysis', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/openai')),
            timeout: Duration.seconds(120),
            memorySize: 3008,
        });

    
        const getFinancialRatios = new NodejsFunction(this, 'getFinancialRatios', {
            handler: 'handler',
            entry: path.join(__dirname, '../functions/openai/getFinancialRatios.js'), 
            timeout: Duration.seconds(120),
            memorySize: 3008,
        });

        const getRedFlags = new lambda.Function(this, 'getRedFlags', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/redFlags')),
            timeout: Duration.seconds(120),
            memorySize: 3008,
        });

        const postIndustryAnalysis = new NodejsFunction(this, 'postIndustryAnalysis', {
            handler: 'handler',
            entry: path.join(__dirname, '../functions/redFlags/postIndustryAnalysis.js'),
            timeout: Duration.seconds(120),
            memorySize: 3008,
        });

        balanceSheetTable.grantReadWriteData(saveBalanceSheetData);
        incomeStatementTable.grantReadWriteData(saveIncomeStatementData);
        cashFlowTable.grantReadWriteData(saveCashFlowData);

        balanceSheetTable.grantReadWriteData(getAllBalanceSheetRecords);
        incomeStatementTable.grantReadWriteData(getAllIncomeStatementRecords);


        balanceSheetTable.grantReadWriteData(getApiAnalysis);
        incomeStatementTable.grantReadWriteData(getApiAnalysis);

        balanceSheetTable.grantReadWriteData(getFinancialRatios);
        incomeStatementTable.grantReadWriteData(getFinancialRatios);

        balanceSheetTable.grantReadWriteData(getRedFlags);
        incomeStatementTable.grantReadWriteData(getRedFlags);

        balanceSheetTable.grantReadWriteData(postIndustryAnalysis);
        incomeStatementTable.grantReadWriteData(postIndustryAnalysis);

        const saveBalanceSheetDataIntegration = new apigateway.LambdaIntegration(saveBalanceSheetData);
        const saveIncomeStatementIntegration = new apigateway.LambdaIntegration(saveIncomeStatementData);
        const saveCashFlowIntegration = new apigateway.LambdaIntegration(saveCashFlowData);
        const getAllBalanceSheetRecordsIntegration = new apigateway.LambdaIntegration(getAllBalanceSheetRecords);
        const getAllIncomeStatementRecordsIntegration = new apigateway.LambdaIntegration(getAllIncomeStatementRecords);
        const getApiAnalysisIntegration = new apigateway.LambdaIntegration(getApiAnalysis);
        const getFinancialRatiosIntegration = new apigateway.LambdaIntegration(getFinancialRatios);
        const getRedFlagsIntegration = new apigateway.LambdaIntegration(getRedFlags);
        const postIndustryAnalysisIntegration = new apigateway.LambdaIntegration(postIndustryAnalysis);

        const balanceSheetPostMethod = balanceSheet.addMethod('POST', saveBalanceSheetDataIntegration, {
            apiKeyRequired: true,

        });

        const incomeStatementPostMethod = incomeStatement.addMethod('POST', saveIncomeStatementIntegration, {
            apiKeyRequired: true
        });

        const cashFlowPostMethod = cashFlow.addMethod('POST', saveCashFlowIntegration, {
            apiKeyRequired: true
        });

        const balanceSheetGetMethod = balanceSheet.addMethod('GET', getAllBalanceSheetRecordsIntegration, {
            apiKeyRequired: true,
        });

        const incomeStatementGetMethod = incomeStatement.addMethod('GET', getAllIncomeStatementRecordsIntegration, {
            apiKeyRequired: true
        });

        const apiGetMethod = openai.addMethod('GET', getApiAnalysisIntegration, {
            apiKeyRequired: true
        });

        const financialRatiosPostMethod = openai.addMethod('POST', getFinancialRatiosIntegration, {
            apiKeyRequired: true
        });

        const redFlagsGetMethod = openaiRedFlags.addMethod('GET', getRedFlagsIntegration, {
            apiKeyRequired: true
        });

        const industryAnalysisPostMethod = openaiRedFlags.addMethod('POST', postIndustryAnalysisIntegration, {
            apiKeyRequired: true
        });

        const plan = api.addUsagePlan('UsagePlan', {
            name: 'standardUsagePlan',
            quota: {
                limit: 1000,
                period: apigateway.Period.DAY
            },
            throttle: {
                burstLimit: 100,
                rateLimit: 100,
            }
        });

        plan.addApiKey(apiKey);

        const throttlingSettings = [balanceSheetPostMethod,
            incomeStatementPostMethod, cashFlowPostMethod, balanceSheetGetMethod, incomeStatementGetMethod,
            apiGetMethod, financialRatiosPostMethod, redFlagsGetMethod, industryAnalysisPostMethod].map(elem => {
            return {
                method: elem,
                throttle: {
                    burstLimit: 1000,
                    rateLimit: 1000,
                }
            }
        });
        plan.addApiStage({
            stage: api.deploymentStage,
            throttle: throttlingSettings
        });

        // EventBridge
        const eventBus = new events.EventBus(this, 'financialAnalysisToolBus');

        const cloudWatchLogGroup = new logs.LogGroup(this, 'eventBridgeLogGroup', {
            logGroupName: 'financialLogs',
            retention: logs.RetentionDays.THREE_MONTHS
        });

        new events.Rule(this, 'cloudWatchRule', {
            eventBus: eventBus,
            eventPattern: {
                source: [{ prefix: ''}] as any[]
            },
            targets: [
                new targets.CloudWatchLogGroup(cloudWatchLogGroup)
            ]
        })

    }
}
