import {
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeOutputConfiguration,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class ReachInboxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ReachInbox Trigger',
		name: 'reachInboxTrigger',
		icon: 'file:logo.svg',
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
				required: true,
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
				displayName: 'Event Name or ID',
				name: 'event',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getReachInboxEvents',
				},
				default: '',
				description:
					'Select the specific event that should trigger this workflow. "All Events" will trigger for any event. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Campaign Name or ID',
				name: 'campaignId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getReachInboxCampaigns',
				},
				default: '',
				description: 'Select the campaign to subscribe to events for. Select "All Campaigns" for all events. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getReachInboxEvents(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('reachInboxApi');
				const baseUrl = credentials.baseUrl;
				const apiKey = credentials.apiKey;

				const responseRaw = await this.helpers.request({
					method: 'GET',
					url: `${baseUrl}/api/v1/webhook/event`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				});

				let response: any = responseRaw;
				if (typeof responseRaw === 'string') {
					try {
						response = JSON.parse(responseRaw);
					} catch (e) {
						throw new NodeOperationError(
							this.getNode(),
							'Failed to parse response from ReachInbox API',
						);
					}
				}

				if (!Array.isArray(response)) {
					throw new NodeOperationError(
						this.getNode(),
						'Unexpected response format from ReachInbox API',
					);
				}

				// Add an "All Events" option for single selection
				const events: { name: string; value: string }[] = [];
				response.forEach((event: { id: string; value: string }) => {
					events.push({
						name: event.value,
						value: event.id,
					});
				});

				return events;
			},
			async getReachInboxCampaigns(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('reachInboxApi');
				const baseUrl = credentials.baseUrl;
				const apiKey = credentials.apiKey;

				const responseRaw = await this.helpers.request({
					method: 'GET',
					url: `${baseUrl}/api/v1/campaigns/all`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
					json: true,
				});

				let responseData: any;
				if (typeof responseRaw === 'string') {
					try {
						const parsedResponse = JSON.parse(responseRaw);
						responseData = parsedResponse.data?.rows; // Access 'data.rows'
					} catch (e) {
						throw new NodeOperationError(
							this.getNode(),
							'Failed to parse response from ReachInbox API for campaigns',
						);
					}
				} else {
					responseData = responseRaw.data?.rows;
				}

				if (!Array.isArray(responseData)) {
					throw new NodeOperationError(
						this.getNode(),
						'Unexpected response format from ReachInbox API for campaigns: Expected "data.rows" array.',
					);
				}

				// Add an "All Campaigns" option
				const campaigns = [{ name: 'All Campaigns', value: '0' }];
				responseData.forEach((campaign: { id: number; name: string }) => {
					campaigns.push({
						name: campaign.name,
						value: String(campaign.id),
					});
				});

				return campaigns;
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				try {
					const credentials = await this.getCredentials('reachInboxApi');
					const baseUrl = credentials.baseUrl;
					const apiKey = credentials.apiKey;
					const webhookUrl = this.getNodeWebhookUrl('default');
					const selectedEvent = this.getNodeParameter('event') as string;
					const campaignId = this.getNodeParameter('campaignId') as string;

					const response = await this.helpers.request({
						method: 'GET',
						url: `${baseUrl}/api/v1/webhook/list-all`,
						headers: {
							Authorization: `Bearer ${apiKey}`,
						},
						json: true,
					});

					if (!response || !Array.isArray(response.rows)) {
						console.error('Unexpected response format:', response);
						return false;
					}

					return response.rows.some(
						(hook: any) =>
							hook.callbackUrl === webhookUrl &&
							hook.event === selectedEvent &&
							String(hook.campaignId) === campaignId &&
							hook.integrationType === 'N8N',
					);
				} catch (error) {
					console.error('Error checking webhook existence:', error);
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				try {
					const credentials = await this.getCredentials('reachInboxApi');
					const baseUrl = credentials.baseUrl;
					const apiKey = credentials.apiKey;
					const webhookUrl = this.getNodeWebhookUrl('default');
					const selectedEvent = this.getNodeParameter('event') as string;
					const campaignId = this.getNodeParameter('campaignId') as string;

					const response = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/v1/webhook/subscribe/n8n`,
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body: {
							event: selectedEvent,
							callbackUrl: webhookUrl,
							campaignId: campaignId,
							integrationType: 'N8N',
							allCampaigns: campaignId === '0',
						},
						json: true,
					});

					// Check if response contains success message
					if (response && response.message === 'subscribed') {
						return true;
					}

					throw new NodeOperationError(this.getNode(), 'Failed to create webhook: Unexpected response');
				} catch (error) {
					console.error('Error creating webhook:', error);
					throw error;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				try {
					const credentials = await this.getCredentials('reachInboxApi');
					const baseUrl = credentials.baseUrl;
					const apiKey = credentials.apiKey;
					const webhookUrl = this.getNodeWebhookUrl('default');
					const selectedEvent = this.getNodeParameter('event') as string;
					const campaignId = this.getNodeParameter('campaignId') as string;

					const response = await this.helpers.request({
						method: 'DELETE',
						url: `${baseUrl}/api/v1/webhook/unsubscribe`,
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body: {
							event: selectedEvent,
							campaignId: campaignId,
							callbackUrl: webhookUrl,
							allCampaigns: campaignId === '0',
						},
						json: true,
					});

					// Check if response contains success message
					if (response && response.message === 'unsubscribed') {
						return true;
					}

					throw new NodeOperationError(this.getNode(), 'Failed to delete webhook: Unexpected response');
				} catch (error) {
					console.error('Error deleting webhook:', error);
					throw error;
				}
			},
		},
	};
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const selectedEvent = this.getNodeParameter('event') as string;

		const eventType =
			body && typeof body === 'object' && 'event' in body ? (body as any).event : undefined;
		const eventData =
			body && typeof body === 'object' && 'eventData' in body ? (body as any).eventData : undefined;

		if (selectedEvent === 'ALL_EVENTS' || (eventType && selectedEvent === eventType)) {
			return {
				workflowData: [this.helpers.returnJsonArray([eventData ?? body])],
			};
		}

		return {
			workflowData: [],
		};
	}
}
