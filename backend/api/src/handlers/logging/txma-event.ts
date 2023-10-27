export interface TxMAEvent {
    timestamp: number;
    event_name: string;
    component_id: string;
    session_id: string;
    user?: TxMAUser;
    extensions?: TxMAExtension;
}

export interface TxMAUser {
    ip_address?: string;
    user_id?: string;
    email?: string;
    phone?: string;
}

export interface TxMAExtension {
    session_id?: string;
    session_name?: string;
    outcome?: string;
    credential_type?: string;
}
