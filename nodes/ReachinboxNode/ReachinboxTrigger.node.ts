import {
	ILoadOptionsFunctions,
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
				displayName: 'Event',
				name: 'event',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getReachInboxEvents',
				},
				default: ['ALL_EVENTS'],
				description:
					'Select the specific events that should trigger this workflow. If none selected, all events will trigger.',
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
						throw new Error('Failed to parse response from ReachInbox API');
					}
				}

				if (!Array.isArray(response)) {
					throw new Error('Unexpected response format from ReachInbox API');
				}

				return response.map((event: { id: string; value: string }) => ({
					name: event.value,
					value: event.id,
				}));
			},
		},
		webhook: {
			async register(this: IWebhookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('reachInboxApi');
				const baseUrl = credentials.baseUrl;
				const apiKey = credentials.apiKey;
				const webhookUrl = this.getNodeWebhookUrl('default');
				const selectedEvents = this.getNodeParameter('event') as string[];

				await this.helpers.request({
					method: 'POST',
					url: `${baseUrl}/api/v1/webhook/subscribe`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
					body: {
						url: webhookUrl,
						events: selectedEvents,
					},
					json: true,
				});

				console.log("response");

				return true;
			},

			async checkExists(this: IWebhookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('reachInboxApi');
				console.log("credentials");
				const baseUrl = credentials.baseUrl;
				const apiKey = credentials.apiKey;
				const webhookUrl = this.getNodeWebhookUrl('default');
				console.log("webhookUrl");

				const existing = await this.helpers.request({
					method: 'GET',
					url: `${baseUrl}/api/v1/webhook/list-all`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
					json: true,
				});

				console.log(existing);

				return existing.some((hook: any) => hook.url === webhookUrl);
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const selectedEvents = this.getNodeParameter('event') as string[];

		const eventType = (body && typeof body === 'object' && 'event' in body) ? (body as any).event : undefined;
		const eventData = (body && typeof body === 'object' && 'eventData' in body) ? (body as any).eventData : undefined;

		if (
			!selectedEvents ||
			selectedEvents.length === 0 ||
			selectedEvents.includes('ALL_EVENTS') ||
			(eventType && selectedEvents.includes(eventType))
		) {
			return {
				workflowData: [this.helpers.returnJsonArray([eventData ?? body])],
			};
		}

		return {
			workflowData: [],
		};
	}
}
