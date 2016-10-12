// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/f595687773d7204e3b3f55da364ddf16fe76a9ac/notie/notie.d.ts
type notieAlertType = "success" | "warning" | "error" | "info";
interface INotieInputOptions{
    autocapitalize?: 'words' | 'none',
    autocomplete?: 'on' | 'off',
    autocorrect?: 'on' | 'off',
    autofocus?: boolean,
    inputmode?: 'latin' | 'verbatim',
    max?: number,
    maxlength?: number,
    min?: number,
    minlength?: number,
    placeholder?: string,
    spellcheck?: boolean,
    step?: number | 'any',
    type?: string,
    allowed?: any,
    prefilledValue?: string
}
declare var notie: {
    alert: (type: notieAlertType, message: string, seconds?: number) => void
    confirm: (title: string, yes_text: string, no_text: string, yes_callback: () => void) => void
    input: (options:INotieInputOptions,
            title: string,
            confirm:string,
            deny:string,
            submit?: (valueEntered) => void,
            cancel?: (valueEntered) => void,
    )=> void,
    force: (type: notieAlertType, message: string, accept: string, accept_callback?: () => void) => void
};
declare module "notie" {
    export = notie;
}