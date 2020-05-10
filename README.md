## Exercise 3: Hosting a WebSockets party

In this exercise we'll evolve our solution into a full-blown WhatsApp killer, relaying messages sent by one client to all other clients connected to the WebSocket API.

![Exercise diagram](exercise-diagram.png)

### Storing connection ids

Since Lambdas are stateless we need to store the connection id each time a connection is established. We'll store that state in [DynamoDB](https://aws.amazon.com/dynamodb/).

New infrastructure configuration has been added to our `serverless.yml`, creating a DynamoDB table and giving our Lambdas permissions to write to and query that table.

### Over to you :point_down:

Update our `connection.onConnect` handler to store the connection id each time a client connects (a helper function has been provided to write the value to DynamoDB).

### Route messages to every connection

All that remains to be done is to update our logic handling messages sent by clients. Instead of echoing the message back to the sender, we need to fetch the connection ids stored in DynamoDB and for each one instruct API Gateway to post that message onto the corresponding WebSocket connection.

### Over to you :point_down:

Update `connection.onMessage` so that it sends the message to all clients connected to our WebSocket API. A helper function has been provided to fetch the connection ids of connected WebSocket clients.

N.B. since we're not handling client disconnects yet, be prepared for `postToConnection` calls to error with status code `410` `GONE`. This is what API Gateway will return if a connection is no longer connected.

### Ship it! :shipit:

Try redeploying (`npx serverless deploy`) then start two separate `wscat` connections. If all went well, messages sent from one `wscat` session should also be printed out on the other!
