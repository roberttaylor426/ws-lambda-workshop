import WebSocket from 'ws';
import waitForExpect from 'wait-for-expect';
import { v4 as uuid } from 'uuid';
import isEqual from 'lodash.isequal';

describe('real-time text chat', () => {
    const wss: WebSocket[] = [];

    afterAll(() => {
        wss.forEach(ws => ws.close());
    });

    const initWs = () => {
        const ws = new WebSocket(
            'wss://lhw0lxzl0m.execute-api.eu-west-1.amazonaws.com/dev/'
        );
        wss.push(ws);
        return ws;
    };

    it('participants are notified when they have joined a chat', async () => {
        const receivedMessages: string[] = [];

        const ws = initWs();
        const chatId = uuid();
        const participantId = uuid();

        ws.on('open', () => {
            ws.send(
                JSON.stringify({ action: 'joinChat', chatId, participantId })
            );
        });

        ws.on('message', data => {
            receivedMessages.push(data.toString());
        });

        await waitForExpect(() => {
            expect(receivedMessages).toHaveLength(1);
            expect(JSON.parse(receivedMessages[0])).toEqual({
                event: 'participantJoinedChat',
                chatId,
                participantId
            });
        });
    });

    it('participants see their own messages', async () => {
        const receivedMessages: string[] = [];

        const ws = initWs();
        const chatId = uuid();
        const participantId = uuid();

        ws.on('open', () => {
            ws.send(
                JSON.stringify({ action: 'joinChat', chatId, participantId })
            );
        });

        ws.on('message', data => {
            receivedMessages.push(data.toString());

            if (
                isEqual(JSON.parse(data.toString()), {
                    event: 'participantJoinedChat',
                    chatId,
                    participantId
                })
            ) {
                ws.send('Hello!');
            }
        });

        await waitForExpect(() => {
            expect(receivedMessages).toHaveLength(2);
            expect(JSON.parse(receivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId
            });
        });
    });

    it("two participants in the same chat see each other's messages", async () => {
        const ws1ReceivedMessages: string[] = [];
        const ws2ReceivedMessages: string[] = [];

        const ws1 = initWs();
        const chatId = uuid();
        const participantId1 = uuid();
        const participantId2 = uuid();

        ws1.on('open', () => {
            ws1.send(
                JSON.stringify({
                    action: 'joinChat',
                    chatId,
                    participantId: participantId1
                })
            );

            const ws2 = initWs();

            ws2.on('open', () => {
                ws2.send(
                    JSON.stringify({
                        action: 'joinChat',
                        chatId,
                        participantId: participantId2
                    })
                );
            });

            ws1.on('message', data => {
                ws1ReceivedMessages.push(data.toString());
            });

            ws2.on('message', data => {
                ws2ReceivedMessages.push(data.toString());

                if (
                    isEqual(JSON.parse(data.toString()), {
                        event: 'participantJoinedChat',
                        chatId,
                        participantId: participantId2
                    })
                ) {
                    ws2.send('Hello!');
                }
            });
        });

        await waitForExpect(() => {
            expect(ws1ReceivedMessages).toHaveLength(2);
            expect(ws2ReceivedMessages).toHaveLength(2);
            expect(JSON.parse(ws1ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId: participantId2
            });
            expect(JSON.parse(ws2ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId: participantId2
            });
        });
    });

    it("two participants in different chats do not see each other's messages", async () => {
        const ws1ReceivedMessages: string[] = [];
        const ws2ReceivedMessages: string[] = [];

        const ws1 = initWs();
        const chatId1 = uuid();
        const chatId2 = uuid();
        const participantId1 = uuid();
        const participantId2 = uuid();

        ws1.on('open', () => {
            ws1.send(
                JSON.stringify({
                    action: 'joinChat',
                    chatId: chatId1,
                    participantId: participantId1
                })
            );

            const ws2 = initWs();

            ws2.on('open', () => {
                ws2.send(
                    JSON.stringify({
                        action: 'joinChat',
                        chatId: chatId2,
                        participantId: participantId2
                    })
                );
            });

            ws1.on('message', data => {
                ws1ReceivedMessages.push(data.toString());
            });

            ws2.on('message', data => {
                ws2ReceivedMessages.push(data.toString());

                if (
                    isEqual(JSON.parse(data.toString()), {
                        event: 'participantJoinedChat',
                        chatId: chatId2,
                        participantId: participantId2
                    })
                ) {
                    ws2.send('Hello!');
                }
            });
        });

        await waitForExpect(() => {
            expect(ws1ReceivedMessages).toHaveLength(1);
            expect(ws2ReceivedMessages).toHaveLength(2);
            expect(JSON.parse(ws2ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId: participantId2
            });
        });
    });

    it('a participant that joins the same chat twice sees own messages in both clients', async () => {
        const ws1ReceivedMessages: string[] = [];
        const ws2ReceivedMessages: string[] = [];

        const ws1 = initWs();
        const chatId = uuid();
        const participantId = uuid();

        ws1.on('open', () => {
            ws1.send(
                JSON.stringify({
                    action: 'joinChat',
                    chatId,
                    participantId
                })
            );

            const ws2 = initWs();

            ws2.on('open', () => {
                ws2.send(
                    JSON.stringify({
                        action: 'joinChat',
                        chatId,
                        participantId
                    })
                );
            });

            ws1.on('message', data => {
                ws1ReceivedMessages.push(data.toString());
            });

            ws2.on('message', data => {
                ws2ReceivedMessages.push(data.toString());

                if (
                    isEqual(JSON.parse(data.toString()), {
                        event: 'participantJoinedChat',
                        chatId,
                        participantId
                    })
                ) {
                    ws2.send('Hello!');
                }
            });
        });

        await waitForExpect(() => {
            expect(ws1ReceivedMessages).toHaveLength(2);
            expect(JSON.parse(ws1ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId
            });
            expect(ws2ReceivedMessages).toHaveLength(2);
            expect(JSON.parse(ws2ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId
            });
        });
    });

    it('if a participant leaves a chat the remaining participant still receives messages', async () => {
        const ws1ReceivedMessages: string[] = [];

        const ws1 = initWs();
        const chatId = uuid();
        const participantId1 = uuid();
        const participantId2 = uuid();

        ws1.on('open', () => {
            ws1.send(
                JSON.stringify({
                    action: 'joinChat',
                    chatId,
                    participantId: participantId1
                })
            );

            const ws2 = initWs();

            ws2.on('open', () => {
                ws2.send(
                    JSON.stringify({
                        action: 'joinChat',
                        chatId,
                        participantId: participantId2
                    })
                );
            });

            ws1.on('message', data => {
                ws1ReceivedMessages.push(data.toString());
            });

            ws2.on('message', data => {
                if (
                    isEqual(JSON.parse(data.toString()), {
                        event: 'participantJoinedChat',
                        chatId,
                        participantId: participantId2
                    })
                ) {
                    ws2.close();
                }
            });

            ws2.on('close', () => {
                ws1.send('Hello to just myself!');
            });
        });

        await waitForExpect(() => {
            expect(ws1ReceivedMessages).toHaveLength(2);
            expect(JSON.parse(ws1ReceivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello to just myself!',
                participantId: participantId1
            });
        });
    });

    it('participants can leave and rejoin a chat', async () => {
        const receivedMessages: string[] = [];

        const ws = initWs();
        const chatId = uuid();
        const participantId = uuid();

        ws.on('open', () => {
            ws.send(
                JSON.stringify({ action: 'joinChat', chatId, participantId })
            );
        });

        ws.on('message', () => {
            ws.close();
        });

        ws.on('close', () => {
            const ws2 = initWs();
            ws2.on('open', () => {
                ws2.send(
                    JSON.stringify({
                        action: 'joinChat',
                        chatId,
                        participantId
                    })
                );

                ws2.on('message', data => {
                    receivedMessages.push(data.toString());

                    if (
                        isEqual(JSON.parse(data.toString()), {
                            event: 'participantJoinedChat',
                            chatId,
                            participantId
                        })
                    ) {
                        ws2.send('Hello!');
                    }
                });
            });
        });

        await waitForExpect(() => {
            expect(receivedMessages).toHaveLength(2);
            expect(JSON.parse(receivedMessages[1])).toStrictEqual({
                event: 'participantSentMessage',
                message: 'Hello!',
                participantId
            });
        });
    });

    it('supports ping pong', async () => {
        let ponged = false;

        const ws = initWs();
        ws.on('open', () => {
            ws.send(
                JSON.stringify({
                    action: 'ping'
                })
            );
        });

        ws.on('message', message => {
            if (JSON.parse(message.toString()).event === 'pong') {
                ponged = true;
            }
        });

        await waitForExpect(() => {
            expect(ponged).toBe(true);
        });
    });
});
