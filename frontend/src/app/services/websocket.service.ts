import { Injectable, signal } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private isConnected = signal(false);
  
  public newTicketNotification = new Subject<any>();
  public boardUpdateNotification = new Subject<any>();
  public statusUpdateNotification = new Subject<any>();

  constructor() {
    this.connect();
  }

  connect() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/api/ws/tickets',
      onConnect: () => {
        this.isConnected.set(true);
        console.log('WebSocket connected');
        this.subscribe();
      },
      onDisconnect: () => {
        this.isConnected.set(false);
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      reconnectDelay: 5000
    });

    this.client.activate();
  }

  private subscribe() {
    if (!this.client) return;

    // Subscribe to new tickets
    this.client.subscribe('/topic/tickets', (message: Message) => {
      const ticket = JSON.parse(message.body);
      this.newTicketNotification.next(ticket);
    });

    // Subscribe to status updates
    this.client.subscribe('/topic/tickets/status', (message: Message) => {
      const ticket = JSON.parse(message.body);
      this.statusUpdateNotification.next(ticket);
    });

    // Subscribe to board updates
    this.client.subscribe('/topic/board', (message: Message) => {
      this.boardUpdateNotification.next(message.body);
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  send(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    }
  }

  isConnectedSignal() {
    return this.isConnected;
  }
}
