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
  
  export class ReachinboxAction implements INodeType {
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
          options: [
            {
              name: 'Add Leads',
              value: 'add',
              description: 'Add multiple leads to a campaign',
            },
            {
              name: 'Update Lead',
              value: 'update',
              description: 'Update a specific lead\'s data',
            },
            {
              name: 'Delete Leads',
              value: 'delete',
              description: 'Delete one or more leads from a campaign',
            },
          ],
          default: 'add',
          description: 'Action to perform in ReachInbox',
        },
      
        // ✅ Shared across all
        {
          displayName: 'Campaign ID',
          name: 'campaignId',
          type: 'string',
          required: true,
          default: '',
        },
      
        // ✅ For Add
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
          description: 'Array of lead objects. Example: [{"email": "john@example.com", "firstName": "John"}]',
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
      
        // ✅ For Update
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
      
        // ✅ For Delete
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
      ],      
    };
  
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
      const returnData: INodeExecutionData[] = [];
      const items = this.getInputData();
      const credentials = await this.getCredentials('reachInboxApi') as { apiKey: string; baseUrl: string };
      const headers = { Authorization: `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' };
  
      for (let i = 0; i < items.length; i++) {
        const operation = this.getNodeParameter('operation', i) as string;
        const campaignId = this.getNodeParameter('campaignId', i) as string;
  
        try {
          if (operation === 'add') {
            const rawLeads = this.getNodeParameter('leads', i);
            const rawCoreVars = this.getNodeParameter('newCoreVariables', i);
            const leads = typeof rawLeads === 'string' ? JSON.parse(rawLeads) : rawLeads;
            const newCoreVariables = typeof rawCoreVars === 'string' ? JSON.parse(rawCoreVars) : rawCoreVars;
  
            const body = { campaignId, leads, newCoreVariables: newCoreVariables || [], duplicates: [] };
            const response = await axios.post(`${credentials.baseUrl}/api/v1/leads/n8n/add`, body, { headers });
            returnData.push({ json: response.data });
          }
  
          if (operation === 'update') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            const email = this.getNodeParameter('email', i) as string;
            const attributes = this.getNodeParameter('attributes', i);
            const leadStatus = this.getNodeParameter('leadStatus', i) as string;
  
            const body: any = { campaignId, leadId, attributes };
            if (email) body.email = email;
            if (leadStatus) body.leadStatus = leadStatus;
            const response = await axios.post(`${credentials.baseUrl}/api/v1/leads/n8n/update`, body, { headers });
            returnData.push({ json: response.data });
          }
  
          if (operation === 'delete') {
            const leadIds = this.getNodeParameter('leadIds', i);
            const contains = this.getNodeParameter('contains', i) as string;
            const exclude = this.getNodeParameter('exclude', i);
            const leadStatus = this.getNodeParameter('leadStatus', i) as string;

            const body = { campaignId, leadIds, contains, exclude, leadStatus, status: leadStatus };
            const response = await axios.post(`${credentials.baseUrl}/api/v1/leads/n8n/delete`, body, { headers });
            returnData.push({ json: response.data });
          }
        } catch (error: any) {
          returnData.push({ json: { error: error.message, ...(error.response?.data && { details: error.response.data }) } });
        }
      }
  
      return [returnData];
    }
    
  }
