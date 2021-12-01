import {
  IHeaders,
  Kafka,
  KafkaConfig,
  Producer,
  ProducerConfig,
} from "kafkajs";
import KafkaClient from "./KafkaClient";

export default class KafkaProducer<TypeValues> {
  private readonly clientConfig: KafkaConfig;
  private readonly client: Kafka;
  private readonly topicId: string;
  private readonly producerConfig?: ProducerConfig;
  private readonly producer: Producer;

  constructor(
    clientConfig: KafkaConfig,
    topicId: string,
    consumerConfig?: ProducerConfig,
  ) {
    this.clientConfig = clientConfig;
    this.client = new KafkaClient(clientConfig).client;

    this.topicId = topicId;

    this.producerConfig = consumerConfig;
    this.producer = this.createProducer();
  }

  private createProducer = (): Producer => {
    return this.client.producer(this.producerConfig);
  };

  public start = async (): Promise<void> => {
    try {
      await this.producer.connect();
    } catch (error) {
      console.log("Error connecting the producer: ", error);
    }
  };

  public shutdown = async (): Promise<void> => {
    await this.producer.disconnect();
  };

  public dispatch = async <Type extends keyof TypeValues>(
    type: Type,
    key: string | number,
    value: TypeValues[Type],
    headers: IHeaders = {},
  ) => {
    await this.producer.send({
      topic: this.topicId,
      messages: [
        {
          key: String(key),
          value: value ? JSON.stringify(value) : null,
          headers: {
            ...headers,
            type: String(type),
          },
        },
      ],
    });
  };
}
