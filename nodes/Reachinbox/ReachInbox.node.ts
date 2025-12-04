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
						description: 'Interact with campaigns',
					},
					{
						name: 'Lead',
						value: 'lead',
						description: 'Interact with leads',
					},
					{
						name: 'Leads List',
						value: 'leadsList',
						description: 'Interact with leads lists',
					},
					{
						name: 'Blocklist',
						value: 'blocklist',
						description: 'Interact with blocklists',
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
						name: 'Add Email Sequences to a Campaign',
						value: 'addSequences',
						action: 'Add sequences to campaign',
					},
					{
						name: 'Add Sending Email Accounts to a Campaign',
						value: 'addEmailToCampaign',
						action: 'Add email to campaign',
					},
					{
						name: 'Create a New Campaign',
						value: 'createCampaign',
						action: 'Create a new campaign',
					},
					{
						name: 'Get the Current Status of a Campaign',
						value: 'getCampaignStatus',
						action: 'Get campaign status',
					},
					{
						name: 'Pause a Campaign',
						value: 'pauseCampaign',
						action: 'Pause a campaign',
					},
					{
						name: 'Start a Campaign',
						value: 'startCampaign',
						action: 'Start a campaign',
					},
					{
						name: 'Update Campaign Details',
						value: 'updateCampaignDetails',
						action: 'Update campaign details',
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
						name: 'Add a Lead to a Campaign',
						value: 'add',
						action: 'Add a lead to a campaign',
					},
					{
						name: "Update a Specific Lead's Data",
						value: 'update',
						action: 'Update a specific lead data',
					},
					{
						name: 'Delete a Lead from a Campaign',
						value: 'delete',
						action: 'Delete a lead from a campaign',
					},
					{
						name: 'Pause or Resume Leads in a Campaign',
						value: 'changeLeadsState',
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
						name: 'Add a Lead to a Leads List',
						value: 'addLeadToList',
						action: 'Add a lead to a leads list',
					},
					{
						name: 'Remove a Lead from a Leads List',
						value: 'removeLeadFromList',
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
						name: 'Add Emails, Domains or Keywords to the Blocklist',
						value: 'addToBlocklist',
						action: 'Add to blocklist',
					},
					{
						name: 'Remove Emails, Domains or Keywords from the Blocklist',
						value: 'removeFromBlocklist',
						action: 'Remove from blocklist',
					},
				],
				default: 'addToBlocklist',
			},

			// Campaign - Create
			{
				displayName: 'The Name of the Campaign',
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
				displayName: 'The ID of the Campaign',
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
				displayName: 'The Emails to Add to the Campaign',
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
				displayName: 'The Email Sequences to Add to the Campaign',
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
						displayName: 'Enable AI Replies',
						name: 'aiReplies',
						type: 'boolean',
						default: false,
						description: 'Whether to enable AI replies.',
					},
					{
						displayName: 'Enable Blockquote',
						name: 'blockquote',
						type: 'boolean',
						default: false,
						description: 'Whether to enable blockquote.',
					},
					{
						displayName: 'Enable Global Unsubscribe',
						name: 'globalUnsubscribe',
						type: 'boolean',
						default: true,
						description: 'Whether to enable global unsubscribe.',
					},
					{
						displayName: 'Enable Link Tracking',
						name: 'linkTracking',
						type: 'boolean',
						default: true,
						description: 'Whether to enable link tracking.',
					},
					{
						displayName: 'Enable Tracking',
						name: 'tracking',
						type: 'boolean',
						default: true,
						description: 'Whether to enable tracking.',
					},
					{
						displayName: 'Prioritize New Leads in the Campaign',
						name: 'prioritizeNewLeads',
						type: 'boolean',
						default: false,
						description: 'Whether to prioritize new leads in the campaign.',
					},
					{
						displayName: 'Stop the Campaign on Reply',
						name: 'stopOnReply',
						type: 'boolean',
						default: false,
						description: 'Whether to stop the campaign when a lead replies.',
					},
					{
						displayName: 'The Daily Limit for the Campaign',
						name: 'dailyLimit',
						type: 'number',
						default: 200,
					},
					{
						displayName: 'The Delay (in Seconds) Between Emails',
						name: 'delay',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'The Random Delay (in Seconds) Between Emails',
						name: 'randomDelay',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'The Sending Email Accounts to Use',
						name: 'accountsToUse',
						type: 'string',
						default: 'ALL',
						description: 'Comma-separated emails or "ALL" to use all accounts.',
					},
					{
						displayName: 'The Slack Webhook URL for AI Replies Notifications',
						name: 'aiRepliesSlackWebhook',
						type: 'string',
						default: '',
						description: 'Slack webhook URL for AI replies notifications.',
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
						description: 'Search term to filter accounts by email.',
					},
					{
						displayName: 'Warmup Health Score',
						name: 'warmupHealthScore',
						type: 'number',
						default: 0,
						description: 'Minimum warmup health score for accounts.',
					},
					{
						displayName: 'Utilization Percentage',
						name: 'utilization',
						type: 'number',
						default: 100,
						description: 'Maximum utilization percentage for accounts.',
					},
				],
			},

			// Lead - Add to Campaign
			{
				displayName: 'The ID of the Campaign',
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
				displayName: 'The Leads to Add to the Campaign',
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
						displayName: 'The New Core Variables to Add to the Lead',
						name: 'newCoreVariables',
						type: 'json',
						default: '',
						description: 'Array of new variables like ["firstName", "lastName"]',
					},
				],
				description: 'Additional lead settings and options',
			},

			// Lead - Update in Campaign
			{
				displayName: 'The ID of the Campaign',
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
				displayName: 'The ID of the Lead',
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
				displayName: 'The Attributes of the Lead',
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
				displayName: 'Additional Lead Settings and Options',
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
						displayName: 'The Email of the Lead',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'The email of the lead',
					},
					{
						displayName: 'The Status of the Lead',
						name: 'leadStatus',
						type: 'string',
						default: '',
						description: 'The status of the lead',
					},
				],
				description: 'Additional lead settings and options',
			},

			// Lead - Delete from Campaign
			{
				displayName: 'The ID of the Campaign',
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
				displayName: 'Additional Lead Settings and Options',
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
						displayName: 'The IDs of the Leads to Delete',
						name: 'leadIds',
						type: 'json',
						default: '[]',
						description: 'Lead IDs to delete',
					},
					{
						displayName: 'The Search Condition for the Leads to Delete',
						name: 'contains',
						type: 'string',
						default: '',
						description: 'Filter leads containing specific text',
					},
					{
						displayName: 'The IDs of the Leads to Exclude from the Deletion',
						name: 'exclude',
						type: 'json',
						default: '[]',
						description: 'Lead IDs to exclude from the deletion',
					},
					{
						displayName: 'The Status of the Leads to Delete',
						name: 'leadStatus',
						type: 'string',
						default: '',
						description: 'Filter leads by lead status (e.g., "Interested")',
					},
				],
				description: 'Additional lead settings and options',
			},

			// Lead - Pause/Resume
			{
				displayName: 'The ID of the Campaign',
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
				displayName: 'The New Status for the Leads',
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
						description: 'Pause leads',
					},
					{
						name: 'Resume Leads',
						value: 'IN_PROCESS',
						description: 'Resume leads',
					},
				],
				default: 'PAUSED',
				description: 'The new status for the leads',
			},
			{
				displayName: 'Additional Lead Settings and Options',
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
						displayName: 'Contains Filter',
						name: 'contains',
						type: 'string',
						default: '',
						description: 'Filter leads containing specific text.',
					},
					{
						displayName: 'Exclude Lead IDs (Array)',
						name: 'excludeLeadsIds',
						type: 'json',
						default: '[]',
						description: 'Lead IDs to exclude from the update.',
					},
					{
						displayName: 'Lead IDs (Array)',
						name: 'leadsIds',
						type: 'json',
						default: '[]',
						description: 'Specific lead IDs to update (empty for all).',
					},
					{
						displayName: 'Lead Status Filter',
						name: 'leadStatus',
						type: 'string',
						default: '',
						description: 'Filter leads by lead status (e.g., "Interested").',
					},
					{
						displayName: 'Status Filter',
						name: 'status',
						type: 'string',
						default: '',
						description: 'Filter leads by status (e.g., "emails_opened").',
					},
				],
			},

			// Leads List - Add Lead
			{
				displayName: 'The ID of the Leads List',
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
				description: 'The ID of the leads list',
			},
			{
				displayName: 'The Leads to Add to the Leads List',
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
				displayName: 'Additional Leads List Settings and Options',
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
						displayName: 'The New Core Variables to Add to the Leads',
						name: 'newCoreVariables',
						type: 'json',
						default: '',
						description: 'The new core variables to add to the leads',
					},
				],
				description: 'Additional leads list settings and options',
			},

			// Leads List - Remove Lead
			{
				displayName: 'The ID of the Leads List',
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
				description: 'The ID of the leads list',
			},
			{
				displayName: 'Additional Leads List Settings and Options',
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
						displayName: 'The IDs of the Leads to Remove from the Leads List',
						name: 'leadIds',
						type: 'string',
						default: 'ALL',
						description: 'Comma-separated list of lead IDs or "ALL" to remove all leads',
					},
					{
						displayName: 'The IDs of the Leads to Exclude from the Removal',
						name: 'excludeIds',
						type: 'json',
						default: '[]',
						description: 'Array of lead IDs to exclude from deletion',
					},
				],
				description: 'Additional leads list settings and options',
			},

			// Blocklist - Add
			{
				displayName: 'Additional Blocklist Settings and Options',
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
						displayName: 'The Emails to Add to the Blocklist',
						name: 'emails',
						type: 'json',
						default: '[]',
						description: 'The emails to add to the blocklist',
					},
					{
						displayName: 'The Domains to Add to the Blocklist',
						name: 'domains',
						type: 'json',
						default: '[]',
						description: 'The domains to add to the blocklist',
					},
					{
						displayName: 'The Keywords to Add to the Blocklist',
						name: 'keywords',
						type: 'json',
						default: '[]',
						description: 'The keywords to add to the blocklist',
					},
					{
						displayName: 'The Replies Keywords to Add to the Blocklist',
						name: 'repliesKeywords',
						type: 'json',
						default: '[]',
						description: 'The replies keywords to add to the blocklist',
					},
				],
				description: 'Additional blocklist settings and options',
			},

			// Blocklist - Remove
			{
				displayName: 'The Type of Blocklist to Remove from',
				name: 'table',
				type: 'options',
				required: true,
				options: [
					{ name: 'Email', value: 'email', description: 'Email blocklist' },
					{ name: 'Domain', value: 'domain', description: 'Domain blocklist' },
					{ name: 'Keyword', value: 'keyword', description: 'Keyword blocklist' },
					{ name: 'Replies Keyword', value: 'replies-keyword', description: 'Replies keyword blocklist' },
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
				displayName: 'The IDs of the Keywords to Remove from the Blocklist',
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
							if (typeof additionalFields.exclude === 'string') {
								try {
									body.exclude = JSON.parse(additionalFields.exclude);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "exclude" JSON in additional fields: ${error.message}`,
									);
								}
							} else {
								body.exclude = additionalFields.exclude;
							}
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
						if (typeof additionalFields.leadIds === 'string') {
							const trimmedLeadIds = additionalFields.leadIds.trim();
							if (trimmedLeadIds.length > 0) {
								try {
									body.leadIds = JSON.parse(trimmedLeadIds);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "leadIds" JSON in additional fields: ${error.message}`,
									);
								}
							}
						} else {
							body.leadIds = additionalFields.leadIds;
						}
					}
					if (additionalFields.contains) body.contains = additionalFields.contains;
					if (additionalFields.exclude !== undefined) {
						if (typeof additionalFields.exclude === 'string') {
							const trimmedExclude = additionalFields.exclude.trim();
							if (trimmedExclude.length > 0) {
								try {
									body.exclude = JSON.parse(trimmedExclude);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "exclude" JSON in additional fields: ${error.message}`,
									);
								}
							}
						} else {
							body.exclude = additionalFields.exclude;
						}
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
						leadsIds: [],
						excludeLeadsIds: [],
					};

					if (additionalFields.leadsIds) {
						if (typeof additionalFields.leadsIds === 'string') {
							const trimmedLeadsIds = additionalFields.leadsIds.trim();
							if (trimmedLeadsIds.length > 0) {
								try {
									body.leadsIds = JSON.parse(trimmedLeadsIds);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "leadsIds" JSON in additional fields: ${error.message}`,
									);
								}
							}
						} else {
							body.leadsIds = additionalFields.leadsIds;
						}
					}

					if (additionalFields.excludeLeadsIds) {
						if (typeof additionalFields.excludeLeadsIds === 'string') {
							const trimmedExcludeLeadsIds = additionalFields.excludeLeadsIds.trim();
							if (trimmedExcludeLeadsIds.length > 0) {
								try {
									body.excludeLeadsIds = JSON.parse(trimmedExcludeLeadsIds);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "excludeLeadsIds" JSON in additional fields: ${error.message}`,
									);
								}
							}
						} else {
							body.excludeLeadsIds = additionalFields.excludeLeadsIds;
						}
					}
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
						if (typeof additionalFields.excludeIds === 'string') {
							const trimmedExcludeIds = additionalFields.excludeIds.trim();
							if (trimmedExcludeIds.length > 0) {
								try {
									body.excludeIds = JSON.parse(trimmedExcludeIds);
								} catch (error: any) {
									throw new NodeOperationError(
										this.getNode(),
										`Failed to parse "excludeIds" JSON in additional fields: ${error.message}`,
									);
								}
							}
						} else {
							body.excludeIds = additionalFields.excludeIds;
						}
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

					const parseArrayField = (value: unknown, fieldName: string) => {
						if (typeof value === 'string') {
							const trimmed = value.trim();
							if (!trimmed) return undefined;
							try {
								const parsed = JSON.parse(trimmed);
								return Array.isArray(parsed) ? parsed : undefined;
							} catch (error: any) {
								throw new NodeOperationError(
									this.getNode(),
									`Failed to parse "${fieldName}" JSON in additional fields: ${error.message}`,
								);
							}
						}
						if (Array.isArray(value)) {
							return value;
						}
						return undefined;
					};

					const emails = parseArrayField(additionalFields.emails, 'emails');
					const domains = parseArrayField(additionalFields.domains, 'domains');
					const keywords = parseArrayField(additionalFields.keywords, 'keywords');
					const repliesKeywords = parseArrayField(additionalFields.repliesKeywords, 'repliesKeywords');

					if (emails && emails.length > 0) {
						body.emails = emails;
					}
					if (domains && domains.length > 0) {
						body.domains = domains;
					}
					if (keywords && keywords.length > 0) {
						body.keywords = keywords;
					}
					if (repliesKeywords && repliesKeywords.length > 0) {
						body.repliesKeywords = repliesKeywords;
					}

					if (
						!body.emails &&
						!body.domains &&
						!body.keywords &&
						!body.repliesKeywords
					) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one blocklist type must be provided: emails, domains, keywords, or repliesKeywords.',
						);
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

