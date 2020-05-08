import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';

export const onConnect: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) => {
    console.log(
        `Connecting! (connection id: ${event.requestContext.connectionId})`
    );

    return emptyOkResponse;
};

const emptyOkResponse = {
    statusCode: 200,
    body: ''
};
