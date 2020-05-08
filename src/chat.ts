import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ApiGatewayManagementApi } from 'aws-sdk';

export const join: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    const connectionId = event.requestContext.connectionId;

    if (!connectionId) {
        return {
            statusCode: 500,
            body: ''
        };
    }

    console.log(`Joining chat! (connection id: ${connectionId})`);

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

    const requestBody = JSON.parse(event.body || '');
    const putParams = {
        TableName: connectionsTableName,
        Item: {
            ChatId: requestBody.chatId,
            ConnectionId: connectionId,
            ParticipantId: requestBody.participantId
        }
    };

    await documentClient.put(putParams).promise();

    const apiGatewayManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage
    });

    await apiGatewayManagementApi
        .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                event: 'participantJoinedChat',
                chatId: requestBody.chatId,
                participantId: requestBody.participantId
            })
        })
        .promise();

    return {
        statusCode: 200,
        body: ''
    };
};
