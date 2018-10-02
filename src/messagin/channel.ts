import * as amqp from 'amqplib';

export default async () => {
    const conn = await amqp.connect(process.env.AMQP_CONNECTION!)
        .catch(_ => {
            throw new Error(`could not connect to: ${process.env.AMQP_CONNECTION!}`);
        });

    const channel = await conn.createChannel();
    const exchange = process.env.EXCHANGE_NAME!;
    const assertion = await channel.assertExchange(exchange, 'fanout', { durable: false });
    // tslint:disable-next-line:no-console
    console.log(`${assertion.exchange} exchange asserted.`);
    return (order: any) => channel.publish(exchange, '', Buffer.from(JSON.stringify(order)));
};
