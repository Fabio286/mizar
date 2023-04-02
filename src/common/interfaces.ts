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

export interface ServerPort {
   enabled: boolean;
   port: number;
}
