import { Kafka, KafkaConfig, logLevel } from "kafkajs";

export default class KafkaClient {
  public client: Kafka;

  constructor(config: KafkaConfig) {
    this.client = new Kafka({
      logLevel: logLevel.ERROR,
      ...config,
    });
  }
}
