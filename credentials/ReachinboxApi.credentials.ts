import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ReachinboxApi implements ICredentialType {
	name = 'reachInboxApi';
	displayName = 'Reachinbox Credentials API';
	documentationUrl = 'https://docs.reachinbox.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.reachinbox.ai',
		},
	];
}
