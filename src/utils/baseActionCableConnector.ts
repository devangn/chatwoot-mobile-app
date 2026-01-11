import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';

// Lazy-load cable instance to avoid "runtime not ready" errors
// Only create it when actually needed (after runtime is ready)
let cableInstance: Cable | null = null;
function getCable(): Cable {
  if (!cableInstance) {
    cableInstance = new Cable({});
  }
  return cableInstance;
}

const channelName = 'RoomChannel';
const PRESENCE_INTERVAL = 20000;

export interface ActionCableEvent<T = unknown> {
  event: string;
  data: T;
}

class BaseActionCableConnector {
  protected events: { [key: string]: (data: unknown) => void };
  protected accountId: number;

  constructor(pubSubToken: string, webSocketUrl: string, accountId: number, userId: number) {
    const connectActionCable = ActionCable.createConsumer(webSocketUrl);

    const channel = getCable().setChannel(
      channelName,
      connectActionCable.subscriptions.create(
        {
          channel: channelName,
          pubsub_token: pubSubToken,
          account_id: accountId,
          user_id: userId,
        },
        {
          updatePresence(): void {
            this.perform('update_presence');
          },
        },
      ),
    );

    channel.on('received', this.onReceived);
    channel.on('connected', this.handleConnected);
    channel.on('disconnect', this.handleDisconnected);

    this.events = {};
    this.accountId = accountId;

    setInterval(() => {
      getCable().channel(channelName).perform('update_presence');
    }, PRESENCE_INTERVAL);
  }

  protected isAValidEvent = (data: unknown): boolean => {
    const { account_id } = data as { account_id: number };
    return this.accountId === account_id;
  };

  private onReceived = ({ event, data }: ActionCableEvent = { event: '', data: null }): void => {
    if (this.isAValidEvent(data)) {
      if (this.events[event] && typeof this.events[event] === 'function') {
        this.events[event](data);
      }
    }
  };

  private handleConnected = (): void => {
    console.log('Connected to ActionCable');
  };

  private handleDisconnected = (): void => {
    console.log('Disconnected from ActionCable');
  };
}

export default BaseActionCableConnector;
