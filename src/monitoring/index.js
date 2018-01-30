const { logger, levels } = require('../logger');

class Monitoring {
    constructor({ targets }, exporter, browserFactory) {
        this.exporter = exporter;
        this.targets = targets;
        this.browserFactory = browserFactory;
    }
    async start() {
        this.browser = await this.browserFactory.getBrowser();        
        this.targets.forEach(target => {
            let MonitoringPlugin;
            try {
                MonitoringPlugin = require(`./plugins/${target.type}/index.js`);
            } catch (e) {
                try {
                    MonitoringPlugin = require(target.type);
                } catch (e) {
                    logger.log({ level: levels.error, message: `Monitoring::start - ${target.name} - ${e.toString()}` });
                    process.exit(e.code);
                }
            }
            this.exporter.prepPocessResult(result, target);
            const monitoringInstance = new MonitoringPlugin(target, this.exporter, this.browser);
            setInterval(async () => {
                logger.log({ level: levels.debug, message: `Monitoring::start - ${target.name}` });                
                const result = await monitoringInstance.monitore();
                this.exporter.processResult(result, target);
            }, target.interval);
        });
    }
}

exports.Monitoring = Monitoring
