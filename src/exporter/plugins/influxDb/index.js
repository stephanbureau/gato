const { InfluxDB, FieldType } = require('influx');
const Joi = require('joi');
const { logger, levels } = require('../../../logger');

const schema = Joi.object().keys({
    host: Joi.string().required(),
    database: Joi.string().required(),
    port: Joi.number().default(8086),
    type: Joi.string().valid('influxDb')
});

class InfluxDbExporter {
    constructor(config) {
        const { error, value } = Joi.validate(config, schema);
        if (error) {
            logger.log({ level: levels.error, message: `InfluxDbExporter:: Config validation error: ${error}` });
            throw error;
        }
        this.config = value;
        this.influx = {};
    }

    async process(result, target) {
        const targetType = target.type.toLowerCase();
        let db = this.influx[targetType];
        if (!db) {
            this.influx[targetType] = this.instantiateDb(
                this.prepareInfluxFields(result),
                target.type
            );
            logger.log({ level: levels.verbose, message: `InfluxDbExporter::process - instantiate new measurement "${target.type}"` });
        }
        result = this.sanitize(result);
        try {
            const points = [{
                measurement: target.type,
                tags: { service: target.name },
                fields: result,
            }];
            logger.log({ level: levels.verbose, message: `InfluxDbExporter::process - points: ${JSON.stringify(points)}` });

            await this.influx[targetType].writePoints(points);
            logger.log({ level: levels.info, message: `InfluxDbExporter::process - service: ${target.name}` });
        } catch (err) {
            logger.log({ level: levels.error, message: `InfluxDbExporter::process - service: ${target.name} - ${err}` });
        }
    }
    sanitize(result) {
        const resultClean = {}
        for (var key in result) {
            if (typeof (result[key]) === "boolean") {
                resultClean[key] = result[key] ? 1 : 0;
            }
            if (typeof (result[key]) === "string" || typeof (result[key]) === "number") {
                resultClean[key] = result[key];
            }
        }

        return resultClean
    }
    prepareInfluxFields(result) {
        const fields = {};
        for (var key in result) {
            if (typeof (result[key]) === "number") {
                fields[key] = FieldType.FLOAT;
            }
            if (typeof (result[key]) === "string") {
                fields[key] = FieldType.STRING;
            }
            if (typeof (result[key]) === "boolean") {
                fields[key] = FieldType.INTEGER;
            }
        }
        return fields;
    }
    instantiateDb(fields, measurement) {
        const influxInstance = new InfluxDB({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            schema: [
                {
                    measurement,
                    fields,
                    tags: [
                        'service'
                    ]
                }
            ]
        });
        return influxInstance;
    }
}

exports.default = InfluxDbExporter;
