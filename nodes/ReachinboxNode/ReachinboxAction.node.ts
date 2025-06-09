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
              name: 'Add Lead',
              value: 'add',
              description: 'Add a new lead',
            },
            {
              name: 'Update Lead',
              value: 'update',
              description: 'Update an existing lead',
            },
            {
              name: 'Delete Lead',
              value: 'delete',
              description: 'Delete an existing lead',
            },
          ],
          default: 'add',
          description: 'Action to perform',
        },
        {
          displayName: 'Lead ID',
          name: 'leadId',
          type: 'string',
          required: false,
          displayOptions: {
            show: {
              operation: ['update', 'delete'],
            },
          },
          default: '',
          description: 'ID of the lead to update or delete',
        },
        {
          displayName: 'Lead Data (JSON)',
          name: 'leadData',
          type: 'json',
          required: false,
          displayOptions: {
            show: {
              operation: ['add', 'update'],
            },
          },
          default: '',
          description: 'JSON object with lead properties (e.g. name, email)',
        },
      ],
    };
  
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
      const returnData: INodeExecutionData[] = [];
      const items = this.getInputData();
  
      const credentials = await this.getCredentials('reachInboxApi') as {
        apiKey: string;
        baseUrl: string;
      };
  
      const headers = {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      };
  
      for (let i = 0; i < items.length; i++) {
        const operation = this.getNodeParameter('operation', i) as string;
        let responseData;
  
        try {
          if (operation === 'add') {
            const leadData = this.getNodeParameter('leadData', i, {}) as object;
  
            responseData = await axios.post(
              `${credentials.baseUrl}/leads`,
              leadData,
              { headers },
            );
          }
  
          if (operation === 'update') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            const leadData = this.getNodeParameter('leadData', i, {}) as object;
  
            responseData = await axios.post(
              `${credentials.baseUrl}/leads/${leadId}`,
              leadData,
              { headers },
            );
          }
  
          if (operation === 'delete') {
            const leadId = this.getNodeParameter('leadId', i) as string;
  
            responseData = await axios.post(
              `${credentials.baseUrl}/leads/${leadId}/delete`,
              {},
              { headers },
            );
          }
  
          returnData.push({
            json: responseData?.data || {},
          });
        } catch (error) {
          returnData.push({
            json: { error: error.message },
          });
        }
      }
  
      return [returnData];
    }
  }
  