const { MessageFactory, CardFactory, ActionTypes } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');
const fetch = require("node-fetch");
const { UserChoice } = require('../userChoice');
let download = require('downloadjs');


// const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
// const NAME_PROMPT = 'NAME_PROMPT';
// const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_CHOICE = 'USER_CHOICE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var userChoice = null;
var fileUrl = null;

class UserChoiceDialog extends ComponentDialog {
    constructor(userState) {
        super('userChoiceDialog');

        this.userChoice = userState.createProperty(USER_CHOICE);

        // this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        // this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        // this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT, this.picturePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.languageStep.bind(this),
            this.platformStep.bind(this),
            this.engineStep.bind(this),
            this.modelStep.bind(this),
            this.loggerStep.bind(this),
            this.reporterStep.bind(this),

            // this.nameStep.bind(this),
            // this.nameConfirmStep.bind(this),
            // this.ageStep.bind(this),
            // this.pictureStep.bind(this),
            // this.confirmStep.bind(this),
            this.summaryStep.bind(this),
            this.apiCallStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async languageStep(step) {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter your ***language*** of choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['Java', 'Python', '.NET'])
        });
    }

    async platformStep(step) {
        step.values.language = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter the ***platform*** of your choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['UI', 'API'])
        });
    }

    async engineStep(step) {
        step.values.platform = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter the preferred ***engine*** of your choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['Selenium', 'REST Assured', 'HTTP Client'])
        });
    }

    async modelStep(step) {
        step.values.engine = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter the preferred ***test model*** of your choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['TestNG', 'Cucumber'])
        });
    }

    async loggerStep(step) {
        step.values.model = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter the preferred ***logger*** of your choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['Log4J'])
        });
    }

    async reporterStep(step) {
        step.values.logger = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter the preferred ***reporter*** of your choice. Here are the options to choose from!',
            choices: ChoiceFactory.toChoices(['Extent Report', 'Report Portal'])
        });
    }

    // async nameStep(step) {
    //     step.values.language = step.result.value;
    //     return await step.prompt(NAME_PROMPT, 'Please enter your name.');
    // }

    // async nameConfirmStep(step) {
    //     step.values.name = step.result;

    //     // We can send messages to the user at any point in the WaterfallStep.
    //     await step.context.sendActivity(`Thanks ${step.result}.`);

    //     // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //     return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    // }

    // async ageStep(step) {
    //     if (step.result) {
    //         // User said "yes" so we will be prompting for the age.
    //         // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //         const promptOptions = { prompt: 'Please enter your age.', retryPrompt: 'The value entered must be greater than 0 and less than 150.' };

    //         return await step.prompt(NUMBER_PROMPT, promptOptions);
    //     } else {
    //         // User said "no" so we will skip the next step. Give -1 as the age.
    //         return await step.next(-1);
    //     }
    // }

    // async pictureStep(step) {
    //     step.values.age = step.result;

    //     const msg = step.values.age === -1 ? 'No age given.' : `I have your age as ${step.values.age}.`;

    //     // We can send messages to the user at any point in the WaterfallStep.
    //     await step.context.sendActivity(msg);

    //     if (step.context.activity.channelId === Channels.msteams) {
    //         // This attachment prompt example is not designed to work for Teams attachments, so skip it in this case
    //         await step.context.sendActivity('Skipping attachment prompt in Teams channel...');
    //         return await step.next(undefined);
    //     } else {
    //         // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //         var promptOptions = {
    //             prompt: 'Please attach a profile picture (or type any message to skip).',
    //             retryPrompt: 'The attachment must be a jpeg/png image file.'
    //         };

    //         return await step.prompt(ATTACHMENT_PROMPT, promptOptions);
    //     }
    // }

    async confirmStep(step) {
        step.values.picture = step.result && step.result[0];

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });
    }

    async summaryStep(step) {
        step.values.reporter = step.result.value;
        if (step.result) {
            userChoice = await this.userChoice.get(step.context, new UserChoice());

            userChoice.language = step.values.language;
            userChoice.platform = step.values.platform;
            userChoice.engine = step.values.engine;
            userChoice.testModel = step.values.model;
            userChoice.logger = step.values.logger;
            userChoice.reporter = step.values.reporter;
            console.log('printing for the 1st time');
            console.log(userChoice);

            let finalmessage = `Thank you! These are the details that you have selected:\n
            Language - ${userChoice.language}\n 
            Platform - ${userChoice.platform}\n
            Engine - ${userChoice.engine}\n
            Test Model - ${userChoice.testModel}\n
            Logger - ${userChoice.logger}\n
            Reporter - ${userChoice.reporter}`;

            await step.context.sendActivity(finalmessage);
            return await step.prompt(CONFIRM_PROMPT, 'Do you want to proceed downloading the project?', ['yes', 'no']);
        }

        // return await step.endDialog();
    }


    async apiCallStep(step) {
        if (step.result) {
            console.log('printing for the 2nd time');
            console.log(userChoice);

            const url = 'https://collab-tool-rakesh.herokuapp.com/download';

            await fetch(url, {
                method: "POST",
                body: JSON.stringify(userChoice),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            }).then(response => response.json())
                .then(json => {
                    fileUrl = json.fileUrl;
                    console.log(fileUrl)
                });

            const card = CardFactory.heroCard(
                'Your project is ready! Please download now.',
                ['https://aka.ms/bf-welcome-card-image'],
                [
                    {
                        type: ActionTypes.OpenUrl,
                        title: 'Download',
                        value: fileUrl
                    }
                ]
            );

            await step.context.sendActivity({ attachments: [card] });
            return await step.endDialog();
        }
    }

    // async agePromptValidator(promptContext) {
    //     // This condition is our validation rule. You can also change the value at this point.
    //     return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
    // }

    // async picturePromptValidator(promptContext) {
    //     if (promptContext.recognized.succeeded) {
    //         var attachments = promptContext.recognized.value;
    //         var validImages = [];

    //         attachments.forEach(attachment => {
    //             if (attachment.contentType === 'image/jpeg' || attachment.contentType === 'image/png') {
    //                 validImages.push(attachment);
    //             }
    //         });

    //         promptContext.recognized.value = validImages;

    //         // If none of the attachments are valid images, the retry prompt should be sent.
    //         return !!validImages.length;
    //     } else {
    //         await promptContext.context.sendActivity('No attachments received. Proceeding without a profile picture...');

    //         // We can return true from a validator function even if Recognized.Succeeded is false.
    //         return true;
    //     }
    // }
}

module.exports.UserChoiceDialog = UserChoiceDialog;
