import EventEmitter from "events";
import { Consumer, ConsumerConfig, Kafka, KafkaConfig } from "kafkajs";
import KafkaClient from "./KafkaClient";

export default class KafkaConsumer<TypeValues> {
  private readonly clientConfig: KafkaConfig;
  private readonly client: Kafka;
  private readonly topicId: string;
  private readonly consumerConfig?: ConsumerConfig;
  private consumer: Consumer;
  private eventEmitter = new EventEmitter();

  constructor(
    clientConfig: KafkaConfig,
    topicId: string,
    consumerConfig?: ConsumerConfig,
  ) {
    this.clientConfig = clientConfig;
    this.client = new KafkaClient(clientConfig).client;

    this.topicId = topicId;

    this.consumerConfig = consumerConfig;
    this.consumer = this.createConsumer();
  }

  private createConsumer = (): Consumer =>
    this.client.consumer(this.consumerConfig);

  public startConsumer = async () => {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.topicId,
        fromBeginning: true,
      });

      await this.consumer.run({
        autoCommit: false,
        eachBatch: async ({
          batch,
          resolveOffset,
          commitOffsetsIfNecessary,
        }) => {
          try {
            for (const message of batch.messages) {
              // Try determine the type
              const type = message.headers?.type
                ? (message.headers.type as keyof TypeValues)
                : undefined;

              // Skip if we don't have a type
              if (!type) {
                continue;
              }

              // Try to parse the value
              const values = message.value
                ? (JSON.parse(
                    message.value.toString(),
                  ) as TypeValues[typeof type])
                : undefined;

              // Let listener know about the event
              this.eventEmitter.emit(String(type), values);
            }
          } catch (e) {
            // TODO: discuss about what to do
            throw new Error("Cannot process this message batch");
          }

          const offset = batch.messages[batch.messages.length - 1].offset;

          resolveOffset(offset);
          await commitOffsetsIfNecessary();
        },
      });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  public on = <Type extends keyof TypeValues>(
    type: Type,
    handler: (values: TypeValues[Type]) => void,
  ) => {
    this.eventEmitter.on(String(type), handler);

    return () => this.eventEmitter.off(String(type), handler);
  };

  public async shutdown(): Promise<void> {
    await this.consumer.disconnect();
  }
}
