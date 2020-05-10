## Exercise 2: There and back again

In this exercise we'll send a message from our WebSocket client, and then echo the message back to the client with a Lambda.

![Exercise diagram](exercise-diagram.png)

### Sending the message from the client

This we can already do. In the previous exercise we established a WebSocket connection; to send a message over that connection with `wscat` we just need to enter the message at the prompt.

### Routing messages

In the previous exercise we encountered WebSocket API [routes](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html). In this exercise we'll use the `$default`<sup>1</sup> route to direct all non-connect notifications to a new handler.

### Over to you

See if you can update our `serverless.yml` to route `$default` traffic to our `connection.onMessage` handler.

If you were to `npx serverless deploy` now, you should find that it is possible to send messages from the `wscat` client without error.

### Identifying the connection

At any given time a WebSocket API could be maintaining multiple open connections.

![Multiple connections diagram](multiple-connections-diagram.png)

In order for our Lambda to send a message to the right recipient, we need to tell API Gateway which connection we want it to forward the message on to.

API Gateway makes the unique id for a connection available in the request context whenever a Lambda is triggered by a WebSocket event.

### Over to you

Take a look at our `onMessage` handler. Can you have it echo messages back to the client?

There's a predefined `initApiGatewayManagementApi` function that might be useful. These [docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApiGatewayManagementApi.html#postToConnection-property) should also help.

(Don't forget `AWS.Request` instances [require a call to `.promise()`](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html) to start the underlying service call).

### Ship it!

Once you're done, try redeploying everything (`npx serverless deploy`). Next time you try sending a message with `wscat`, you should see it echoed back!

Nice work writing to the right connection - that was a rite of passage! :grimacing:

<sup>1</sup>In practice we probably wouldn't use the `$default` route for this, we'd more likely set up a [custom route](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-routes-integrations.html#apigateway-websocket-api-routes-about-custom) using a [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html#apigateway-websocket-api-route-selection-expressions).
