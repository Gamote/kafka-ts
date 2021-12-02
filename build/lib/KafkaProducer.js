"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducer = void 0;
const KafkaClient_1 = __importDefault(require("./KafkaClient"));
class KafkaProducer {
    constructor(clientConfig, topicId, consumerConfig) {
        this.createProducer = () => {
            return this.client.producer(this.producerConfig);
        };
        this.start = async () => {
            try {
                await this.producer.connect();
            }
            catch (error) {
                console.log("Error connecting the producer: ", error);
            }
        };
        this.shutdown = async () => {
            await this.producer.disconnect();
        };
        this.dispatch = async (type, key, value, headers = {}) => {
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
        this.clientConfig = clientConfig;
        this.client = new KafkaClient_1.default(clientConfig).client;
        this.topicId = topicId;
        this.producerConfig = consumerConfig;
        this.producer = this.createProducer();
    }
}
exports.KafkaProducer = KafkaProducer;
