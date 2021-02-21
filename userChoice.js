class UserChoice {
    constructor(language, platform, engine, model, logger, reporter) {
        this.language = language;
        this.platform = platform;
        this.engine = engine;
        this.testModel = model;
        this.logger = logger;
        this.reporter = reporter;
    }
}

module.exports.UserChoice = UserChoice;
