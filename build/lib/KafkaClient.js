"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
class KafkaClient {
    constructor(config) {
        this.client = new kafkajs_1.Kafka({
            logLevel: kafkajs_1.logLevel.ERROR,
            ...config,
        });
    }
}
exports.default = KafkaClient;
