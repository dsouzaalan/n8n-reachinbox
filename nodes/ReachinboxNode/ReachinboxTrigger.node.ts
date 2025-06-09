import {
	INodeOutputConfiguration,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

export class ReachinboxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ReachInbox Trigger',
		name: 'reachInboxTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Triggers workflow on ReachInbox events',
		defaults: {
			name: 'ReachInbox Trigger',
		},
		inputs: [],
		outputs: ['main'] as (NodeConnectionType | INodeOutputConfiguration)[],
		credentials: [
			{
				name: 'reachInboxApi',
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'reachinbox',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'All Events',
						value: 'ALL_EVENTS',
						description: 'Triggers on any event from ReachInbox',
					},
					{
						name: 'Email Sent',
						value: 'EMAIL_SENT',
						description: 'Triggers when an email is successfully sent.',
					},
					{
						name: 'Email Opened',
						value: 'EMAIL_OPENED',
						description: 'Triggers when an email is opened.',
					},
					{
						name: 'Email Link Clicked',
						value: 'EMAIL_CLICKED',
						description: 'Triggers when a link inside an email is clicked.',
					},
					{
						name: 'Reply Received',
						value: 'REPLY_RECEIVED',
						description: 'Triggers when a reply to an email is received.',
					},
					{
						name: 'Email Bounced',
						value: 'EMAIL_BOUNCED',
						description: 'Triggers when an email is bounced.',
					},
					{
						name: 'Lead Interested',
						value: 'LEAD_INTERESTED',
						description: 'Triggers when a lead is marked as interested.',
					},
					{
						name: 'Lead Not Interested',
						value: 'LEAD_NOT_INTERESTED',
						description: 'Triggers when a lead is marked as not interested.',
					},
					{
						name: 'Campaign Completed',
						value: 'CAMPAIGN_COMPLETED',
						description: 'Triggers when a campaign is completed.',
					},
				],
				default: 'ALL_EVENTS',
				description: 'Event to listen for',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const selectedEvent = this.getNodeParameter('event');

		if (selectedEvent === 'ALL_EVENTS' || body.event === selectedEvent) {
			return {
				workflowData: [this.helpers.returnJsonArray([body])],
			};
		}

		// Ignore event if not selected
		return {
			workflowData: [],
		};
	}
}
