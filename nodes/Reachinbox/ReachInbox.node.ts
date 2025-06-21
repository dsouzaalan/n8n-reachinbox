import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeInputConfiguration,
	INodeOutputConfiguration,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import axios from 'axios';

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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					// Campaign Operations
					{
						name: 'Start a Campaign',
						value: 'startCampaign',
						description: 'Start a campaign',
						action: 'Start a campaign',
					},
					{
						name: 'Create Campaign',
						value: 'createCampaign',
						description: 'Create a new campaign',
						action: 'Create a new campaign',
					},
					{
						name: 'Add Email to Campaign',
						value: 'addEmailToCampaign',
						description: 'Add sending email accounts to a campaign',
						action: 'Add email to campaign',
					},
					{
						name: 'Update Campaign Details',
						value: 'updateCampaignDetails',
						description: 'Update campaign settings and options',
						action: 'Update campaign details',
					},
					{
						name: 'Add Sequences to Campaign',
						value: 'addSequences',
						description: 'Add email sequences to a campaign',
						action: 'Add sequences to campaign',
					},
					{
						name: 'Pause a Campaign',
						value: 'pauseCampaign',
						description: 'Pause a campaign',
						action: 'Pause a campaign',
					},
					{
						name: 'Get Campaign Status',
						value: 'getCampaignStatus',
						description: 'Get the current status of a campaign',
						action: 'Get campaign status',
					},
					{
						name: 'Add Lead to Campaign',
						value: 'add',
						description: 'Add a lead to a campaign',
						action: 'Add a lead to a campaign',
					},
					{
						name: 'Update Lead in Campaign',
						value: 'update',
						description: "Update a specific lead's data",
						action: 'Update a specific lead data',
					},
					{
						name: 'Delete Lead from Campaign',
						value: 'delete',
						description: 'Delete a lead from a campaign',
						action: 'Delete a lead from a campaign',
					},
					{
						name: 'Pause/Resume Leads',
						value: 'changeLeadsState',
						description: 'Pause or resume leads in a campaign',
						action: 'Pause or resume leads',
					},

					// Lead List Operations
					{
						name: 'Add Lead to Leads List',
						value: 'addLeadToList',
						description: 'Add a lead to a leads list',
						action: 'Add a lead to a leads list',
					},
					{
						name: 'Remove Lead from Leads List',
						value: 'removeLeadFromList',
						description: 'Remove a lead from a leads list',
						action: 'Remove a lead from a leads list',
					},

					// Blocklist Operations
					{
						name: 'Add to Blocklist',
						value: 'addToBlocklist',
						description: 'Add emails, domains or keywords to blocklist',
						action: 'Add to blocklist',
					},
					{
						name: 'Remove from Blocklist',
						value: 'removeFromBlocklist',
						description: 'Remove keywords from blocklist',
						action: 'Remove from blocklist',
					},
				],
				default: 'add',
			},

			// Shared across campaign operations
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: [
							'add',
							'update',
							'delete',
							'startCampaign',
							'pauseCampaign',
							'getCampaignStatus',
							'changeLeadsState',
							'updateCampaignDetails',
							'addSequences',
						],
					},
				},
			},

			// For Create Campaign
			{
				displayName: 'Campaign Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['createCampaign'],
					},
				},
			},

			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['addEmailToCampaign'],
					},
				},
				description: 'Comma-separated list of email addresses to add to the campaign',
			},

			// For Update Campaign Details
			{
				displayName: 'Daily Limit',
				name: 'dailyLimit',
				type: 'number',
				default: 200,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Tracking Enabled',
				name: 'tracking',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Link Tracking',
				name: 'linkTracking',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Delay (seconds)',
				name: 'delay',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Random Delay (seconds)',
				name: 'randomDelay',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Stop on Reply',
				name: 'stopOnReply',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Blockquote',
				name: 'blockquote',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Global Unsubscribe',
				name: 'globalUnsubscribe',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Prioritize New Leads',
				name: 'prioritizeNewLeads',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Accounts to Use',
				name: 'accountsToUse',
				type: 'string',
				default: 'ALL',
				description: 'Comma-separated emails or "ALL" to use all accounts',
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'Exclude Emails (JSON)',
				name: 'exclude',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
						accountsToUse: ['ALL'],
					},
				},
				description: 'Array of emails to exclude',
			},
			{
				displayName: 'Search Condition',
				name: 'search',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
						accountsToUse: ['ALL'],
					},
				},
				description: 'Search term to filter accounts by email',
			},
			{
				displayName: 'Warmup Health Score',
				name: 'warmupHealthScore',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
						accountsToUse: ['ALL'],
					},
				},
				description: 'Minimum warmup health score for accounts',
			},
			{
				displayName: 'Utilization Percentage',
				name: 'utilization',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
						accountsToUse: ['ALL'],
					},
				},
				description: 'Maximum utilization percentage for accounts',
			},
			{
				displayName: 'AI Replies Enabled',
				name: 'aiReplies',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
					},
				},
			},
			{
				displayName: 'AI Replies Slack Webhook',
				name: 'aiRepliesSlackWebhook',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['updateCampaignDetails'],
						aiReplies: [true],
					},
				},
				description: 'Slack webhook URL for AI replies notifications',
			},

			// Add parameters for Add Sequences
			{
				displayName: 'Sequences (JSON)',
				name: 'sequences',
				type: 'json',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['addSequences'],
					},
				},
				description: 'Array of sequence objects to add to the campaign',
			},

			// For Add Lead to Campaign
			{
				displayName: 'Leads (JSON)',
				name: 'leads',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				description:
					'Array of lead objects. Example: [{"email": "john@example.com", "firstName": "John"}]',
			},
			{
				displayName: 'New Core Variables (Array)',
				name: 'newCoreVariables',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				description: 'Array of new variables like ["firstName", "lastName"]',
			},

			// For Update Lead in Campaign
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
			},
			{
				displayName: 'Email (Optional)',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
			},
			{
				displayName: 'Attributes (JSON)',
				name: 'attributes',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				description: 'Example: {"firstName": "John", "lastName": "Doe"}',
			},
			{
				displayName: 'Lead Status',
				name: 'leadStatus',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
			},

			// For Delete Lead from Campaign
			{
				displayName: 'Lead IDs (Array)',
				name: 'leadIds',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '[]',
			},
			{
				displayName: 'Contains (Filter)',
				name: 'contains',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '',
			},
			{
				displayName: 'Exclude (Lead IDs)',
				name: 'exclude',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '[]',
			},
			{
				displayName: 'Lead Status',
				name: 'leadStatus',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '',
			},

			// For Lead List Operations
			{
				displayName: 'Leads List ID',
				name: 'leadsListId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['addLeadToList', 'removeLeadFromList'],
					},
				},
			},

			// For Add Lead to Leads List
			{
				displayName: 'Leads (JSON)',
				name: 'leads',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addLeadToList'],
					},
				},
				default: '',
				description:
					'Array of lead objects. Example: [{"email": "john@example.com", "firstName": "John"}]',
			},
			{
				displayName: 'New Core Variables (Array)',
				name: 'newCoreVariables',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addLeadToList'],
					},
				},
				default: '',
				description: 'Array of new variables like ["firstName", "lastName"]',
			},

			// For Remove Lead from Leads List
			{
				displayName: 'Lead IDs',
				name: 'leadIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['removeLeadFromList'],
					},
				},
				default: 'ALL',
				description: 'Comma-separated list of lead IDs or "ALL" to remove all leads',
			},
			{
				displayName: 'Exclude IDs (Array)',
				name: 'excludeIds',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['removeLeadFromList'],
					},
				},
				default: '[]',
				description: 'Array of lead IDs to exclude from deletion',
			},

			// For Blocklist Operations
			{
				displayName: 'Emails (Array)',
				name: 'emails',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addToBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of emails to block',
			},
			{
				displayName: 'Domains (Array)',
				name: 'domains',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addToBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of domains to block',
			},
			{
				displayName: 'Keywords (Array)',
				name: 'keywords',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addToBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of keywords to block',
			},
			{
				displayName: 'Replies Keywords (Array)',
				name: 'repliesKeywords',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['addToBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of reply keywords to block',
			},
			{
				displayName: 'Keyword IDs (Array)',
				name: 'ids',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['removeFromBlocklist'],
					},
				},
				default: '[]',
				description: 'Array of keyword IDs to remove from blocklist',
			},

			// For Pause/Resume Leads
			{
				displayName: 'Updated Status',
				name: 'updatedStatus',
				type: 'options',
				displayOptions: {
					show: {
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
				displayName: 'Lead IDs (Array)',
				name: 'leadsIds',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['changeLeadsState'],
					},
				},
				default: '[]',
				description: 'Specific lead IDs to update (empty for all)',
			},
			{
				displayName: 'Exclude Lead IDs (Array)',
				name: 'excludeLeadsIds',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['changeLeadsState'],
					},
				},
				default: '[]',
				description: 'Lead IDs to exclude from the update',
			},
			{
				displayName: 'Status Filter',
				name: 'status',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['changeLeadsState'],
					},
				},
				default: '',
				description: 'Filter leads by status (e.g., "emails_opened")',
			},
			{
				displayName: 'Lead Status Filter',
				name: 'leadStatus',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['changeLeadsState'],
					},
				},
				default: '',
				description: 'Filter leads by lead status (e.g., "Interested")',
			},
			{
				displayName: 'Contains Filter',
				name: 'contains',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['changeLeadsState'],
					},
				},
				default: '',
				description: 'Filter leads containing specific text',
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
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
		};

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (operation === 'startCampaign') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/campaigns/start`,
						{ campaignId },
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'createCampaign') {
					const name = this.getNodeParameter('name', i) as string;

					const body = {
						name,
					};

					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/campaigns/create`,
						body,
						{ headers },
					);
					returnData.push({ json: response.data });
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
						throw new Error('No valid email(s) provided');
					}

					const body = {
						campaignId,
						emails: emailList,
					};

					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/campaigns/add-email`,
						body,
						{ headers },
					);

					// Format the response to match the API structure
					const responseData = {
						success: response.data.status === 200,
						message: response.data.message,
						data: {
							addedCount: response.data.data?.addedCount || 0,
							failedEmails: response.data.data?.failedEmails || [],
						},
					};

					returnData.push({ json: responseData });
				}

				if (operation === 'updateCampaignDetails') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const dailyLimit = this.getNodeParameter('dailyLimit', i) as number;
					const tracking = this.getNodeParameter('tracking', i) as boolean;
					const linkTracking = this.getNodeParameter('linkTracking', i) as boolean;
					const delay = this.getNodeParameter('delay', i) as number;
					const randomDelay = this.getNodeParameter('randomDelay', i) as number;
					const stopOnReply = this.getNodeParameter('stopOnReply', i) as boolean;
					const blockquote = this.getNodeParameter('blockquote', i) as boolean;
					const globalUnsubscribe = this.getNodeParameter('globalUnsubscribe', i) as boolean;
					const prioritizeNewLeads = this.getNodeParameter('prioritizeNewLeads', i) as boolean;
					const accountsToUse = this.getNodeParameter('accountsToUse', i) as string;
					const aiReplies = this.getNodeParameter('aiReplies', i) as boolean;

					const body: any = {
						campaignId,
						dailyLimit,
						tracking,
						linkTracking,
						delay,
						randomDelay,
						stopOnReply,
						blockquote,
						globalUnsubscribe,
						prioritizeNewLeads,
						accountsToUse,
						aiReplies,
					};

					if (accountsToUse === 'ALL') {
						const exclude = this.getNodeParameter('exclude', i);
						const search = this.getNodeParameter('search', i) as string;
						const warmupHealthScore = this.getNodeParameter('warmupHealthScore', i) as number;
						const utilization = this.getNodeParameter('utilization', i) as number;

						const condition: any = {};
						if (search) condition.search = search;
						if (warmupHealthScore > 0) condition.warmupHealthScore = warmupHealthScore;
						if (utilization < 100) condition.utilization = utilization;

						if (Object.keys(condition).length > 0) {
							body.condition = condition;
						}
						if (exclude) {
							body.exclude = typeof exclude === 'string' ? JSON.parse(exclude) : exclude;
						}
					}

					if (aiReplies) {
						const aiRepliesSlackWebhook = this.getNodeParameter(
							'aiRepliesSlackWebhook',
							i,
						) as string;
						if (aiRepliesSlackWebhook) {
							body.aiRepliesSlackWebhook = aiRepliesSlackWebhook;
						}
					}

					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/campaigns/update-details`,
						body,
						{ headers },
					);
					returnData.push({ json: response.data });
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

					const response = await axios.post(`${credentials.baseUrl}/api/v1/campaigns/add`, body, {
						headers,
					});
					returnData.push({ json: response.data });
				}

				if (operation === 'pauseCampaign') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/campaigns/pause`,
						{ campaignId },
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'getCampaignStatus') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const response = await axios.get(
						`${credentials.baseUrl}/api/v1/campaigns/status?campaignId=${campaignId}`,
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'add') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const rawLeads = this.getNodeParameter('leads', i);
					const rawCoreVars = this.getNodeParameter('newCoreVariables', i);
					const leads = typeof rawLeads === 'string' ? JSON.parse(rawLeads) : rawLeads;
					const newCoreVariables =
						typeof rawCoreVars === 'string' ? JSON.parse(rawCoreVars) : rawCoreVars;

					const body = {
						campaignId,
						leads,
						newCoreVariables: newCoreVariables || [],
						duplicates: [],
					};
					const response = await axios.post(`${credentials.baseUrl}/api/v1/leads/n8n/add`, body, {
						headers,
					});
					returnData.push({ json: response.data });
				}

				if (operation === 'update') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const leadId = this.getNodeParameter('leadId', i) as string;
					const email = this.getNodeParameter('email', i) as string;
					const attributes = this.getNodeParameter('attributes', i);
					const leadStatus = this.getNodeParameter('leadStatus', i) as string;

					const body: any = { campaignId, leadId, attributes };
					if (email) body.email = email;
					if (leadStatus) body.leadStatus = leadStatus;
					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/leads/n8n/update`,
						body,
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'delete') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const leadIds = this.getNodeParameter('leadIds', i);
					const contains = this.getNodeParameter('contains', i) as string;
					const exclude = this.getNodeParameter('exclude', i);
					const leadStatus = this.getNodeParameter('leadStatus', i) as string;

					const body = { campaignId, leadIds, contains, exclude, leadStatus, status: leadStatus };
					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/leads/n8n/delete`,
						body,
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'changeLeadsState') {
					const campaignId = this.getNodeParameter('campaignId', i) as string;
					const updatedStatus = this.getNodeParameter('updatedStatus', i) as string;
					const leadsIds = this.getNodeParameter('leadsIds', i);
					const excludeLeadsIds = this.getNodeParameter('excludeLeadsIds', i);
					const status = this.getNodeParameter('status', i) as string;
					const leadStatus = this.getNodeParameter('leadStatus', i) as string;
					const contains = this.getNodeParameter('contains', i) as string;

					const body: any = {
						campaignId,
						updatedStatus,
						leadsIds: typeof leadsIds === 'string' ? JSON.parse(leadsIds) : leadsIds,
						excludeLeadsIds:
							typeof excludeLeadsIds === 'string' ? JSON.parse(excludeLeadsIds) : excludeLeadsIds,
					};
					if (status) body.status = status;
					if (leadStatus) body.leadStatus = leadStatus;
					if (contains) body.contains = contains;

					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/leads/change-state`,
						body,
						{ headers },
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'addLeadToList') {
					const leadsListId = this.getNodeParameter('leadsListId', i) as string;
					const rawLeads = this.getNodeParameter('leads', i);
					const rawCoreVars = this.getNodeParameter('newCoreVariables', i);
					const leads = typeof rawLeads === 'string' ? JSON.parse(rawLeads) : rawLeads;
					const newCoreVariables =
						typeof rawCoreVars === 'string' ? JSON.parse(rawCoreVars) : rawCoreVars;

					const body = {
						leadsListId,
						leads,
						newCoreVariables: newCoreVariables || [],
						duplicates: [],
					};
					const response = await axios.post(
						`${credentials.baseUrl}/api/v1/lead-list/add-leads`,
						body,
						{
							headers,
						},
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'removeLeadFromList') {
					const leadsListId = this.getNodeParameter('leadsListId', i) as string;
					const leadIds = this.getNodeParameter('leadIds', i) as string;
					const excludeIds = this.getNodeParameter('excludeIds', i);

					const body = {
						leadsListId,
						leadIds,
						excludeIds: typeof excludeIds === 'string' ? JSON.parse(excludeIds) : excludeIds,
					};
					const response = await axios.delete(
						`${credentials.baseUrl}/api/v1/lead-list/delete-leads`,
						{
							headers,
							data: body,
						},
					);
					returnData.push({ json: response.data });
				}

				if (operation === 'addToBlocklist') {
					const emails = this.getNodeParameter('emails', i);
					const domains = this.getNodeParameter('domains', i);
					const keywords = this.getNodeParameter('keywords', i);
					const repliesKeywords = this.getNodeParameter('repliesKeywords', i);

					const body = {
						emails: typeof emails === 'string' ? JSON.parse(emails) : emails,
						domains: typeof domains === 'string' ? JSON.parse(domains) : domains,
						keywords: typeof keywords === 'string' ? JSON.parse(keywords) : keywords,
						repliesKeywords:
							typeof repliesKeywords === 'string' ? JSON.parse(repliesKeywords) : repliesKeywords,
					};
					const response = await axios.post(`${credentials.baseUrl}/api/v1/blocklist/add`, body, {
						headers,
					});
					returnData.push({ json: response.data });
				}

				if (operation === 'removeFromBlocklist') {
					const ids = this.getNodeParameter('ids', i);
					const body = {
						ids: typeof ids === 'string' ? JSON.parse(ids) : ids,
					};
					const response = await axios.delete(`${credentials.baseUrl}/api/v1/blocklist/keyword`, {
						headers,
						data: body,
					});
					returnData.push({ json: response.data });
				}
			} catch (error: any) {
				returnData.push({
					json: {
						error: error.message,
						...(error.response?.data && { details: error.response.data }),
					},
				});
			}
		}

		return [returnData];
	}
}
