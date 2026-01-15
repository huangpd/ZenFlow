declare module 'react-quill-new' {
    import React from 'react';
    export interface ReactQuillProps {
        theme?: string;
        value?: string;
        onChange?: (value: string) => void;
        className?: string;
        placeholder?: string;
        modules?: any;
        formats?: string[];
        readOnly?: boolean;
    }
    export default class ReactQuill extends React.Component<ReactQuillProps> { }
}
