import { Kafka, KafkaConfig } from "kafkajs";
export default class KafkaClient {
    client: Kafka;
    constructor(config: KafkaConfig);
}
