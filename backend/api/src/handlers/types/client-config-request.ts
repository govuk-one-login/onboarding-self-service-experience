export type clientConfigRequest = {
    client_name: string;
    public_key: string;
    redirect_uris: string[];
    contacts: string[];
    scopes: string[];
    subject_type: string;
    service_type: string;
    sector_identifier_uri: string;
    accepted_levels_of_confidence: [];
};
