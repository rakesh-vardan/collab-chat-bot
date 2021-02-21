// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, CardFactory, ActionTypes } = require('botbuilder');

class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        const input = ['Yes','Java', 'Python', '.NET', 'UI', 'API', 'Selenium', 'REST Assured', 'HTTP Client', 'TestNG', 'Cucumber', 'Log4J', 'Report Portal', 'Extent Report']

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            if (!input.includes(context.activity.text)) {
                await this.sendIntroCard(context);
            }
            await this.dialog.run(context, this.dialogState);

            await next();
        });
    }

    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            'Welcome to Collab-Framework bot!',
            'Using the bot you can choose different options for test automation project. Once done the sample project template with all the necessary components will be generated and can be downloaded.',
            ['https://aka.ms/bf-welcome-card-image']
            // [
            //     {
            //         type: ActionTypes.OpenUrl,
            //         title: 'Download Project',
            //         value: 'https://collabtoolstorageaccount.blob.core.windows.net/quickstartblobs9f39a9d6-9764-478d-9d89-0d88c2d66159/download.zip'
            //     }
            // ]
        );

        await context.sendActivity({ attachments: [card] });
    }

    async sendProjectDownloadCard(context, url) {
        const card = CardFactory.heroCard(
            'Welcome to Collab-Framework bot!',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Download Project',
                    value: 'https://collabtoolstorageaccount.blob.core.windows.net/quickstartblobs9f39a9d6-9764-478d-9d89-0d88c2d66159/download.zip'
                }
            ]
        );

        await context.sendActivity({ attachments: [card] });
    }
}

module.exports.DialogBot = DialogBot;
