import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const connect: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Connecting! (connection id: ${event.requestContext.connectionId})`
    );

    return {
        statusCode: 200,
        body: ''
    };
};

export const disconnect: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Disconnecting! (connection id: ${event.requestContext.connectionId})`
    );

    const documentClient = new DocumentClient({
        region: process.env.AWS_REGION
    });

    const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;

    if (!connectionsTableName) {
        return {
            statusCode: 500,
            body: ''
        };
    }

    const connectionsTableConnectionIdIndexName =
        process.env.CONNECTIONS_TABLE_CONNECTION_ID_INDEX_NAME;

    if (!connectionsTableConnectionIdIndexName) {
        return {
            statusCode: 500,
            body: ''
        };
    }

    const { chatId } = await fetchConnectionContext(
        documentClient,
        connectionsTableName,
        connectionsTableConnectionIdIndexName,
        event.requestContext.connectionId
    );

    await documentClient
        .delete({
            TableName: connectionsTableName,
            Key: {
                ChatId: chatId,
                ConnectionId: event.requestContext.connectionId
            }
        })
        .promise();

    return {
        statusCode: 200,
        body: ''
    };
};

export const ping: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    const connectionId = event.requestContext.connectionId;

    console.log(`Pinging! (connection id: ${connectionId})`);

    if (!connectionId) {
        return {
            statusCode: 500,
            body: ''
        };
    }

    const apiGatewayManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage
    });

    await apiGatewayManagementApi
        .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                event: 'pong'
            })
        })
        .promise();

    return {
        statusCode: 200,
        body: ''
    };
};

export const fetchConnectionContext = async (
    documentClient: DocumentClient,
    connectionsTableName: string,
    connectionsTableConnectionIdIndexName: string,
    connectionId: string | undefined
) => {
    const connectionDetails = (
        await documentClient
            .query({
                TableName: connectionsTableName,
                IndexName: connectionsTableConnectionIdIndexName,
                KeyConditionExpression: 'ConnectionId = :connection_id',
                ExpressionAttributeValues: {
                    ':connection_id': connectionId
                }
            })
            .promise()
    )?.Items?.[0];
    const chatId = connectionDetails?.ChatId;
    const participantId = connectionDetails?.ParticipantId;
    return { chatId, participantId };
};
