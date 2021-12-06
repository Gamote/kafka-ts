"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumer = void 0;
const events_1 = __importDefault(require("events"));
const KafkaClient_1 = __importDefault(require("./KafkaClient"));
class KafkaConsumer {
    constructor(clientConfig, topicId, consumerConfig) {
        this.eventEmitter = new events_1.default();
        this.createConsumer = () => this.client.consumer(this.consumerConfig);
        this.startConsumer = async () => {
            try {
                await this.consumer.connect();
            }
            catch (error) {
                console.error("KafkaTs - error connecting:", error);
            }
            try {
                await this.consumer.subscribe({
                    topic: this.topicId,
                    fromBeginning: true,
                });
            }
            catch (error) {
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
                                    ? message.headers.type
                                    : undefined;
                                // Skip if we don't have a type
                                if (!type) {
                                    continue;
                                }
                                // Try to parse the value
                                const values = message.value
                                    ? JSON.parse(message.value.toString())
                                    : undefined;
                                // Let listener know about the event
                                this.emit(type, values, async () => {
                                    // Actions to take after the event was successfully handled
                                    await payload.heartbeat();
                                    payload.resolveOffset(message.offset);
                                    await payload.commitOffsetsIfNecessary();
                                    return;
                                });
                            }
                        }
                        catch (e) {
                            // TODO: discuss about what to do
                            throw new Error("Cannot process this message batch");
                        }
                        return Promise.resolve();
                    },
                });
            }
            catch (error) {
                console.error("KafkaTs - running the batch processor", error);
            }
        };
        this.emit = (type, values, onSuccess, onError) => {
            this.eventEmitter.emit(String(type), values, onSuccess, onError);
        };
        this.on = (type, handler) => {
            const customHandler = (value, onSuccess, onError) => {
                void Promise.resolve(handler(value)).then(onSuccess).catch(onError);
            };
            this.eventEmitter.on(String(type), customHandler);
            return () => this.eventEmitter.off(String(type), customHandler);
        };
        this.clientConfig = clientConfig;
        this.client = new KafkaClient_1.default(clientConfig).client;
        this.topicId = topicId;
        this.consumerConfig = consumerConfig;
        this.consumer = this.createConsumer();
    }
    async shutdown() {
        await this.consumer.disconnect();
    }
}
exports.KafkaConsumer = KafkaConsumer;
