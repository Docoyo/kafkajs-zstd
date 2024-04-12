import ZstdCodec from "./index";

import waitFor from "kafkajs/src/utils/waitFor";

import {CompressionCodecs, CompressionTypes, Kafka, logLevel} from "kafkajs";

jest.setTimeout(10000);


const TOPIC_NAME = "topic-test";
const MESSAGE = {
  key: Buffer.from("lorem"),
  value: Buffer.from(
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  ),
  headers: {
    foo: "bar",
  },
};

describe("Zstd Codec", () => {
  let kafka, producer, consumer;

  beforeAll(() => {
    CompressionCodecs[CompressionTypes.ZSTD] = ZstdCodec();

    kafka = new Kafka({
      brokers: ["localhost:9092"],
      clientId: "kafkajs-zstd",
      logLevel: logLevel.NOTHING,
    });

    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: "zstd-group" });
  });

  afterEach(async () => {
    await producer.disconnect();
    await consumer.disconnect();
  });

  test("producer", async () => {
    await producer.connect();
    await producer.send({
      topic: TOPIC_NAME,
      compression: CompressionTypes.ZSTD,
      messages: [MESSAGE],
    });
  });

  test("consumer", async () => {
    await producer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

    await producer.send({
      topic: TOPIC_NAME,
      compression: CompressionTypes.ZSTD,
      messages: [MESSAGE],
    });

    let messages = [];
    consumer.run({ eachMessage: ({ message }) => messages.push(message) });
    await waitFor(() => messages.length >= 1);

    const message = messages.pop();
    expect(message.key).toEqual(MESSAGE.key);
    expect(message.value).toEqual(MESSAGE.value);
  });
});
