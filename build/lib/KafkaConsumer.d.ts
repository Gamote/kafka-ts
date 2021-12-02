/// <reference types="node" />
import EventEmitter from "events";
import { ConsumerConfig, KafkaConfig } from "kafkajs";
export declare class KafkaConsumer<TypeValues> {
    private readonly clientConfig;
    private readonly client;
    private readonly topicId;
    private readonly consumerConfig?;
    private consumer;
    private eventEmitter;
    constructor(clientConfig: KafkaConfig, topicId: string, consumerConfig?: ConsumerConfig);
    private createConsumer;
    startConsumer: () => Promise<void>;
    on: <Type extends keyof TypeValues>(type: Type, handler: (values: TypeValues[Type]) => void | Promise<void>) => () => EventEmitter;
    shutdown(): Promise<void>;
}
