/// <reference types="node" />
import EventEmitter from "events";
import { ConsumerConfig, KafkaConfig } from "kafkajs";
declare type EventHandler<Values> = (values: Values) => void | Promise<void>;
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
    private emit;
    on: <Type extends keyof TypeValues>(type: Type, handler: EventHandler<TypeValues[Type]>) => () => EventEmitter;
    shutdown(): Promise<void>;
}
export {};
