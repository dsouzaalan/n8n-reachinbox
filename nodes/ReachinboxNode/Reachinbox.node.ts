import {
  IHookFunctions,
  INodeInputConfiguration,
  INodeOutputConfiguration,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
  NodeConnectionType,
  NodeOperationError
} from 'n8n-workflow';

import axios from 'axios';

export class Reachinbox implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ReachInbox Node',
    name: 'reachInbox',
    group: ['trigger'],
    version: 1,
    description: 'Trigger node for ReachInbox events',
    defaults: {
      name: 'ReachInbox Trigger',
    },
    inputs: ['main'] as (NodeConnectionType | INodeInputConfiguration)[],
    outputs: ['main'] as (NodeConnectionType | INodeOutputConfiguration)[],
    credentials: [
      {
        name: 'reachinboxApi',
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
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'All Events', value: 'ALL_EVENTS' },
          { name: 'Email Sent', value: 'EMAIL_SENT' },
          { name: 'Lead Interested', value: 'LEAD_INTERESTED' },
          { name: 'Lead Not Interested', value: 'LEAD_NOT_INTERESTED' },
          { name: 'Email Bounced', value: 'EMAIL_BOUNCED' },
          { name: 'Email Opened', value: 'EMAIL_OPENED' },
          { name: 'Email Link Clicked', value: 'EMAIL_LINK_CLICKED' },
          { name: 'Reply Received', value: 'REPLY_RECEIVED' },
          { name: 'Campaign Completed', value: 'CAMPAIGN_COMPLETED' },
        ],
        default: 'EMAIL_SENT',
        required: true,
        description: 'Event type to listen for from ReachInbox',
      },
      {
        displayName: 'Campaign ID',
        name: 'campaignId',
        type: 'string',
        default: '0',
        description: 'Set to 0 to receive events from all campaigns',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        return false; // Always re-register for now
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const credentials = await this.getCredentials('reachinboxApi');

        let eventType: string;
        let campaignId: string;

        try {
          eventType = this.getNodeParameter('eventType', 0) as string;
          campaignId = this.getNodeParameter('campaignId', 0) as string;
        } catch (error) {
          throw new NodeOperationError(this.getNode(), 'Missing required parameters: eventType or campaignId');
        }

        const webhookUrl = this.getNodeWebhookUrl('default');

        await axios.post('https://api.reachinbox.ai/webhook/subscribe', {
          event: eventType,
          campaignId,
          callbackUrl: webhookUrl,
          integrationType: 'N8N',
          allCampaigns: campaignId === '0',
        }, {
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
          },
        });

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const credentials = await this.getCredentials('reachinboxApi');

        let eventType: string;
        let campaignId: string;

        try {
          eventType = this.getNodeParameter('eventType', 0) as string;
          campaignId = this.getNodeParameter('campaignId', 0) as string;
        } catch (error) {
          throw new NodeOperationError(this.getNode(), 'Missing required parameters: eventType or campaignId');
        }

        const webhookUrl = this.getNodeWebhookUrl('default');

        await axios.delete('https://api.reachinbox.ai/webhook/delete', {
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
          },
          data: {
            event: eventType,
            campaignId,
            callbackUrl: webhookUrl,
            allCampaigns: campaignId === '0',
          },
        });

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData();
    console.log('[ReachInbox] Webhook Triggered:', JSON.stringify(body));
    return {
      workflowData: [[{ json: body }]],
    };
  }
}