import * as React from 'react';

import './Select.css';

interface Props {
    label: string;
    name: string;
    onChange: (e: any) => any;
    options: Array<{ label: string; value: string | number }>;
    selected: string | number;
}

export default class Select extends React.Component<Props> {
    render() {
        const { label, name, onChange, options, selected } = this.props;
        return (
            <label className="sc-select-c">
                <span>{label}</span>
                <select name={name} onChange={onChange} value={selected}>
                    {options.map(opt => {
                        return (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        );
                    })}
                </select>
            </label>
        );
    }
}
