# WebSockets Lambda Workshop

### Exercise 1: Acknowledge a WebSockets connection

In this exercise we'll enable clients to establish a WebSocket (WS) connection. Once connected, we'll send a success message back to the client.

#### Take a look around

Start by taking a look at the `serverless.yml` file in the project root.

The first thing you'll notice is a `websocketsApiName` entry under the provider declaration:

```yaml
websocketsApiName: ws-lambda-workshop-api
```

This simply tells Serverless that you want API Gateway to create a WebSocket API.

Next take a look at the single lambda definition:

```yaml
onConnect:
    handler: src/connection.onConnect
    events:
        -   websocket: $connect
```

The `events` block indicates that this lambda will be invoked by a WebSocket event, namely when a client connects.

The `$connect` label is a [route](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html) instruction for API Gateway. There are three predefined routes that API Gateway supports:
 * `$connect`
 * `$disconnect`
 * `$default`

It's also possible to add your own routing rules.

Our `onConnect` lambda configuration is telling API Gateway that when a WS client connects to the API, the `connection.onConnect` function should be invoked.

Take a look inside `connection.ts` under the `src/` folder and you'll see a rather rudimentary connect handler.

#### Ship it!

