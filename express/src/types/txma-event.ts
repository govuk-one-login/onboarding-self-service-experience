interface TxMAEvent {
    timestamp: number;
    event_name: string;
    component_id: string;
    session_id: string;
    user: TxMAUser;
    extensions?: TxMAExtension;
}

interface TxMAUser {
    ip_address: string;
    user_id?: string;
    email?: string;
    phone?: string;
}

interface TxMAExtension {
    service_id?: string;
    service_name?: string;
    outcome?: string;
    credential_type?: string;
}
