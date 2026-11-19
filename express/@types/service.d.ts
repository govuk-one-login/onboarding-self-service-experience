export interface ServiceFromDynamo {
    pk: {S: string};
    sk: {S: string};
    data: {S: string};
    service_name: {S: string};
}

export interface Service {
    id: string;
    serviceName: string;
}
