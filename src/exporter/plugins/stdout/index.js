const Joi = require('joi');
const { logger, levels } = require('../../../logger');

const schema = Joi.object().keys({
    pretty: Joi.boolean().default(false),
    type: Joi.string().valid('stdout')
});

class StdoutExporter {
    constructor(config) {
        const { error, value } = Joi.validate(config, schema);
        if (error) {
            logger.log({ level: levels.error, message: `StdoutExporter:: Config validation error: ${error}` });
            throw error;
        }
        this.config = value;
        this.pretty = !!this.config.pretty;
    }
    process(result, target) {
        if (this.pretty) {
            logger.log({ level: levels.info, message: `${target.name}: ${JSON.stringify(result, null, 2)}` });
        } else {
            logger.log({ level: levels.info, message: result });
        }
    }
}

exports.default = StdoutExporter;
