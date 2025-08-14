export interface SequenceItemModel{
    plugin: string,
    module: string,
    form: string,
    formId?: string,
    arguments: SequenceItemArgumentModel[]
}
export interface SequenceItemArgumentModel{
    name: string,
    isBound: boolean,
    boundTo?: string,
    default?: unknown,
}