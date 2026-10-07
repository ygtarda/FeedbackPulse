export class WebhookEndpointEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly url: string,
    public readonly secret: string,
    public readonly events: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
