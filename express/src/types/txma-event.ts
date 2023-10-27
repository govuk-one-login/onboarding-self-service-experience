interface TxMAEvent {
    timestamp: number;
    event_name: string;
    component_id: string;
    session_id: string;
    user: TxMAUser;
    extensions?: TxMAExtension;
}
