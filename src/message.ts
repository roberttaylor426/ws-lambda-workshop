import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { fetchConnectionContext } from './connection';

export const send: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Sending message! (connection id: ${event.requestContext.connectionId})`
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

    const { chatId, participantId } = await fetchConnectionContext(
        documentClient,
        connectionsTableName,
        connectionsTableConnectionIdIndexName,
        event.requestContext.connectionId
    );

    if (!chatId) {
        return {
            statusCode: 500,
            body: ''
        };
    }

    const queryParams = {
        TableName: connectionsTableName,
        KeyConditionExpression: 'ChatId = :chat_id',
        ExpressionAttributeValues: { ':chat_id': chatId }
    };

    const connections = (await documentClient.query(queryParams).promise())
        ?.Items;

    if (!connections) {
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

    await Promise.all(
        connections.map(async ({ ChatId, ConnectionId }) => {
            try {
                await apiGatewayManagementApi
                    .postToConnection({
                        ConnectionId,
                        Data: JSON.stringify({
                            event: 'participantSentMessage',
                            participantId,
                            message: event.body || ''
                        })
                    })
                    .promise();
            } catch (e) {
                if (e.statusCode === 410) {
                    console.log(
                        `Found stale connection, deleting ${ChatId} ${ConnectionId}`
                    );
                    await documentClient
                        .delete({
                            TableName: connectionsTableName,
                            Key: { ChatId, ConnectionId }
                        })
                        .promise();
                } else {
                    throw e;
                }
            }
        })
    );

    return {
        statusCode: 200,
        body: ''
    };
};
