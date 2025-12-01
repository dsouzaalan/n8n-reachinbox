import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeInputConfiguration,
	INodeOutputConfiguration,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class ReachInbox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ReachInbox',
		name: 'reachInbox',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with ReachInbox leads',
		defaults: {
			name: 'ReachInbox',
		},
		inputs: ['main'] as (NodeConnectionType | INodeInputConfiguration)[],
		outputs: ['main'] as (NodeConnectionType | INodeOutputConfiguration)[],
		credentials: [
			{
				name: 'reachInboxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Campaign',
						value: 'campaign',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Leads List',
						value: 'leadsList',
					},
					{
						name: 'Blocklist',
						value: 'blocklist',
					},
				],
				default: 'lead',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createCampaign',
						description: 'Create a new campaign',
						action: 'Create a new campaign',
					},
					{
						name: 'Get Status',
						value: 'getCampaignStatus',
						description: 'Get the current status of a campaign',
						action: 'Get campaign status',
					},
					{
						name: 'Start',
						value: 'startCampaign',
						action: 'Start a campaign',
					},
					{
						name: 'Pause',
						value: 'pauseCampaign',
						action: 'Pause a campaign',
					},
					{
						name: 'Update Details',
						value: 'updateCampaignDetails',
						description: 'Update campaign settings and options',
						action: 'Update campaign details',
					},
					{
						name: 'Add Email',
						value: 'addEmailToCampaign',
						description: 'Add sending email accounts to a campaign',
						action: 'Add email to campaign',
					},
					{
						name: 'Add Sequences',
						value: 'addSequences',
						description: 'Add email sequences to a campaign',
						action: 'Add sequences to campaign',
					},
				],
				default: 'createCampaign',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lead'],
					},
				},
				options: [
					{
						name: 'Add to Campaign',
						value: 'add',
						description: 'Add a lead to a campaign',
						action: 'Add a lead to a campaign',
					},
					{
						name: 'Update in Campaign',
						value: 'update',
						description: "Update a specific lead's data",
						action: 'Update a specific lead data',
					},
					{
						name: 'Delete From Campaign',
						value: 'delete',
						description: 'Delete a lead from a campaign',
						action: 'Delete a lead from a campaign',
					},
					{
						name: 'Pause/Resume',
						value: 'changeLeadsState',
						description: 'Pause or resume leads in a campaign',
						action: 'Pause or resume leads',
					},
				],
				default: 'add',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['leadsList'],
					},
				},
				options: [
					{
						name: 'Add Lead',
						value: 'addLeadToList',
						description: 'Add a lead to a leads list',
						action: 'Add a lead to a leads list',
					},
					{
						name: 'Remove Lead',
						value: 'removeLeadFromList',
						description: 'Remove a lead from a leads list',
						action: 'Remove a lead from a leads list',
					},
				],
				default: 'addLeadToList',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['blocklist'],
					},
				},
				options: [
					{
						name: 'Add',
						value: 'addToBlocklist',
						description: 'Add emails, domains or keywords to blocklist',
						action: 'Add to blocklist',
					},
					{
						name: 'Remove',
						value: 'removeFromBlocklist',
						description: 'Remove keywords from blocklist',
						action: 'Remove from blocklist',
					},
				],
				default: 'addToBlocklist',
			},

			// Campaign - Create
			{
				displayName: 'Campaign Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['createCampaign'],
					},
				},
			},

			// Campaign - Shared required fields
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: [
							'startCampaign',
							'pauseCampaign',
							'getCampaignStatus',
							'updateCampaignDetails',
							'addSequences',
							'addEmailToCampaign',
						],
					},
				},
			},

			// Campaign - Add Email
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['addEmailToCampaign'],
					},
				},
				description: 'Comma-separated list of email addresses to add to the campaign',
			},

			// Campaign - Add Sequences
			{
				displayName: 'Sequences',
				name: 'sequences',
				type: 'json',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['addSequences'],
					},
				},
				description: 'Array of sequence objects to add to the campaign',
			},

			// Campaign - Update Details - Additional Options
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['updateCampaignDetails'],
					},
				},
				options: [
					{
						displayName: 'Daily Limit',
						name: 'dailyLimit',
						type: 'number',
						default: 200,
					},
					{
						displayName: 'Tracking Enabled',
						name: 'tracking',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Link Tracking',
						name: 'linkTracking',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Delay (Seconds)',
						name: 'delay',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Random Delay (Seconds)',
						name: 'randomDelay',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Stop on Reply',
						name: 'stopOnReply',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Blockquote',
						name: 'blockquote',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Global Unsubscribe',
						name: 'globalUnsubscribe',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Prioritize New Leads',
						name: 'prioritizeNewLeads',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Accounts to Use',
						name: 'accountsToUse',
						type: 'string',
						default: 'ALL',
						description: 'Comma-separated emails or "ALL" to use all accounts',
					},
					{
						displayName: 'AI Replies Enabled',
						name: 'aiReplies',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'AI Replies Slack Webhook',
						name: 'aiRepliesSlackWebhook',
						type: 'string',
						default: '',
						description: 'Slack webhook URL for AI replies notifications',
						displayOptions: {
							show: {
								aiReplies: [true],
							},
						},
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['updateCampaignDetails'],
					},
				},
				options: [
					{
						displayName: 'Exclude Emails (JSON)',
						name: 'exclude',
						type: 'json',
						default: '[]',
						description: 'Array of emails to exclude (only when Accounts to Use is "ALL")',
					},
					{
						displayName: 'Search Condition',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search term to filter accounts by email',
					},
					{
						displayName: 'Warmup Health Score',
						name: 'warmupHealthScore',
						type: 'number',
						default: 0,
						description: 'Minimum warmup health score for accounts',
					},
					{
						displayName: 'Utilization Percentage',
						name: 'utilization',
						type: 'number',
						default: 100,
						description: 'Maximum utilization percentage for accounts',
					},
				],
			},

			// Lead - Add to Campaign
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['add'],
					},
				},
			},
			{
				displayName: 'Leads (JSON)',
				name: 'leads',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['add'],
					},
				},
				default: '',
				description:
					'Array of lead objects. Example: [{"email": "john@example.com", "firstName": "John"}].',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['add'],
					},
				},
				options: [
					{
						displayName: 'New Core Variables (Array)',
						name: 'newCoreVariables',
						type: 'json',
						default: '',
						description: 'Array of new variables like ["firstName", "lastName"]',
					},
				],
			},

			// Lead - Update in Campaign
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update'],
					},
				},
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update'],
					},
				},
				default: '',
			},
			{
				displayName: 'Attributes (JSON)',
				name: 'attributes',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'Example: {"firstName": "John", "lastName": "Doe"}',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
					},
					{
						displayName: 'Lead Status',
						name: 'leadStatus',
						type: 'string',
						default: '',
					},
				],
			},

			// Lead - Delete from Campaign
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['delete'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['delete'],
					},
				},
				options: [
					{
						displayName: 'Lead IDs (Array)',
						name: 'leadIds',
						type: 'json',
						default: '[]',
					},
					{
						displayName: 'Contains (Filter)',
						name: 'contains',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Exclude (Lead IDs)',
						name: 'exclude',
						type: 'json',
						default: '[]',
					},
					{
						displayName: 'Lead Status',
						name: 'leadStatus',
						type: 'string',
						default: '',
					},
				],
			},

			// Lead - Pause/Resume
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['changeLeadsState'],
					},
				},
			},
			{
				displayName: 'Updated Status',
				name: 'updatedStatus',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['changeLeadsState'],
					},
				},
				options: [
					{
						name: 'Pause Leads',
						value: 'PAUSED',
					},
					{
						name: 'Resume Leads',
						value: 'IN_PROCESS',
					},
				],
				default: 'PAUSED',
				description: 'The new status for the leads',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['changeLeadsState'],
					},
				},
				options: [
					{
						displayName: 'Lead IDs (Array)',
						name: 'leadsIds',
						type: 'json',
						default: '[]',
						description: 'Specific lead IDs to update (empty for all)',
					},
					{
						displayName: 'Exclude Lead IDs (Array)',
						name: 'excludeLeadsIds',
						type: 'json',
						default: '[]',
						description: 'Lead IDs to exclude from the update',
					},
					{
						displayName: 'Status Filter',
						name: 'status',
						type: 'string',
						default: '',
						description: 'Filter leads by status (e.g., "emails_opened")',
					},
					{
						displayName: 'Lead Status Filter',
						name: 'leadStatus',
						type: 'string',
						default: '',
						description: 'Filter leads by lead status (e.g., "Interested")',
					},
					{
						displayName: 'Contains Filter',
						name: 'contains',
						type: 'string',
						default: '',
						description: 'Filter leads containing specific text',
					},
				],
			},

			// Leads List - Add Lead
			{
				displayName: 'Leads List ID',
				name: 'leadsListId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['leadsList'],
						operation: ['addLeadToList'],
					},
				},
			},
			{
				displayName: 'Leads (JSON)',
				name: 'leads',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadsList'],
						operation: ['addLeadToList'],
					},
				},
				default: '',
				description:
					'Array of lead objects. Example: [{"email": "john@example.com", "firstName": "John"}].',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['leadsList'],
						operation: ['addLeadToList'],
					},
				},
				options: [
					{
						displayName: 'New Core Variables (Array)',
						name: 'newCoreVariables',
						type: 'json',
						default: '',
						description: 'Array of new variables like ["firstName", "lastName"]',
					},
				],
			},

			// Leads List - Remove Lead
			{
				displayName: 'Leads List ID',
				name: 'leadsListId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['leadsList'],
						operation: ['removeLeadFromList'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['leadsList'],
						operation: ['removeLeadFromList'],
					},
				},
				options: [
					{
						displayName: 'Lead IDs',
						name: 'leadIds',
						type: 'string',
						default: 'ALL',
						description: 'Comma-separated list of lead IDs or "ALL" to remove all leads',
					},
					{
						displayName: 'Exclude IDs (Array)',
						name: 'excludeIds',
						type: 'json',
						default: '[]',
						description: 'Array of lead IDs to exclude from deletion',
					},
				],
			},

			// Blocklist - Add
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['blocklist'],
						operation: ['addToBlocklist'],
					},
				},
				options: [
					{
						displayName: 'Emails (Array)',
						name: 'emails',
						type: 'json',
						default: '[]',
						description: 'Array of emails to block',
					},
					{
						displayName: 'Domains (Array)',
						name: 'domains',
						type: 'json',
						default: '[]',
						description: 'Array of domains to block',
					},
					{
						displayName: 'Keywords (Array)',
						name: 'keywords',
						type: 'json',
						default: '[]',
						description: 'Array of keywords to block',
					},
					{
						displayName: 'Replies Keywords (Array)',
						name: 'repliesKeywords',
						type: 'json',
						default: '[]',
						description: 'Array of reply keywords to block',
					},
				],
			},

			// Blocklist - Remove
			{
				displayName: 'Blocklist Table',
				name: 'table',
				type: 'options',
				required: true,
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Domain', value: 'domain' },
					{ name: 'Keyword', value: 'keyword' },
					{ name: 'Replies Keyword', value: 'replies-keyword' },
				],
				default: 'keyword',
				displayOptions: {
					show: {
						resource: ['blocklist'],
						operation: ['removeFromBlocklist'],
					},
				},
				description: 'Type of blocklist to remove from',
			},
			{
				displayName: 'Keyword IDs (Array)',
				name: 'ids',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['blocklist'],
						operation: ['removeFromBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of keyword IDs to remove from blocklist',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const items = this.getInputData();
		const credentials = (await this.getCredentials('reachInboxApi')) as {
			apiKey: string;
			baseUrl: string;
		};
		const headers = {
			'Content-Type': 'application/json',
		};

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (operation === 'startCampaign') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;

					const body = { campaignId: Number(campaignId) };

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/start`,
							headers,
							body,
							json: true,
						},
					);

					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'createCampaign') {
					const name = this.getNodeParameter('name', i) as string;

					const body = {
						name,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/create`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'addEmailToCampaign') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const emailsInput = this.getNodeParameter('emails', i) as string;

					// Process the comma-separated emails into an array
					const emailList = emailsInput
						.split(',')
						.map((email) => email.trim())
						.filter((email) => email.length > 0);

					if (emailList.length === 0) {
						throw new NodeOperationError(this.getNode(), 'No valid email(s) provided');
					}

					const body = {
						campaignId,
						emails: emailList,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/add-email`,
							headers,
							body,
							json: true,
						},
					);

					// Format the response to match the API structure
					const responseData = {
						success: response.status === 200,
						message: response.message,
						data: {
							addedCount: response.data?.addedCount || 0,
							failedEmails: response.data?.failedEmails || [],
						},
					};

					returnData.push({ json: responseData, pairedItem: { item: i } });
				}

				if (operation === 'updateCampaignDetails') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					const body: any = {
						campaignId,
					};

					if (additionalOptions.dailyLimit !== undefined) {
						body.dailyLimit = additionalOptions.dailyLimit;
					}
					if (additionalOptions.tracking !== undefined) {
						body.tracking = additionalOptions.tracking;
					}
					if (additionalOptions.linkTracking !== undefined) {
						body.linkTracking = additionalOptions.linkTracking;
					}
					if (additionalOptions.delay !== undefined) {
						body.delay = additionalOptions.delay;
					}
					if (additionalOptions.randomDelay !== undefined) {
						body.randomDelay = additionalOptions.randomDelay;
					}
					if (additionalOptions.stopOnReply !== undefined) {
						body.stopOnReply = additionalOptions.stopOnReply;
					}
					if (additionalOptions.blockquote !== undefined) {
						body.blockquote = additionalOptions.blockquote;
					}
					if (additionalOptions.globalUnsubscribe !== undefined) {
						body.globalUnsubscribe = additionalOptions.globalUnsubscribe;
					}
					if (additionalOptions.prioritizeNewLeads !== undefined) {
						body.prioritizeNewLeads = additionalOptions.prioritizeNewLeads;
					}
					if (additionalOptions.accountsToUse !== undefined) {
						body.accountsToUse = additionalOptions.accountsToUse;
					}
					if (additionalOptions.aiReplies !== undefined) {
						body.aiReplies = additionalOptions.aiReplies;
					}
					if (additionalOptions.aiRepliesSlackWebhook) {
						body.aiRepliesSlackWebhook = additionalOptions.aiRepliesSlackWebhook;
					}

					if (additionalOptions.accountsToUse === 'ALL') {
						const condition: any = {};
						if (additionalFields.search) {
							condition.search = additionalFields.search;
						}
						if (additionalFields.warmupHealthScore && additionalFields.warmupHealthScore > 0) {
							condition.warmupHealthScore = additionalFields.warmupHealthScore;
						}
						if (additionalFields.utilization && additionalFields.utilization < 100) {
							condition.utilization = additionalFields.utilization;
						}

						if (Object.keys(condition).length > 0) {
							body.condition = condition;
						}
						if (additionalFields.exclude) {
							body.exclude =
								typeof additionalFields.exclude === 'string'
									? JSON.parse(additionalFields.exclude)
									: additionalFields.exclude;
						}
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/update-details`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'addSequences') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const rawSequences = this.getNodeParameter('sequences', i);
					const sequences =
						typeof rawSequences === 'string' ? JSON.parse(rawSequences) : rawSequences;

					const body = {
						campaignId,
						sequences,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/add-sequence`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'pauseCampaign') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/campaigns/pause`,
							headers,
							body: { campaignId },
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'getCampaignStatus') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'GET',
							url: `${credentials.baseUrl}/api/v1/campaigns/status?campaignId=${campaignId}`,
							headers,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'add') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const rawLeads = this.getNodeParameter('leads', i);
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;
					const leads = typeof rawLeads === 'string' ? JSON.parse(rawLeads) : rawLeads;
					const newCoreVariables = additionalFields.newCoreVariables
						? typeof additionalFields.newCoreVariables === 'string'
							? JSON.parse(additionalFields.newCoreVariables)
							: additionalFields.newCoreVariables
						: [];

					const body = {
						campaignId,
						leads,
						newCoreVariables: newCoreVariables || [],
						duplicates: [],
					};
					try {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'reachInboxApi',
							{
								method: 'POST',
								url: `${credentials.baseUrl}/api/v1/leads/n8n/add`,
								headers,
								body,
								json: true,
							},
						);
						returnData.push({ json: response, pairedItem: { item: i } });
					} catch (error: any) {
						// Re-throw the error to be handled by the outer catch block
						throw error;
					}
				}

				if (operation === 'update') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const leadId = this.getNodeParameter('leadId', i) as string;
					const attributes = this.getNodeParameter('attributes', i);
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					const body: any = { campaignId, leadId, attributes };
					if (additionalFields.email) body.email = additionalFields.email;
					if (additionalFields.leadStatus) body.leadStatus = additionalFields.leadStatus;
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/leads/n8n/update`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'delete') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					const body: any = { campaignId };
					if (additionalFields.leadIds !== undefined) {
						body.leadIds =
							typeof additionalFields.leadIds === 'string'
								? JSON.parse(additionalFields.leadIds)
								: additionalFields.leadIds;
					}
					if (additionalFields.contains) body.contains = additionalFields.contains;
					if (additionalFields.exclude !== undefined) {
						body.exclude =
							typeof additionalFields.exclude === 'string'
								? JSON.parse(additionalFields.exclude)
								: additionalFields.exclude;
					}
					if (additionalFields.leadStatus) {
						body.leadStatus = additionalFields.leadStatus;
						body.status = additionalFields.leadStatus;
					}
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/leads/n8n/delete`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'changeLeadsState') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const updatedStatus = this.getNodeParameter('updatedStatus', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					const body: any = {
						campaignId,
						updatedStatus,
						leadsIds: additionalFields.leadsIds
							? typeof additionalFields.leadsIds === 'string'
								? JSON.parse(additionalFields.leadsIds)
								: additionalFields.leadsIds
							: [],
						excludeLeadsIds: additionalFields.excludeLeadsIds
							? typeof additionalFields.excludeLeadsIds === 'string'
								? JSON.parse(additionalFields.excludeLeadsIds)
								: additionalFields.excludeLeadsIds
							: [],
					};
					if (additionalFields.status) body.status = additionalFields.status;
					if (additionalFields.leadStatus) body.leadStatus = additionalFields.leadStatus;
					if (additionalFields.contains) body.contains = additionalFields.contains;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/leads/change-state`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'addLeadToList') {
					const leadsListId = this.getNodeParameter('leadsListId', i) as string;
					const rawLeads = this.getNodeParameter('leads', i);
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;
					const leads = typeof rawLeads === 'string' ? JSON.parse(rawLeads) : rawLeads;
					const newCoreVariables = additionalFields.newCoreVariables
						? typeof additionalFields.newCoreVariables === 'string'
							? JSON.parse(additionalFields.newCoreVariables)
							: additionalFields.newCoreVariables
						: [];

					const body = {
						leadsListId,
						leads,
						newCoreVariables: newCoreVariables || [],
						duplicates: [],
					};
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/lead-list/add-leads`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'removeLeadFromList') {
					const leadsListId = this.getNodeParameter('leadsListId', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					let leadIds = additionalFields.leadIds || 'ALL';
					// Handle leadIds as array or string 'ALL'
					if (typeof leadIds === 'string') {
						if (leadIds.trim() !== 'ALL') {
							try {
								leadIds = JSON.parse(leadIds);
							} catch {
								// fallback: keep as string if not a valid array
							}
						}
					}

					const body: any = {
						leadsListId,
						leadIds,
					};
					if (additionalFields.excludeIds !== undefined) {
						body.excludeIds =
							typeof additionalFields.excludeIds === 'string'
								? JSON.parse(additionalFields.excludeIds)
								: additionalFields.excludeIds;
					}
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'DELETE',
							url: `${credentials.baseUrl}/api/v1/lead-list/delete-leads`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'addToBlocklist') {
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

					const body: any = {};
					if (additionalFields.emails !== undefined) {
						body.emails =
							typeof additionalFields.emails === 'string'
								? JSON.parse(additionalFields.emails)
								: additionalFields.emails;
					}
					if (additionalFields.domains !== undefined) {
						body.domains =
							typeof additionalFields.domains === 'string'
								? JSON.parse(additionalFields.domains)
								: additionalFields.domains;
					}
					if (additionalFields.keywords !== undefined) {
						body.keywords =
							typeof additionalFields.keywords === 'string'
								? JSON.parse(additionalFields.keywords)
								: additionalFields.keywords;
					}
					if (additionalFields.repliesKeywords !== undefined) {
						body.repliesKeywords =
							typeof additionalFields.repliesKeywords === 'string'
								? JSON.parse(additionalFields.repliesKeywords)
								: additionalFields.repliesKeywords;
					}
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl}/api/v1/blocklist/add`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}

				if (operation === 'removeFromBlocklist') {
					const ids = this.getNodeParameter('ids', i);
					const table = this.getNodeParameter('table', i) as string;
					const body = {
						ids: typeof ids === 'string' ? JSON.parse(ids) : ids,
					};
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'reachInboxApi',
						{
							method: 'DELETE',
							url: `${credentials.baseUrl}/api/v1/blocklist/${table}`,
							headers,
							body,
							json: true,
						},
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				}
			} catch (error: any) {
				returnData.push({
					json: {
						error: error.message,
						...(error.response?.data && { details: error.response.data }),
					},
					pairedItem: { item: i },
				});
			}
		}

		return [returnData];
	}
}

