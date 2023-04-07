import { Socket } from 'net';

export interface ClientHost {
   enabled: boolean;
   host: string;
   port: number;
   clients?: Socket[];
}

export interface ClientMessage {
   enabled: boolean;
   format: 'hex' | 'ascii' | 'binary';
   message: string;
   name: string;
}

export interface ClientReport {
   host: string;
   sockets: number;
   messages: number;
   received: number;
   data: number;
}

export interface ServerPort {
   enabled: boolean;
   port: number;
}

export interface ServerReport {
   port: number;
   sockets: number;
   data: number;
   messages: number;
}
