import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export const onConnect: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Connecting! (connection id: ${event.requestContext.connectionId})`
    );

    return emptyOkResponse;
};

export const onMessage: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(`Received message! (message: ${event.body})`)

    await initApiGatewayManagementApi(event).postToConnection({
        ConnectionId: event.requestContext.connectionId || '',
        Data: event.body || ''
    }).promise();

    return emptyOkResponse;
};

const storeConnectionId = async (connectionId: string) => {
    const documentClient = new DocumentClient({
        region: process.env.AWS_REGION
    });

    const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME!;

    const putParams = {
        TableName: connectionsTableName,
        Item: {
            ConnectionId: connectionId,
        }
    };

    await documentClient.put(putParams).promise();
}

const fetchStoredConnectionIds = async (): Promise<string[]> => {
    const documentClient = new DocumentClient({
        region: process.env.AWS_REGION
    });

    const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME!;

    return (await documentClient.scan({
        TableName: connectionsTableName
    }).promise()).Items?.map(item => item.ConnectionId) || []
}

const initApiGatewayManagementApi = (event: APIGatewayProxyEvent) => new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage
    });

const emptyOkResponse = {
    statusCode: 200,
    body: ''
};
