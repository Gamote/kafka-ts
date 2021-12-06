import EventEmitter from "events";
import { Consumer, ConsumerConfig, Kafka, KafkaConfig } from "kafkajs";
import KafkaClient from "./KafkaClient";

type EventHandler<Values> = (values: Values) => void | Promise<void>;

export class KafkaConsumer<TypeValues> {
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
    } catch (error) {
      console.error("KafkaTs - error connecting:", error);
    }

    try {
      await this.consumer.subscribe({
        topic: this.topicId,
        fromBeginning: true,
      });
    } catch (error) {
      console.error("KafkaTs - error subscribing", error);
    }

    try {
      await this.consumer.run({
        autoCommit: true,
        eachBatchAutoResolve: true,
        eachBatch: async (payload) => {
          const { batch } = payload;

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
              this.emit(type, values as TypeValues[typeof type], async () => {
                // Actions to take after the event was successfully handled
                await payload.heartbeat();
                payload.resolveOffset(message.offset);
                await payload.commitOffsetsIfNecessary();
                return;
              });
            }
          } catch (e) {
            // TODO: discuss about what to do
            throw new Error("Cannot process this message batch");
          }

          return Promise.resolve();
        },
      });
    } catch (error) {
      console.error("KafkaTs - running the batch processor", error);
    }
  };

  private emit = <Type extends keyof TypeValues>(
    type: Type,
    values: TypeValues[Type],
    onSuccess?: () => void | Promise<void>,
    onError?: (reason: unknown) => void | Promise<void>,
  ) => {
    this.eventEmitter.emit(String(type), values, onSuccess, onError);
  };

  public on = <Type extends keyof TypeValues>(
    type: Type,
    handler: EventHandler<TypeValues[Type]>,
  ) => {
    const customHandler = (
      value: TypeValues[Type],
      onSuccess?: () => void | Promise<void>,
      onError?: (reason: unknown) => void | Promise<void>,
    ) => {
      void Promise.resolve(handler(value)).then(onSuccess).catch(onError);
    };

    this.eventEmitter.on(String(type), customHandler);

    return () => this.eventEmitter.off(String(type), customHandler);
  };

  public async shutdown(): Promise<void> {
    await this.consumer.disconnect();
  }
}
