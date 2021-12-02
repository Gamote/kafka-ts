import { IHeaders, KafkaConfig, ProducerConfig } from "kafkajs";
export declare class KafkaProducer<TypeValues> {
    private readonly clientConfig;
    private readonly client;
    private readonly topicId;
    private readonly producerConfig?;
    private readonly producer;
    constructor(clientConfig: KafkaConfig, topicId: string, consumerConfig?: ProducerConfig);
    private createProducer;
    start: () => Promise<void>;
    shutdown: () => Promise<void>;
    dispatch: <Type extends keyof TypeValues>(type: Type, key: string | number, value: TypeValues[Type], headers?: IHeaders) => Promise<void>;
}
