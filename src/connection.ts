import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';

export const onConnect: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Connecting! (connection id: ${event.requestContext.connectionId})`
    );

    return emptyOkResponse;
};

const initApiGatewayManagementApi = (event: APIGatewayProxyEvent) => new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage
    });

const emptyOkResponse = {
    statusCode: 200,
    body: ''
};
