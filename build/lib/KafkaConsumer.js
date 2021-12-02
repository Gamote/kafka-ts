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
                await this.consumer.subscribe({
                    topic: this.topicId,
                    fromBeginning: true,
                });
                await this.consumer.run({
                    autoCommit: false,
                    eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary, }) => {
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
                                this.eventEmitter.emit(String(type), values);
                            }
                        }
                        catch (e) {
                            // TODO: discuss about what to do
                            throw new Error("Cannot process this message batch");
                        }
                        const offset = batch.messages[batch.messages.length - 1].offset;
                        resolveOffset(offset);
                        await commitOffsetsIfNecessary();
                    },
                });
            }
            catch (error) {
                console.log("Error:", error);
            }
        };
        this.on = (type, handler) => {
            const promiseHandler = (value) => void handler(value);
            this.eventEmitter.on(String(type), promiseHandler);
            return () => this.eventEmitter.off(String(type), promiseHandler);
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
